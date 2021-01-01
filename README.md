# JSON in TypeScript

Using TypeScript is a great way to prevent some bugs during compile time but nothing can save us from runtime exceptions. Today "height" field coming from the `GET /tallest-building` endpoint is a `number` and you call `.toFixed(2)` to format it but next day it becomes a preformatted `string` and the app crashes with `toFixed is not a function`. The same thing could happen when an application uses `localStorage` and somebody changes a format to keep credentials token or last opened product information - value exists so you assume that it is valid but runtime error will make you unhappy very soon. Sounds familiar, doesn't?

As a little attempt to workaround the issue we can try to protect our programs from unexpected data to come. To do so we should be able to explain what data we expect and how it should be interpreted.

This package helps you to convert JSON or unknown values to TypeScript safe structures.

## Installation

```bash
# with npm
npm install decode-json --save

# with yarn
yarn install decode-json
```

## Example

Let assume you are building a Star Wars fan wep application and you'd like to request Luke Skywalker's data from [swapi.dev/api/people/1](https://swapi.dev/api/people/1). You will get something like that:

```json
{
  "name": "Luke Skywalker",
  "birth_year": "19BBY",
  "height": "172",
  "mass": "77"
}
```

For now the app only needs to know name and birth year of a character so that's how it can be decoded safely:

```ts
import Decode from 'decode-json'

const characterDecoder = Decode.shape({
  name: Decode.field('name').string,
  birthYear: Decode.field('birth_year').string
})

const response = await fetch('https://swapi.dev/api/people/1')
const data = await response.json()
const decodeResult = characterDecoder.decode(response)
```

The decoder above does next steps:

1. tries to extract a value from `name` field of the `response`
1. checks that extracted `name` value is a string
1. tries to extract a value from `birth_year` field of the `response`
1. checks that extracted `birth_year` value is a string
1. creates an output object with field `name` and `birthYear` with values assigned respectively.

If a response reflects our expectations so the results for `swapi.dev/api/people/1` will look like:

```ts
const decodeResult = {
  value: {
    name: 'Luke Skywalker',
    birthYear: '19BBY'
  }
}
```

But as soon as one of the 1-4 steps fails you will get a detailed report why it happened. Let's say the server sends birth year as a number but not a string for some reason. Here is what you'll get when `"19BBY"` string becomes `19093823` number:

```ts
const decodeResult = {
  error: {
    type: 'IN_FIELD',
    field: 'birth_year',
    error: {
      type: 'EXPECT_STRING',
      source: 19093823
    }
  }
}
```

And the trick is that by using a decoder a developer assumes that decode result might be either succeed or failed but not blindly trust that with `200` status code you'll get a valid data. So there is no way for the developer to ignore the awareness of failure but only handle the case somehow. Is not it amazing concept?

## API

### `DecodeResult`

This is what you always get as result of running both [`Decoder.decode`](#DecoderDecode) and [`Decoder.decodeJson`](#DecoderDecodeJson) methods. It can be either `{ value: T }` when a decoding has been successfully passed or `{ error: E }` when any of decode, parsee json or runtime error occurs.

```ts
import Decode, { Decoder, DecodeResult, DecodeError } from 'decode-json'

const ageDecoder: Decoder<number> = Decode.field('age').int
const badResult = ageDecoder.decode('oops') // == { error: { type: 'EXPECT_OBJECT', source: 'oops' } }
const goodResult = ageDecoder.decode({ age: 27 }) // == { value: 27 }
```

### `Decoder`

This is a declarative block of decode system which knows how to transform an expected data to a final result.

```ts
import Decode, { Decoder } from 'decode-json'

interface User {
  id: string
  nickname: string
  active: boolean
  age: number
}

const userDecoder: Decoder<User> = Decode.shape({
  id: Decode.field('uuid').string,
  nickname: Decode.field('username').string,
  active: Decode.field('is_active').boolean,
  age: Decode.field('age').number
})
```

#### `Decoder.map`

Transforms decoded value. It can both keep the same type or change to another one:

```ts
import Decode, { Decoder } from 'decode-json'

const messageDecoder: Decoder<string> = Decode.string.map(message =>
  message.trim()
)
const charCountDecoder: Decoder<number> = Decode.string.map(
  message => message.trim().length
)
```

#### `Decoder.chain`

Transforms decoded value decoder. You can turn a decoder to fail using this method. Very useful to validate some data:

```ts
import Decode, { Decoder } from 'decode-json'

const messageDecoder: Decoder<string> = Decode.string.chain(message => {
  if (message.length >= 100) {
    return Decode.succeed(message)
  }

  return Decode.fail(
    `An input message has only ${message.length} characters long but at least 100 is required`
  )
})
```

#### `Decoder.decode`

Runs a decoder on unknown input data:

```ts
import Decode from 'decode-json'

Decode.boolean.decode('I am unknown input').error
// == { type: 'EXPECT_BOOLEAN', source: 'I am unknown input' }

Decode.boolean.decode(false).value // == false
```

#### `Decoder.decodeJson`

Runs a decoder on JSON string. Does the same as [`Decoder.decode`](#DecoderDecode) but parses JSON first:

```ts
import Decode from 'decode-json'

Decode.string.decodeJson('I am just a string').error
// == {
//   type: 'INVALID_JSON',
//   error: new SyntaxError('Unexpected token I in JSON at position 0'),
//   source: 'I am just a string'
// }

const goodJson = Decode.string.decodeJson('"I am a JSON string"').value
// == 'I am a JSON string'
```

### `Decode.string`

Decodes a string value:

```ts
import Decode from 'decode-json'

Decode.string.decode(true).error // == { type: 'EXPECT_STRING', source: true }
Decode.string.decode(1234).error // == { type: 'EXPECT_STRING', source: 1234 }
Decode.string.decode(12.3).error // == { type: 'EXPECT_STRING', source: 12.3 }
Decode.string.decode('hi').value // == 'hi'
```

### `Decode.boolean`

Decodes a boolean value:

```ts
import Decode from 'decode-json'

Decode.boolean.decode(1234).error // == { type: 'EXPECT_BOOLEAN', source: 1234 }
Decode.boolean.decode(12.3).error // == { type: 'EXPECT_BOOLEAN', source: 12.3 }
Decode.boolean.decode('hi').error // == { type: 'EXPECT_BOOLEAN', source: 'hi' }
Decode.boolean.decode(true).value // true
```

### `Decode.int`

Decodes an integer value:

```ts
import Decode from 'decode-json'

Decode.int.decode(true).error // == { type: 'EXPECT_INT', source: true }
Decode.int.decode('hi').error // == { type: 'EXPECT_INT', source: 'hi' }
Decode.int.decode(12.3).error // == { type: 'EXPECT_INT', source: 12.3 }
Decode.int.decode(1234).value // 1234
```

### `Decode.float`

Decodes a float value:

```ts
import Decode from 'decode-json'

Decode.float.decode(true).error // == { type: 'EXPECT_FLOAT', source: true }
Decode.float.decode('hi').error // == { type: 'EXPECT_FLOAT', source: 'hi' }
Decode.float.decode(12.3).value // 12.3
Decode.float.decode(1234).value // 1234
```

### `Decode.unknown`

Does not do anything with an incoming value, just bring it into TS as a unknown. This can be useful if you have particularly complex data that you would like to deal with later. Or if you are going to send it out a http request and do not care about its structure. Decoding of unknown never fails.

```ts
import Decode from 'decode-json'

Decode.unknown.decode(window.location).value // == window.location
```

### `Decode.exact`

Decodes an exact primitive (either `string`, `number`, `boolean` or `null`) values.

```ts
import Decode from 'decode-json'

const pointDecoder = Decode.shape({
  type: Decode.field('type').exact('POINT'),
  x: Decode.field('axis_x').float,
  y: Decode.field('axis_y').float
})
```

Might be used with [`Decode.oneOf`](#DecodeOneOf) to build enum decoders:

```ts
import Decode, { Decoder } from 'decode-json'

enum Role {
  User,
  Manager,
  Admin
}

const roleDecoder: Decoder<Role> = Decode.oneOf([
  Decode.exact('USER', Role.User),
  Decode.exact('MANAGER', Role.Manager),
  Decode.exact('ADMIN', Role.Admin)
])
```

### `Decode.record`

Decodes a key-value pairs as object:

```ts
import Decode, { Decoder } from 'decode-json'

const activeUsers: Decoder<Record<string, boolean>> = Decode.record(
  Decode.boolean
)

activeUsers.decode({
  John: false,
  Martin: false,
  Scott: true
}).value // == { John: false, Martin: false, Scott: true }

activeUsers.decode({
  John: false,
  Martin: false,
  Scott: 'yes'
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'Scott',
//   error: {
//     type: 'EXPECT_BOOLEAN',
//     source: 'yes'
//   }
// }
```

### `Decode.list`

Decodes a list of values:

```ts
import Decode, { Decoder } from 'decode-json'

interface User {
  id: number
  username: string
}

const userDecoder: Decoder<User> = Decode.shape({
  id: Decode.field('id').int,
  username: Decode.field('user_name').string
})

Decode.list(userDecoder).decode([
  {
    id: 0,
    user_name: 'superstar'
  },
  {
    id: 1,
    user_name: 'boss'
  }
]).value // == [{ id: 0, username: 'superstar' }, { id: 1, username: 'boss' }]

Decode.list(userDecoder).decode([
  {
    id: 0,
    user_name: 'lollypop'
  },
  {
    id: 1,
    name: 'boss'
  }
]).error
// == {
//   type: 'AT_INDEX',
//   position: 1,
//   error: {
//     type: 'REQUIRED_FIELD',
//     name: 'username',
//     source: {
//       id: 1,
//       name: 'boss'
//     }
//   }
// }
```

### `Decode.keyValue`

Decodes key-value pairs as list of tuples:

```ts
import Decode, { Decoder } from 'decode-json'

const activeUsers: Decoder<Array<[string, boolean]>> = Decode.keyValue(
  Decode.boolean
)

activeUsers.decode({
  John: false,
  Martin: false,
  Scott: true
}).value // == [[ 'John', false ], [ 'Martin', false ], [ 'Scott', true ]]

activeUsers.decode({
  John: false,
  Martin: false,
  Scott: 'yes'
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'Scott',
//   error: {
//     type: 'EXPECT_BOOLEAN',
//     source: 'yes'
//   }
// }
```

You also safely convert a key value from string to something else:

```ts
import Decode, { Decoder } from 'decode-json'

enum Currency {
  Rub,
  Eur,
  Usd
}

const currencyFromCode = (code: string): Currency => {
  switch (code) {
    case 'rub':
      return { value: Currency.Rub }
    case 'eur':
      return { value: Currency.Eur }
    case 'usd':
      return { value: Currency.Usd }
    default: {
      error: `Unknown currency code "${code}"`
    }
  }
}

const balance: Decoder<Array<[Currency, number]>> = Decode.keyValue(
  currencyFromCode,
  Decode.float
)

activeUsers.decode({
  rub: 42000.1,
  eur: 2400.87,
  usd: 13000.51
}).value
// == [
//   [ Currency.Rub', 42000.1 ],
//   [ Currency.Eur, 2400.87 ],
//   [ Currency.Usd, 13000.51 ]
// ]

activeUsers.decode({
  rub: 42000.1,
  eur: 2400.87,
  usd: 13000.51,
  cny: 7912.08
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'cny',
//   error: {
//     type: 'FAILURE',
//     message: 'Unknown currency code cny'
//     source: 'cny'
//   }
// }
```

### `Decode.record`

Combines decoded values to the corresponding object's fields:

```ts
import Decode, { Decoder } from 'decode-json'

interface User {
  id: string
  nickname: string
  active: boolean
  age: number
}

const userDecoder: Decoder<User> = Decode.shape({
  id: Decode.field('uuid').string,
  nickname: Decode.field('username').string,
  active: Decode.field('is_active').boolean,
  age: Decode.field('age').number
})

userDecoder.decode({
  uuid: 'user_12319238',
  username: 'wolverine',
  is_active: false,
  age: 61
}).value
// == {
//   id: 'user_12319238',
//   nickname: 'wolverine',
//   active: false,
//   age: 61
// }

userDecoder.decode({
  uuid: 'user_12319238',
  username: 'wolverine',
  is_active: 'yes',
  age: 61
}).error
// == {
//   type: 'IN_FIELD',
//   field: 'is_active',
//   error: {
//     type: 'EXPECT_BOOLEAN',
//     source: 'yes'
//   }
// }
```

> _Note_: `Decode.record` **does not** decode any value! It only combines another decoders' values.

> You also notice that shape's fields does describe any path fragments for assigned decoders - these are only destinations of decoded values.
