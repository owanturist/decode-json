/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../src/error-to-human-readable'
import {
  InvalidJson,
  RuntimeException,
  Optional,
  OneOf,
  InField,
  AtIndex,
  Failure,
  RequiredField,
  RequiredIndex,
  ExpectString,
  ExpectBoolean,
  ExpectInt,
  ExpectFloat,
  ExpectObject,
  ExpectArray,
  ExpectEnums
} from './error'

test('INVALID_JSON', t => {
  const source = 'invalid JSON'
  let err: SyntaxError = new Error()

  try {
    JSON.parse(source)
  } catch (jsonError) {
    err = jsonError
  }

  const _0 = InvalidJson(err, source)
  t.is(
    errorToHumanReadable(_0),
    `JSON parse error: Unexpected token i in JSON at position 0.

    invalid JSON`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `JSON parse error: Unexpected token i in JSON at position 0.

  invalid JSON`
  )
})

test('ONE_OF', t => {
  const _0 = OneOf([])
  t.is(errorToHumanReadable(_0), `Ran into oneOf with no possibilities`)

  const _1 = InField('foo', _0)
  t.is(
    errorToHumanReadable(_1),
    `Ran into oneOf with no possibilities at _.foo`
  )

  const _2 = AtIndex(123, _0)
  t.is(
    errorToHumanReadable(_2),
    `Ran into oneOf with no possibilities at _[123]`
  )

  const _4 = OneOf([InField('foo', ExpectString([123]))])
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _.foo
Expecting a STRING but actual value is

    [
        123
    ]`
  )

  const _5 = AtIndex(82, _4)
  t.is(
    errorToHumanReadable(_5),
    `Problem with a value at _[82].foo
Expecting a STRING but actual value is

    [
        123
    ]`
  )

  const _6 = OneOf([
    InField('bar', ExpectArray({ baz: 'str' })),
    OneOf([
      AtIndex(81, ExpectBoolean(123)),
      Optional(InField('foo', ExpectInt(false)))
    ])
  ])
  t.is(
    errorToHumanReadable(_6),
    `All possibilities of oneOf failed in the following 2 ways:

    (1) Problem with a value at _.bar
    Expecting an ARRAY but actual value is

        {
            "baz": "str"
        }

    (2) All possibilities of oneOf failed in the following 2 ways:

        (1) Problem with a value at _[81]
        Expecting a BOOLEAN but actual value is

            123

        (2) Problem with a value at _.foo
        Expecting an INTEGER but actual value is

            false`
  )

  const _7 = InField('baz', _6)
  t.is(
    errorToHumanReadable(_7),
    `All possibilities of oneOf at _.baz failed in the following 2 ways:

    (1) Problem with a value at _.baz.bar
    Expecting an ARRAY but actual value is

        {
            "baz": "str"
        }

    (2) All possibilities of oneOf at _.baz failed in the following 2 ways:

        (1) Problem with a value at _.baz[81]
        Expecting a BOOLEAN but actual value is

            123

        (2) Problem with a value at _.baz.foo
        Expecting an INTEGER but actual value is

            false`
  )
})

test('RUNTIME_EXCEPTION', t => {
  const _0 = RuntimeException(new Error('Something went wrong'))
  t.is(
    errorToHumanReadable(_0),
    `Unexpected runtime error:

    Something went wrong`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `Unexpected runtime error:

  Something went wrong`
  )

  const _1 = Optional(_0)
  t.is(
    errorToHumanReadable(_1),
    `Unexpected runtime error:

    Something went wrong`
  )

  const _2 = InField('foo', _0)
  t.is(
    errorToHumanReadable(_2),
    `Unexpected runtime error at _.foo:

    Something went wrong`
  )

  const _3 = InField('!_#(@*', _0)
  t.is(
    errorToHumanReadable(_3),
    `Unexpected runtime error at _['!_#(@*']:

    Something went wrong`
  )

  const _4 = AtIndex(23, _0)
  t.is(
    errorToHumanReadable(_4),
    `Unexpected runtime error at _[23]:

    Something went wrong`
  )
})

test('REQUIRED_FIELD', t => {
  const _0 = RequiredField('foo', { bar: [123] })
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `Problem with the given value
Expecting an OBJECT with a FIELD named 'foo':

  {
    "bar": [
      123
    ]
  }`
  )

  const _1 = Optional(_0)
  t.is(
    errorToHumanReadable(_1),
    `Problem with the given value
Expecting an OBJECT with a FIELD named 'foo':

    {
        "bar": [
            123
        ]
    }`
  )

  const _2 = InField('bar', _0)
  t.is(
    errorToHumanReadable(_2),
    `Problem with a value at _.bar
Expecting an OBJECT with a FIELD named 'foo':

    {
        "bar": [
            123
        ]
    }`
  )

  const _3 = AtIndex(83, _0)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _[83]
Expecting an OBJECT with a FIELD named 'foo':

    {
        "bar": [
            123
        ]
    }`
  )
})

