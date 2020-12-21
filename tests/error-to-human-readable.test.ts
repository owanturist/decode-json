/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../src/error-to-human-readable'
import {
  InvalidJson,
  RuntimeException,
  Optional,
  InField,
  AtIndex,
  ExpectString,
  ExpectBoolean,
  ExpectInt,
  ExpectFloat,
  ExpectObject,
  ExpectArray
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

test.todo('OPTIONAL')

test.todo('IN_FIELD')

test.todo('AT_INDEX')

test.todo('ONE_OF')

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

test.todo('REQUIRED_FIELD')

test.todo('REQUIRED_INDEX')

test.todo('FAILURE')

test('EXPECT_STRING', t => {
  const _0 = ExpectString(undefined)
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value.
Expecting a STRING but actual value is:

    undefined`
  )

  const _1 = ExpectString({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting a STRING but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL STRING but actual value is:

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
    `Problem with a value at _.bar.
Expecting a STRING but actual value is:

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
    `Problem with a value at _[83].
Expecting a STRING but actual value is:

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
    `Problem with the given value.
Expecting a BOOLEAN but actual value is:

    undefined`
  )

  const _1 = ExpectBoolean({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting a BOOLEAN but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL BOOLEAN but actual value is:

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
    `Problem with a value at _.bar.
Expecting a BOOLEAN but actual value is:

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
    `Problem with a value at _[83].
Expecting a BOOLEAN but actual value is:

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
    `Problem with the given value.
Expecting an INTEGER but actual value is:

    undefined`
  )

  const _1 = ExpectInt({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting an INTEGER but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL INTEGER but actual value is:

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
    `Problem with a value at _.bar.
Expecting an INTEGER but actual value is:

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
    `Problem with a value at _[83].
Expecting an INTEGER but actual value is:

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
    `Problem with the given value.
Expecting a FLOAT but actual value is:

    undefined`
  )

  const _1 = ExpectFloat({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting a FLOAT but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL FLOAT but actual value is:

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
    `Problem with a value at _.bar.
Expecting a FLOAT but actual value is:

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
    `Problem with a value at _[83].
Expecting a FLOAT but actual value is:

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
    `Problem with the given value.
Expecting an OBJECT but actual value is:

    undefined`
  )

  const _1 = ExpectObject({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting an OBJECT but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL OBJECT but actual value is:

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
    `Problem with a value at _.bar.
Expecting an OBJECT but actual value is:

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
    `Problem with a value at _[83].
Expecting an OBJECT but actual value is:

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
    `Problem with the given value.
Expecting an ARRAY but actual value is:

    undefined`
  )

  const _1 = ExpectArray({
    foo: [{ bar: 123 }]
  })
  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value.
Expecting an ARRAY but actual value is:

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
    `Problem with the given value.
Expecting an OPTIONAL ARRAY but actual value is:

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
    `Problem with a value at _.bar.
Expecting an ARRAY but actual value is:

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
    `Problem with a value at _[83].
Expecting an ARRAY but actual value is:

    {
        "foo": [
            {
                "bar": 123
            }
        ]
    }`
  )
})

test.todo('ENUMS')
