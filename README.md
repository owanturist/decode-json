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

This is how it can be decoded safely:

```ts
import Decode, { Decoder } from 'decode-json'

const parseFloatDecoder: Decoder<number> = Decode.oneOf([
  Decode.float, // in case the value is float already
  Decode.string.chain(str => {
    const num = Number(str || '_') // prevents Number('') === 0

    if (isNaN(num)) {
      return Decode.fail(`Could not parse "${str}" as a float`)
    }

    return Decode.succeed(num)
  })
])

const characterDecoder = Decode.shape({
  name: Decode.field('name').string,
  birthYear: Decode.field('birth_year').string,
  height: Decode.field('height').of(parseFloatDecoder),
  mass: Decode.field('mass').of(parseFloatDecoder)
})

const response = await fetch('https://swapi.dev/api/people/1')
const data = await response.json()
const decodeResult = characterDecoder.decode(response)
```

The decoder above does next steps:

1. tries to extract a value from `name` field of the `response` and checks the value is a string
1. tries to extract a value from `birth_year` field of the `response` and checks the value is a string
1. tries to extract a value from `height` field of the `response` and parses the value as a float
1. tries to extract a value from `mass` field of the `response` and parses the value as a float
1. creates an output object with field `name`, `birthYear`, `height` and `mass` with values assigned respectively.

If a response reflects our expectations so the results for `swapi.dev/api/people/1` will look like:

```ts
const decodeResult = {
  value: {
    name: 'Luke Skywalker',
    birthYear: '19BBY',
    height: 172,
    mass: 77
  }
}
```

But as soon as one of the 1-4 steps fails you will get a detailed report why it happened. Let's say the server sends birth height as a formatted string with a unit for some reason. Here is what you'll get when `"172"` string becomes `172 cm` number:

```ts
const decodeResult = {
  error: {
    type: 'IN_FIELD',
    field: 'height',
    error: {
      type: 'FAILURE',
      message: 'Could not parse "172 cm" as a float',
      source: '172 cm'
    }
  }
}
```

And the trick is that by using a decoder a developer assumes that decode result might be either succeed or failed but not blindly trust that with `200` status code you'll get a valid data. So there is no way for the developer to ignore the awareness of failure but only handle the case somehow. Is not it an amazing concept?

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
  age: Decode.field('age').int
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

Transforms decoded value decoder:

```ts
import Decode, { Decoder } from 'decode-json'

const displayDateDecoder: Decoder<string> = Decode.field(
  'active'
).boolean.chain(active => {
  return active
    ? Decode.field('last_activity').string
    : Decode.field('start_date').string
})

displayDateDecoder.decode({
  active: false,
  last_activity: '30 sec ago',
  start_date: '1 Sep 2020'
}).value // == '1 Sep 2020'

displayDateDecoder.decode({
  active: true,
  last_activity: '30 sec ago',
  start_date: '1 Sep 2020'
}).value // == '30 sec ago'
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

Decode.string.decode(null).error // == { type: 'EXPECT_STRING', source: null }
Decode.string.decode(true).error // == { type: 'EXPECT_STRING', source: true }
Decode.string.decode(1234).error // == { type: 'EXPECT_STRING', source: 1234 }
Decode.string.decode(12.3).error // == { type: 'EXPECT_STRING', source: 12.3 }
Decode.string.decode('hi').value // == 'hi'
```

### `Decode.boolean`

Decodes a boolean value:

```ts
import Decode from 'decode-json'

Decode.boolean.decode(null).error // == { type: 'EXPECT_BOOLEAN', source: null }
Decode.boolean.decode(1234).error // == { type: 'EXPECT_BOOLEAN', source: 1234 }
Decode.boolean.decode(12.3).error // == { type: 'EXPECT_BOOLEAN', source: 12.3 }
Decode.boolean.decode('hi').error // == { type: 'EXPECT_BOOLEAN', source: 'hi' }
Decode.boolean.decode(true).value // true
```

### `Decode.int`

Decodes an integer value:

```ts
import Decode from 'decode-json'

Decode.int.decode(null).error // == { type: 'EXPECT_INT', source: null }
Decode.int.decode(true).error // == { type: 'EXPECT_INT', source: true }
Decode.int.decode('hi').error // == { type: 'EXPECT_INT', source: 'hi' }
Decode.int.decode(12.3).error // == { type: 'EXPECT_INT', source: 12.3 }
Decode.int.decode(1234).value // 1234
```

### `Decode.float`

Decodes a float value:

