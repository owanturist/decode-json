# decode-json

![Coverage Status](https://img.shields.io/coveralls/github/owanturist/decode-json/master.svg)
![Minified + gzip](https://flat.badgen.net/bundlephobia/minzip/decode-json)
![Dependency count](https://flat.badgen.net/bundlephobia/dependency-count/decode-json)
![Known Vulnerabilities](https://snyk.io/test/github/owanturist/decode-json/badge.svg?style=flat-square)
![Types](https://flat.badgen.net/npm/types/decode-json)
![Total downloads](https://flat.badgen.net/npm/dt/decode-json)

> The package you are about to use has been done under inspiration of [Elm lang](https://elm-lang.org/) and [elm/json](https://package.elm-lang.org/packages/elm/json/latest/) package particularly.

Using TypeScript is a great way to prevent some bugs during compile time but nothing can save us from runtime exceptions. Today "height" field coming from the `GET /tallest-building` endpoint is a `number` and you call `.toFixed(2)` to format it but next day it becomes a preformatted `string` and the app crashes with `toFixed is not a function`. The same thing could happen when an application uses `localStorage` and somebody changes a format to keep credentials token or last opened product information - value exists so you assume that it is valid but runtime error will make you unhappy very soon. Sounds familiar, doesn't?

As a little attempt to workaround the issue we can try to protect our programs from unexpected data to come. To do so we should be able to explain what data we expect and how it should be transformed so an application can use it.

## Installation

```bash
# with npm
npm install decode-json --save

# with yarn
yarn install decode-json
```

```ts
// with skypack
import Decode, { Decoder } from 'https://cdn.skypack.dev/decode-json'
import errorToHumanReadable from 'https://cdn.skypack.dev/decode-json/error-to-human-readable'

// minifield version
import Decode, { Decoder } from 'https://cdn.skypack.dev/decode-json?min'
import errorToHumanReadable from 'https://cdn.skypack.dev/decode-json/error-to-human-readable?min'
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
const characterResult = characterDecoder.decode(data)
```

The decoder above does next steps:

1. tries to extract a value from `name` field of the `response` and checks the value is a string
1. tries to extract a value from `birth_year` field of the `response` and checks the value is a string
1. tries to extract a value from `height` field of the `response` and parses the value as a float
1. tries to extract a value from `mass` field of the `response` and parses the value as a float
1. creates an output object with field `name`, `birthYear`, `height` and `mass` with values assigned respectively.

If a response reflects our expectations so the results for `swapi.dev/api/people/1` will look like:

```ts
characterDecoder.decode(data)
// == {
//   value: {
//     name: 'Luke Skywalker',
//     birthYear: '19BBY',
//     height: 172,
//     mass: 77
//   }
// }
```

But as soon as one of the 1-4 steps fails you will get a detailed report why it happened. Let's say the server sends birth height as a formatted string with a unit for some reason. Here is what you'll get when `"172"` string becomes `"172 cm"`:

```ts
characterDecoder.decode(data)
// == {
//   error: {
//     type: 'IN_FIELD',
//     field: 'height',
//     error: {
//       type: 'FAILURE',
//       message: 'Could not parse "172 cm" as a float',
//       source: '172 cm'
//     }
//   }
// }
```

And the trick is that by using a decoder a developer assumes that decode result might be either succeed or failed but not blindly trust that with `200` status code you'll get a valid data. So there is no way for the developer to ignore the awareness of failure but only handle the case somehow. Is not it an amazing concept?

## API

- [`DecodeResult`](#decoderesult)
- [`Decoder`](#decoder)
  - [`Decoder.map`](#decodermap)
  - [`Decoder.chain`](#decoderchain)
  - [`Decoder.decode`](#decoderdecode)
  - [`Decoder.decodeJson`](#decoderdecodejson)
- `Decode`
  - [`Decode.string`](#decodestring)
  - [`Decode.boolean`](#decodeboolean)
  - [`Decode.int`](#decodeint)
  - [`Decode.float`](#decodefloat)
  - [`Decode.unknown`](#decodeunknown)
  - [`Decode.exact`](#decodeexact)
  - [`Decode.record`](#decoderecord)
  - [`Decode.list`](#decodelist)
  - [`Decode.keyValue`](#decodekeyvalue)
  - [`Decode.record`](#decoderecord)
  - [`Decode.tuple`](#decodetuple)
  - [`Decode.oneOf`](#decodeoneof)
  - [`Decode.lazy`](#decodelazy)
  - [`Decode.fail`](#decodefail)
  - [`Decode.succeed`](#decodesucceed)
  - [`Decode.field`](#decodefield)
  - [`Decode.index`](#decodeindex)
  - [`Decode.optional`](#decodeoptional)
- `DecodeOptional`
  - [`DecodeOptional.string`](#decodeoptionalstring)
  - [`DecodeOptional.boolean`](#decodeoptionalboolean)
  - [`DecodeOptional.int`](#decodeoptionalint)
  - [`DecodeOptional.float`](#decodeoptionalfloat)
  - [`DecodeOptional.list`](#decodeoptionallist)
  - [`DecodeOptional.record`](#decodeoptionalrecord)
  - [`DecodeOptional.keyValue`](#decodeoptionalkeyvalue)
  - [`DecodeOptional.field`](#decodeoptionalfield)
  - [`DecodeOptional.index`](#decodeoptionalindex)
- [`RequiredDecodePath`](#requireddecodepath)
- [`OptionalDecodePath`](#optionaldecodepath)
- [`DecodeError`](#decodeerror)
  - [`EXPECT_STRING`](#expect_string)
  - [`EXPECT_BOOLEAN`](#expect_boolean)
  - [`EXPECT_FLOAT`](#expect_float)
  - [`EXPECT_INT`](#expect_int)
  - [`EXPECT_EXACT`](#expect_exact)
  - [`EXPECT_ARRAY`](#expect_array)
  - [`EXPECT_OBJECT`](#expect_object)
  - [`FAILURE`](#failure)
  - [`REQUIRED_INDEX`](#required_index)
  - [`REQUIRED_FIELD`](#required_field)
  - [`AT_INDEX`](#at_index)
  - [`IN_FIELD`](#in_field)
  - [`OPTIONAL`](#optional)
  - [`ONE_OF`](#one_of)
  - [`RUNTIME_EXCEPTION`](#runtime_exception)
- [`DecodeJsonError`](#decodejsonerror)
  - [`INVALID_JSON`](#invalid_json)

### `DecodeResult`

This is what you always get as result of running both [`Decoder.decode`](#decoderdecode) and [`Decoder.decodeJson`](#decoderdecodejson) methods. It can be either `{ value: T }` when a decoding has been successfully passed or `{ error: E }` when any of decode, json parse or runtime error occur.

```ts
import Decode, { Decoder, DecodeResult, DecodeError } from 'decode-json'

const ageDecoder: Decoder<number> = Decode.field('age').int
const badResult = ageDecoder.decode('oops')
// == { error: { type: 'EXPECT_OBJECT', source: 'oops' } }
const goodResult = ageDecoder.decode({ age: 27 }) // == { value: 27 }
```

It's recommended to avoid destructuring assignment for `DecodeResult` because TypeScript won't help you with error handling:

```ts
const { error, value } = ageDecoder.decode({ age: 27 })

if (error) {
  showError(error)
} else {
  showAge(value) // TS complains with "Object is possibly 'undefined'"
}
```

To workaround the issue just don't use destructuring assignment:

```ts
const ageResult = ageDecoder.decode({ age: 27 })

if (ageResult.error) {
  showError(ageResult.error)
} else {
  showAge(ageResult.value) // no complains here
}
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

Runs a decoder on JSON string. Does the same as [`Decoder.decode`](#decoderdecode) but parses JSON first:

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

pointDecoder.decode({
  type: 'LINE',
  x0: 1.2,
  y0: 3.4,
  x1: 5.6,
  x1: 7.8
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'type',
//   error: {
//     type: 'EXPECT_EXACT',
//     value: 'POINT',
//     source: 'LINE'
//   }
// }
```

Might be used with [`Decode.oneOf`](#decodeoneof) to build enum decoders:

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
//     name: 'user_name',
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
//   type: 'FAILURE',
//   message: 'Unknown currency code "cny"'
//   source: 'cny'
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

const pointDecoder: Decoder<[number, number]> = Decode.tuple(
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
  uuid: 'uuid-id-is-here',
  username: 'Ross',
  isActive: true,
  age: 32
}).value
// == {
//   id: 'uuid-id-is-here',
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

Ignores a decoding value and make the decoder fail. This is handy when used with [`Decode.oneOf`](#decodeoneof) or [`Decoder.chain`](#decoderchain) where you want to give a custom error message in some cases.

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

> _Note_: see [`Decode.oneOf`](#decodeoneof) and [`Decoder.chain`](#decoderchain) for more examples.

### `Decode.succeed`

Ignores a decoding value and produce a certain value. Handy when used with [`Decode.oneOf`](#decodeoneof) or [`Decoder.chain`](#decoderchain).

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

> _Note_: see [`Decode.oneOf`](#decodeoneof) and [`Decoder.chain`](#decoderchain) for more examples.

### `Decode.field`

Creates a [`RequiredDecodePath`](#requireddecodepath) instance.

```ts
import Decode, { RequiredDecodePath } from 'decode-json'

const currentUserPath: RequiredDecodePath = Decode.field('current_user')
```

### `Decode.index`

Creates a [`RequiredDecodePath`](#requireddecodepath) instance.

```ts
import Decode, { RequiredDecodePath } from 'decode-json'

const secondPointPath: RequiredDecodePath = Decode.index(1)
```

### `Decode.optional`

Creates `DecodeOptional` instance.

### `DecodeOptional.string`

Behaves exactly as [`Decode.string`](#decodestring) but decodes `null` and `undefined` as `null`:

```ts
import Decode from 'decode-json'

Decode.optional.string.decode(1234).error
// == {
//   type: 'OPTIONAL',
//   error: { type: 'EXPECT_STRING', source: 1234 }
// }
Decode.optional.string.decode(null).value // == null
Decode.optional.string.decode(undefined).value // == null
Decode.optional.string.decode('hi').value // == 'hi'
```

### `DecodeOptional.boolean`

Behaves exactly as [`Decode.boolean`](#decodeboolean) but decodes `null` and `undefined` as `null`:

```ts
import Decode from 'decode-json'

Decode.optional.boolean.decode(1234).error
// == {
//   type: 'OPTIONAL',
//   error: { type: 'EXPECT_BOOLEAN', source: 1234 }
// }
Decode.optional.boolean.decode(null).value // == null
Decode.optional.boolean.decode(undefined).value // == null
Decode.optional.boolean.decode(true).value // == true
```

### `DecodeOptional.int`

Behaves exactly as [`Decode.int`](#decodeint) but decodes `null` and `undefined` as `null`:

```ts
import Decode from 'decode-json'

Decode.optional.int.decode(12.3).error
// == {
//   type: 'OPTIONAL',
//   error: { type: 'EXPECT_INT', source: 12.3 }
// }
Decode.optional.int.decode(null).value // == null
Decode.optional.int.decode(undefined).value // == null
Decode.optional.int.decode(1234).value // == 1234
```

### `DecodeOptional.float`

Behaves exactly as [`Decode.float`](#decodefloat) but decodes `null` and `undefined` as `null`:

```ts
import Decode from 'decode-json'

Decode.optional.float.decode(false).error
// == {
//   type: 'OPTIONAL',
//   error: { type: 'EXPECT_FLOAT', source: false }
// }
Decode.optional.float.decode(null).value // == null
Decode.optional.float.decode(undefined).value // == null
Decode.optional.float.decode(12.3).value // == 12.3
```

### `DecodeOptional.list`

Behaves exactly as [`Decode.list`](#decodelist) but decodes `null` and `undefined` as `null`:

```ts
import Decode, { Decoder } from 'decode-json'

const idsDecoder: Decoder<null | Array<number>> = Decode.optional.list(
  Decode.int
)

idsDecoder.decode(null).value // == null
idsDecoder.decode(undefined).value // == null
idsDecoder.decode([0, 2, 3]).value // == [ 0, 2, 3 ]
```

Note that `optional` statement here is assigned to `list` decoder, but not to it's items, so this one will fail:

```ts
idsDecoder.decode([ 0, null, 2, 3 ]).error
{
  type: 'OPTIONAL',
  error: {
    type: 'AT_INDEX',
    position: 1,
    error: { type: 'EXPECT_INT', source: null }
  }
}
```

If you expect both array and the items to be optional you can do it like that:

```ts
import Decode, { Decoder } from 'decode-json'

const idsDecoder: Decoder<null | Array<null | number>> = Decode.optional.list(
  Decode.optional.int
)

idsDecoder.decode(null).value // === null
idsDecoder.decode([0, null, 2, 3]).value // === [ 0, null, 2, 3 ]
```

### `DecodeOptional.record`

Behaves exactly as [`Decode.record`](#decoderecord) but decodes `null` and `undefined` as `null`:

```ts
import Decode, { Decoder } from 'decode-json'

const blackListDecoder: Decoder<null | Record<
  string,
  boolean
>> = Decode.optional.record(Decode.boolean)

blackListDecoder.decode(null).value // == null
blackListDecoder.decode(undefined).value // == null
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true
}).value
// == {
//   John: false,
//   Emma: true,
//   Tom: true
// }
```

Note that `optional` statement here is assigned to `record` decoder, but not it's items, so this one will fail:

```ts
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true,
  Adam: null
}).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'IN_FIELD',
//     name: 'Adam',
//     error: { type: 'EXPECT_BOOLEAN', source: null }
//   }
// }
```

If you expect both object and the items to be optional you can do it like that:

```ts
import Decode, { Decoder } from 'decode-json'

const blackListDecoder: Decoder<null | Record<
  string,
  null | boolean
>> = Decode.optional.record(Decode.boolean)

blackListDecoder.decode(null).value // === null
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true,
  Adam: null
}).value
// == {
//   John: false,
//   Emma: true,
//   Tom: true,
//   Adam: null
// }
```

### `DecodeOptional.keyValue`

Behaves exactly as [`Decode.keyValue`](#decodekeyvalue) but decodes `null` and `undefined` as `null`:

```ts
import Decode, { Decoder } from 'decode-json'

const blackListDecoder: Decoder<null | Array<
  [string, boolean]
>> = Decode.optional.keyValue(Decode.boolean)

blackListDecoder.decode(null).value // == null
blackListDecoder.decode(undefined).value // == null
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true
}).value
// == [
//   [ 'John', false ],
//   [ 'Emma', true ],
//   [ 'Tom', true ]
// ]
```

Note that `optional` statement here is assigned to `keyValue` decoder, but not to it's items, so this one will fail:

```ts
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true,
  Adam: null
}).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'IN_FIELD',
//     name: 'Adam',
//     error: { type: 'EXPECT_BOOLEAN', source: null }
//   }
// }
```

If you expect both object and the items to be optional you can do it like that:

```ts
import Decode, { Decoder } from 'decode-json'

const blackListDecoder: Decoder<null | Array<
  [string, null | boolean]
>> = Decode.optional.keyValue(Decode.optional.boolean)

blackListDecoder.decode(null).value // === null
blackListDecoder.decode({
  John: false,
  Emma: true,
  Tom: true,
  Adam: null
}).value
// == [
//   [ 'John', false ],
//   [ 'Emma', true ],
//   [ 'Tom', true ],
//   [ 'Adam', null ]
// ]
```

### `DecodeOptional.field`

Creates an [`OptionalDecodePath`](#optionaldecodepath) instance.

```ts
import Decode, { OptionalDecodePath } from 'decode-json'

const nameFieldDecoder: OptionalDecodePath = Decode.optional.field('name')
```

### `DecodeOptional.index`

Creates an [`OptionalDecodePath`](#optionaldecodepath) instance.

```ts
import Decode, { OptionalDecodePath } from 'decode-json'

const headDecoder: OptionalDecodePath = Decode.optional.index(0)
```

### `RequiredDecodePath`

It provides an API to build decoders for some specific path described with [`Decoder.field`](#decoderfield) and [`Decoder.index`](#decoderindex):

```ts
import Decode from 'decode-json'

const pointDecoder = Decode.tuple(
  Decode.field('x').float,
  Decode.field('y').float
)

Decode.field('center').of(pointDecoder).decode([1, 2, 3]).error
// == {
//   type: 'EXPECT_OBJECT',
//   source: [ 1, 2, 3 ]
// }

Decode.field('center').of(pointDecoder).decode({ name: 'John' }).error
// == {
//   type: 'REQUIRED_FIELD',
//   name: 'center',
//   source: { name: 'John' }
// }

Decode.field('center')
  .of(pointDecoder)
  .decode({
    center: { x: 1.2 }
  }).error
// == {
//   type: 'IN_FIELD',
//   name: 'center',
//   error: {
//     type: 'REQUIRED_FIELD',
//     name: 'y',
//     source: { x: 1.2 }
//   }
// }

Decode.field('center')
  .of(pointDecoder)
  .decode({
    center: { x: 1.2, y: 3.4 }
  }).value // == [ 1.2, 3.4 ]
```

The same idea works for `RequiredDecodePath.index`:

```ts
import Decode from 'decode-json'

Decode.index(0).int.decode({}).error
// == {
//   type: 'EXPECT_ARRAY',
//   source: {}
// }

Decode.index(0).int.decode([]).error
// == {
//   type: 'REQUIRED_INDEX',
//   position: 0,
//   source: []
// }

Decode.index(0).int.decode([null]).error
// == {
//   type: 'AT_INDEX',
//   position: 0,
//   error: { type: 'EXPECT_INT', source: null }
// }

Decode.index(0).int.decode([42]).value // == 42
```

### `OptionalDecodePath`

It provides an API to build decoders for some specific path described with [`DecodeOptional.field`](#decodeoptionalfield) and [`DecodeOptional.index`](#decodeoptionalindex):

```ts
import Decode from 'decode-json'

const pointDecoder = Decode.tuple(
  Decode.field('x').float,
  Decode.field('y').float
)

Decode.optional
  .field('center')
  .of(pointDecoder)
  .decode({
    center: { x: 1.2 }
  }).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'IN_FIELD',
//     name: 'center',
//     error: {
//       type: 'REQUIRED_FIELD',
//       name: 'y',
//       source: { x: 1.2 }
//     }
//   }
// }

Decode.optional
  .field('center')
  .of(pointDecoder)
  .decode({
    center: { x: 1.2, y: 3.4 }
  }).value // == [ 1.2, 3.4 ]
```

Note that `optional` statement here is assigned to `.field` or `.index`, so this one will fail:

```ts
import Decode from 'decode-json'

Decode.optional.field('name').string.decode({ name: null }).error
{
  type: 'OPTIONAL',
  error: {
    type: 'IN_FIELD',
    name: 'name',
    error: { type: 'EXPECT_STRING', source: null }
  }
}
```

But won't for this inputs:

```ts
import Decode from 'decode-json'

Decode.optional.field('name').string.decode(null).value // == null
Decode.optional.field('name').string.decode({}).value // == null
Decode.optional.field('name').string.decode({ name: 'Peter' }).value // == 'Peter'
```

Another words are `OptionalDecodePath.field` expects that object with field is optional, but not a value of the field. If you expect the value is optional too you do:

```ts
import Decode from 'decode-json'

Decode.optional.field('name').optional.string.decode({ name: null }).value // == null
```

The same idea works for `OptionalDecodePath.index`:

```ts
import Decode from 'decode-json'

Decode.optional.index(0).int.decode(null).value // == null
Decode.optional.index(0).int.decode([]).value // == null
Decode.optional.index(0).int.decode([42]).value // == 42
Decode.optional.index(0).int.decode([null]).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'AT_INDEX',
//     position: 0,
//     error: { type: 'EXPECT_INT', source: null }
//   }
// }

Decode.optional.index(0).optional.int.decode([null]).value // == null
```

### `DecodeError`

A set of errors describe what went wrong during decoding of unknown value with [`Decoder.decode`](#decoderdecode). The error consist of plain JavaScript data types such as strings, numbers, objects and arrays so it can be stringified to JSON without any information losses. It might be helpful for sending to tracking tools as part of report or to display friendly message in UI with [`error-to-human-readable.ts`](/src/error-to-human-readable.ts). You can always build your own functions for error formatting.

#### `EXPECT_STRING`

Signature:

```ts
// not exported
type ExpectStringError = {
  type: 'EXPECT_STRING'
  source: unknown
}
```

Occurs when `source` fails a check to be a string:

```ts
import Decode from 'decode-json'

Decode.string.decode(123).error
// == {
//   type: 'EXPECT_STRING',
//   source: 123
// }
```

#### `EXPECT_BOOLEAN`

Signature:

```ts
// not exported
type ExpectBooleanError = {
  type: 'EXPECT_BOOLEAN'
  source: unknown
}
```

Occurs when `source` fails a check to be a boolean value:

```ts
import Decode from 'decode-json'

Decode.string.decode('I am a string').error
// == {
//   type: 'EXPECT_BOOLEAN',
//   source: 'I am a string'
// }
```

#### `EXPECT_FLOAT`

Signature:

```ts
// not exported
type ExpectFloatError = {
  type: 'EXPECT_FLOAT'
  source: unknown
}
```

Occurs when `source` fails a check to be a float number:

```ts
import Decode from 'decode-json'

Decode.int.decode(false).error
// == {
//   type: 'EXPECT_FLOAT',
//   source: false
// }
```

#### `EXPECT_INT`

Signature:

```ts
// not exported
type ExpectIntError = {
  type: 'EXPECT_INT'
  source: unknown
}
```

Occurs when `source` fails a check to be an integer number:

```ts
import Decode from 'decode-json'

Decode.int.decode(12.3).error
// == {
//   type: 'EXPECT_INT',
//   source: 12.3
// }
```

#### `EXPECT_EXACT`

Signature:

```ts
// not exported
type ExpectExactError = {
  type: 'EXPECT_EXACT'
  value: string | number | boolean | null
  source: unknown
}
```

Occurs when `source` is not equal to `value`:

```ts
import Decode from 'decode-json'

Decode.exact('ADMIN').decode('admin').error
// == {
//   type: 'EXPECT_EXACT',
//   value: 'ADMIN',
//   source: 'admin'
// }

const theWorstYear = new Date(2020, 0, 1)

Decode.exact(2020, theWorstYear).decode(2021).error
// == {
//   type: 'EXPECT_EXACT',
//   value: 2020,
//   source: 2021
// }
```

#### `EXPECT_ARRAY`

Signature:

```ts
// not exported
type ExpectArrayError = {
  type: 'EXPECT_ARRAY'
  source: unknown
}
```

Occurs when `source` fails a check to be an array:

```ts
import Decode from 'decode-json'

Decode.list(Decode.int).decode({ title: 'NY times' }).error
// == {
//   type: 'EXPECT_ARRAY',
//   source: { title: 'NY times' }
// }

Decode.index(2).boolean.decode({ name: 'Boris' }).error
// == {
//   type: 'EXPECT_ARRAY',
//   source: { name: 'Boris' }
// }
```

#### `EXPECT_OBJECT`

Signature:

```ts
// not exported
type ExpectObjectError = {
  type: 'EXPECT_OBJECT'
  source: unknown
}
```

Occurs when `source` fails a check to be an object:

```ts
import Decode from 'decode-json'

Decode.record(Decode.int).decode([1, 2, 3]).error
// == {
//   type: 'EXPECT_OBJECT',
//   source: [ 1, 2, 3 ]
// }

Decode.keyValue(Decode.string).decode(`Let's rock!`).error
// == {
//   type: 'EXPECT_OBJECT',
//   source: 'Let\'s rock!'
// }

Decode.field('length').boolean.decode([true, false]).error
// == {
//   type: 'EXPECT_OBJECT',
//   source: [ true, false ]
// }
```

#### `FAILURE`

Signature:

```ts
// not exported
type FailureError = {
  type: 'FAILURE'
  message: string
  source: unknown
}
```

Occurs either when [`Decode.fail`](#decodefail) run into decoding or when key converting in [`Decode.keyValue`](#decodekeyvalue) (or [`DecodeOptional.keyValue`](#decodeoptionalkeyvalue)) fails.

```ts
import Decode from 'decode-json'

Decode.int
  .chain(num => {
    if (num > 0) {
      return Decode.succeed(num)
    }

    return Decode.fail('Expect positive integer')
  })
  .decode(-1).error
// == {
//   type: 'FAILURE',
//   message: 'Expect positive integer',
//   source: -1
// }

Decode.keyValue(key => {
  const num = parseInt(key, 10)

  if (!isNaN(num)) {
    return Decode.succeed(num)
  }

  return Decode.fail('Could not convert string to integer')
}, Decode.string).decode({
  1: 'first',
  2: 'second',
  _3: 'third'
})
// == {
//   type: 'FAILURE',
//   message: 'Could not convert string to integer',
//   source: '_3'
// }
```

#### `REQUIRED_INDEX`

Signature:

```ts
// not exported
type RequiredIndexError = {
  type: 'REQUIRED_INDEX'
  position: number
  source: Array<unknown>
}
```

Occurs when [`Decode.index`](#decodeindex) could not reach an element at a required `position` of a `source` array.

```ts
import Decode from 'decode-json'

Decode.index(2).boolean.decode([true, false]).error
// == {
//   type: 'REQUIRED_INDEX',
//   position: 2,
//   source: [ true, false ]
// }
```

#### `REQUIRED_FIELD`

Signature:

```ts
// not exported
type RequiredFieldError = {
  type: 'REQUIRED_FIELD'
  name: string
  source: Record<string, unknown>
}
```

Occurs when [`Decode.field`](#decodefield) could not reach a field by `name` in a `source` object.

```ts
import Decode from 'decode-json'

Decode.field('age').int.decode({
  id: 123,
  name: 'Tom'
}).error
// == {
//   type: 'REQUIRED_FIELD',
//   name: 'age',
//   source: { id: 123, name: 'Tom' }
// }
```

#### `AT_INDEX`

Signature:

```ts
// not exported
type AtIndexError = {
  type: 'AT_INDEX'
  position: number
  error: DecodeError
}
```

Occurs when a decoding fails with an `error` at some specific array's element at `position`:

```ts
import Decode from 'decode-json'

Decode.list(Decode.int).decode([1, 2, 2.5]).error
// == {
//   type: 'AT_INDEX',
//   position: 2,
//   error: {
//     type: 'EXPECT_INT',
//     source: 2.5
//   }
// }

Decode.index(2).boolean.decode([false, true, 'ok']).error
// == {
//   type: 'AT_INDEX',
//   position: 2,
//   error: {
//     type: 'EXPECT_BOOLEAN',
//     source: 'ok'
//   }
// }
```

#### `IN_FIELD`

Signature:

```ts
// not exported
type InFieldError = {
  type: 'IN_FIELD'
  name: string
  error: DecodeError
}
```

Occurs when a decoding fails with an `error` in some specific object's field with `name`:

```ts
import Decode from 'decode-json'

Decode.record(Decode.int).decode({
  one: 1,
  two: 2,
  three: '3rd'
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'three',
//   error: {
//     type: 'EXPECT_INT',
//     source: '3rd'
//   }
// }

Decode.keyValue(Decode.string).decode({
  Russia: 'Moscow',
  Netherlands: 'Amsterdam',
  USA: null
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'USA',
//   error: {
//     type: 'EXPECT_STRING',
//     source: null
//   }
// }

Decode.field('is_active').boolean.decode({
  id: 123,
  name: 'Carl',
  is_active: 'no'
}).error
// == {
//   type: 'IN_FIELD',
//   name: 'is_active',
//   error: {
//     type: 'EXPECT_BOOLEAN',
//     source: 'no'
//   }
// }
```

#### `OPTIONAL`

Signature:

```ts
// not exported
type OptionalDecodeError = {
  type: 'OPTIONAL'
  error: DecodeError
}
```

Indicates that an `error` occurs for an optional path or value:

```ts
import Decode from 'decode-json'

Decode.optional.int.decode(1.23).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'EXPECT_INT',
//     source: 1.23
//   }
// }

Decode.optional.field('lat').float.decode({
  lng: 123.45,
  lat: null
}).error
// == {
//   type: 'OPTIONAL',
//   error: {
//     type: 'IN_FIELD',
//     name: 'lat',
//     error: {
//       type: 'EXPECT_FLOAT',
//       source: null
//     }
//   }
// }
```

#### `ONE_OF`

Signature:

```ts
// not exported
type OneOfError = {
  type: 'ONE_OF'
  errors: Array<DecodeError>
}
```

Occurs when none of [`Decode.oneOf`](#decodeoneof) decoders passes with `errors` from each of the decoders:

```ts
import Decode from 'decode-json'

Decode.oneOf([
  Decode.tuple(
    // for coordinates as object
    Decode.field('lat').float,
    Decode.field('lng').float
  ),

  Decode.tuple(
    // for coordinates as array
    Decode.index(0).float,
    Decode.index(1).float
  )
]).decode({ lat: 1.23, lon: 4.56 }).error
// == {
//   type: 'ONE_OF',
//   errors: [
//     {
//       type: 'REQUIRED_FIELD',
//       name: 'lng',
//       source: { lat: 1.23, lon: 4.56 }
//     },
//     {
//       type: 'EXPECT_ARRAY',
//       source: { lat: 1.23, lon: 4.56 }
//     }
//   ]
// }
```

#### `RUNTIME_EXCEPTION`

Signature:

```ts
type RuntimeException = {
  type: 'RUNTIME_EXCEPTION'
  error: Error
}
```

Occurs when something unexpected happens while decoding is running so you should never worry about wrapping a decoder to `try..catch` because it does it for you automatically in runtime and TypeScript take care about correct usage during compile time.

### `DecodeJsonError`

A set of errors describe what went wrong during decoding of JSON string with [`Decoder.decodeJson`](#decoderdecodejson). The set is a union of [`DecodeError`](#decodeerror) with one more specific error for parse json exception.

#### `INVALID_JSON`

Signature:

```ts
type RuntimeException = {
  type: 'INVALID_JSON'
  error: SyntaxError
  source: string
}
```

Occurs when [`Decoder.decodeJson`](#decoderdecodejson) tries to decode invalid JSON string:

```ts
import Decode from 'decode-json'

Decode.string.decodeJson('I am just a string').error
// == {
//   type: 'INVALID_JSON',
//   error: new SyntaxError('Unexpected token I in JSON at position 0'),
//   source: 'I am just a string'
// }
```