test('REQUIRED_INDEX', t => {
  const _0 = RequiredIndex(42, [{ bar: 123 }])
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `Problem with the given value
Expecting an ARRAY with an ELEMENT at [42] but only see 1 entries:

  [
    {
      "bar": 123
    }
  ]`
  )

  const _1 = Optional(_0)
  t.is(
    errorToHumanReadable(_1),
    `Problem with the given value
Expecting an ARRAY with an ELEMENT at [42] but only see 1 entries:

    [
        {
            "bar": 123
        }
    ]`
  )

  const _2 = InField('bar', _0)
  t.is(
    errorToHumanReadable(_2),
    `Problem with a value at _.bar
Expecting an ARRAY with an ELEMENT at [42] but only see 1 entries:

    [
        {
            "bar": 123
        }
    ]`
  )

  const _3 = AtIndex(83, _0)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _[83]
Expecting an ARRAY with an ELEMENT at [42] but only see 1 entries:

    [
        {
            "bar": 123
        }
    ]`
  )
})

test('FAILURE', t => {
  const template =
    'Custom message at {path} or {context} is:\n\n{json}\n\n{value}\n\n{source}'

  const _0 = Failure(template, undefined)
  t.is(
    errorToHumanReadable(_0),
    `Custom message at _ or _ is:

    undefined

    undefined

    undefined`
  )

  const _1 = Failure(template, {
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Custom message at _ or _ is:

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_2),
    `Custom message at _.bar or _.bar is:

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_3),
    `Custom message at _[83] or _[83] is:

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_STRING', t => {
  const _0 = ExpectString(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting a STRING but actual value is

    undefined`
  )

  const _1 = ExpectString({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting a STRING but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL STRING but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting a STRING but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting a STRING but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_BOOLEAN', t => {
  const _0 = ExpectBoolean(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting a BOOLEAN but actual value is

    undefined`
  )

  const _1 = ExpectBoolean({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting a BOOLEAN but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL BOOLEAN but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting a BOOLEAN but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting a BOOLEAN but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_INT', t => {
  const _0 = ExpectInt(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an INTEGER but actual value is

    undefined`
  )

  const _1 = ExpectInt({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting an INTEGER but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL INTEGER but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting an INTEGER but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting an INTEGER but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_FLOAT', t => {
  const _0 = ExpectFloat(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting a FLOAT but actual value is

    undefined`
  )

  const _1 = ExpectFloat({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting a FLOAT but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL FLOAT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting a FLOAT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting a FLOAT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_OBJECT', t => {
  const _0 = ExpectObject(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OBJECT but actual value is

    undefined`
  )

  const _1 = ExpectObject({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting an OBJECT but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL OBJECT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting an OBJECT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting an OBJECT but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_ARRAY', t => {
  const _0 = ExpectArray(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an ARRAY but actual value is

    undefined`
  )

  const _1 = ExpectArray({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting an ARRAY but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting an OPTIONAL ARRAY but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting an ARRAY but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting an ARRAY but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test('EXPECT_ENUMS', t => {
  const _0 = ExpectEnums(['str', false, 123, null], undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting ENUMS "str"|false|123|null but actual value is

    undefined`
  )

  const _1 = ExpectEnums(['str', false, 123, null], {
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting ENUMS "str"|false|123|null but actual value is

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _2 = Optional(_1)
  t.is(
    errorToHumanReadable(_2),
    `Problem with the given value
Expecting OPTIONAL ENUMS "str"|false|123|null but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _3 = InField('bar', _1)
  t.is(
    errorToHumanReadable(_3),
    `Problem with a value at _.bar
Expecting ENUMS "str"|false|123|null but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _4 = AtIndex(83, _1)
  t.is(
    errorToHumanReadable(_4),
    `Problem with a value at _[83]
Expecting ENUMS "str"|false|123|null but actual value is

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _5 = ExpectEnums([], {
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_5, { indent: 2 }),
    `Ran into enums with no possibilities

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )

  const _6 = Optional(_5)
  t.is(
    errorToHumanReadable(_6),
    `Ran into enums with no possibilities

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _7 = InField('bar', _5)
  t.is(
    errorToHumanReadable(_7),
    `Ran into enums with no possibilities at _.bar

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )

  const _8 = AtIndex(83, _5)
  t.is(
    errorToHumanReadable(_8),
    `Ran into enums with no possibilities at _[83]

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})