```ts
import Decode from 'decode-json'

Decode.float.decode(null).error // == { type: 'EXPECT_FLOAT', source: null }
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
  age: Decode.field('age').int
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

### `Decode.tuple`

Combines decoded values to the corresponding tuple segments:

```ts
import Decode, { Decoder } from 'decode-json'

const pointDecoder: Decoder<[string, number]> = Decode.tuple(
  Decode.field('x').float,
  Decode.field('y').float
)

pointDecoder.decode({
  x: 12.34,
  y: 56.78
}).value // == [ 12.34, 56.78 ]

pointDecoder.decode({
  x: 12.34,
  y: '56.78'
}).error
// == {
//   type: 'IN_FIELD',
//   field: 'y',
//   error: {
//     type: 'EXPECT_FLOAT',
//     source: '56.78'
//   }
// }
```

> _Note_: `Decode.tuple` **does not** decode any value! It only combines another decoders' values.

> You also notice that tuple's segments does describe any path fragments for assigned decoders - these are only destinations of decoded values.

### `Decode.field`

Creates a [`RequiredDecodePath`](#RequiredDecodePath) instance.

```ts
import Decode, { RequiredDecodePath } from 'decode-json'

const currentUserPath: RequiredDecodePath = Decode.field('current_user')
const currentUserIdPath: RequiredDecodePath = currentUserPath.field('id')

currentUserIdPath.string.decode({
  current_user: {
    id: 'kjn32',
    name: 'Daria'
  }
}).value // == 'kjn32'

currentUserIdPath.string.decode({
  current_user: {
    id: 2302,
    name: 'Daria'
  }
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'current_user',
//   error: {
//     type: 'IN_FIELD',
//     name: 'id',
//     error: {
//       type: 'EXPECT_STRING',
//       source: 2302
//     }
//   }
// }
```

### `Decode.index`

Creates a [`RequiredDecodePath`](#RequiredDecodePath) instance.

```ts
import Decode, { RequiredDecodePath } from 'decode-json'

const secondPointPath: RequiredDecodePath = Decode.index(1)
const secondPointXPath: RequiredDecodePath = secondPointPath.index(0)

secondPointXPath.float.decode([
  [0.32, 1.03],
  [8.79, 7.54],
  [2.93, 4.13]
]).value // == 8.79

currentUserIdPath.string.decode([
  ['0.32', '1.03'],
  ['8.79', '7.54'],
  ['2.93', '4.13']
]).error
// == {
//   type: 'AT_INDEX',
//   position: 1',
//   error: {
//     type: 'AT_INDEX',
//     position: 0',
//     error: {
//       type: 'EXPECT_FLOAT',
//       source: '8.79'
//     }
//   }
// }
```

### `Decode.oneOf`

Try a bunch of different decoders. This can be useful if the values may come in a couple different formats.

```ts
import Decode, { Decoder } from 'decode-json'

const dateDecoder: Decoder<Date> = Decode.oneOf([
  Decode.int.map(timestamp => new Date(timestamp)),
  Decode.string.chain(datetime => {
    const date = new Date(datetime)

    if (isNaN(date.getMilliseconds())) {
      return Decode.fail(`Could not create a date from "${datetime}"`)
    }

    return Decode.succeed(date)
  })
])

dateDecoder.decode(1609542413856).value // == new Date('Fri, 01 Jan 2021 23:06:53 GMT')
dateDecoder.decode('Fri, 01 Jan 2021 23:06:53 GMT').value // == new Date(1609542413856)
dateDecoder.decode('01|01|2021').error
// == {
//   type: 'ONE_OF',
//   errors: [
//     {
//       type: 'EXPECT_INT',
//       source: '01|01|2021'
//     },
//     {
//       type: 'FAILURE',
//       message: 'Could not create a date from "01|01|2021"',
//       source: '01|01|2021'
//     }
//   ]
// }
```

This is a powerful tool to work with inconsistent data:

```ts
import Decode, { Decoder } from 'decode-json'

interface User {
  id: string
  nickname: string
  active: boolean
  age: number
}

const userDecoder: Decoder<User> = Decode.oneOf([
  // legacy version
  Decode.shape({
    id: Decode.field('index').int.map(String),
    nickname: Decode.field('name').string,
    active: Decode.field('is_active').boolean,
    age: Decode.field('years').int
  }),

  // latest version
  Decode.shape({
    id: Decode.field('uuid').string,
    nickname: Decode.field('username').string,
    active: Decode.field('isActive').boolean,
    age: Decode.field('age').int
  })
])

userDecoder.decode({
  index: 0,
  name: 'Rachel',
  is_active: true,
  years: 30
}).value
// == {
//   id: '0',
//   nickname: 'Rachel',
//   active: true,
//   age: 30
// }

userDecoder.decode({
  uuid: 'dklasj23',
  username: 'Ross',
  isActive: true,
  age: 32
}).value
// == {
//   id: 'dklasj23',
//   nickname: 'Ross',
//   active: true,
//   age: 32
// }
```

It also can be used to set a default value if all of the decoders fails for whatever reason:

```ts
import Decode from 'decode-json'

const configDecoder = Decode.oneOf([
  Decode.shape({
    hostUrl: Decode.field('HOST_URL').string,
    apiVersion: Decode.field('API_VERSION').int
  }),

  Decode.succeed({
    hostUrl: 'localhost:8000',
    apiVersion: 1
  })
])

configDecoder.decode(null).value
// == {
//   hostUrl: 'localhost:8000',
//   apiVersion: 1
// }
```

### `Decode.lazy`

Sometimes you have a recursive data structures, like comments with responses, which also are comments with responses, which also... you got the point. To make sure a decoder unrolls lazily it should use `Decode.lazy` wrapper:

```ts
import Decode, { Decoder } from 'decode-json'

interface Comment {
  message: string
  responses: Array<Comment>
}

const commentDecoder: Decoder<Comment> = Decode.shape({
  message: Decode.field('mes').string,
  responses: Decode.field('res').list(Decode.lazy(() => commentDecoder))
})

commentDecoder.decode({
  mes: 'oops',
  res: [
    {
      mes: 'yes',
      res: [
        {
          mes: 'here we go again',
          res: []
        }
      ]
    },
    {
      mes: 'no',
      res: [
        {
          mes: 'that is right',
          res: [
            {
              mes: 'agree',
              res: []
            }
          ]
        }
      ]
    }
  ]
}).value
// == {
//   message: 'oops',
//   responses: [
//     {
//       message: 'yes',
//       responses: [
//         {
//           message: 'here we go again',
//           responses: []
//         }
//       ]
//     },
//     {
//       message: 'no',
//       responses: [
//         {
//           message: 'that is right',
//           responses: [
//             {
//               message: 'agree',
//               responses: []
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
```

### `Decode.fail`

Ignores a decoding value and make the decoder fail. This is handy when used with [`Decode.oneOf`](#DecodeOneOf) or [`Decoder.chain`](#DecoderChain) where you want to give a custom error message in some cases.

```ts
import Decode, { Decoder } from 'decode-json'

const positiveIntDecoder: Decoder<number> = Decode.int.chain(int => {
  if (int > 0) {
    return Decode.succeed(int)
  }

  return Decode.fail(`Expects positive int but get ${int} instead`)
})

positiveIntDecoder.decode(42).value // == 42

positiveIntDecoder.decode(-1).error
// == {
//   type: 'FAILURE',
//   message: 'Expects positive int but get -1 instead',
//   source: -1
// }
```

> _Note_: see [`Decode.oneOf`](#DecodeOneOf) and [`Decoder.chain`](#DecoderChain) for more examples.

### `Decode.succeed`

Ignores a decoding value and produce a certain value. Handy when used with [`Decode.oneOf`](#DecodeOneOf) or [`Decoder.chain`](#DecoderChain).

```ts
import Decode, { Decoder } from 'decode-json'

const messageDecoder: Decoder<string> = Decode.string.chain(message => {
  if (message.length >= 10) {
    return Decode.succeed(message)
  }

  return Decode.fail(
    `An input message is only ${message.length} chars long but at least 10 is required`
  )
})

messageDecoder.decode('Quite long message').value // == 'Quite long message'
messageDecoder.decode('Short').error
// == An input message is only 5 chars long but at least 10 is required
messageDecoder.decode(123).error // == { type: 'EXPECT_STRING', source: 123 }
```

Can be used to define hardcoded values.

```ts
import Decode, { Decoder } from 'decode-json'

const pointDecoder = Decoder.shape({
  x: Decode.index(0).float,
  y: Decode.index(1).float,
  z: Decode.succeed(0)
})

pointDecoder.decode([0.31, 8.17]).value // == { x: 0.31, y: 8.17, z: 0 }
```

> _Note_: see [`Decode.oneOf`](#DecodeOneOf) and [`Decoder.chain`](#DecoderChain) for more examples.

### `Decode.optional`

Creates [`OptionalDecoder`](#OptionalDecoder) instance.
