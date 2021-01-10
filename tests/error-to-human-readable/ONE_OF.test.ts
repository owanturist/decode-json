import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import {
  Optional,
  OneOf,
  InField,
  AtIndex,
  ExpectString,
  ExpectBoolean,
  ExpectInt,
  ExpectArray,
  ExpectExact
} from '../error'

test('empty variants', t => {
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

  const _3 = OneOf([_0])
  t.is(errorToHumanReadable(_3), `Ran into oneOf with no possibilities`)

  const _4 = OneOf([_0, _0])
  t.is(
    errorToHumanReadable(_4),
    `All possibilities of oneOf failed in the following 2 ways:

    (1) Ran into oneOf with no possibilities

    (2) Ran into oneOf with no possibilities`
  )
})

test('single variant', t => {
  const _0 = OneOf([InField('foo', ExpectString([123]))])

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.foo
Expecting a STRING but actual value is

    [
        123
    ]`
  )
  const _1 = OneOf([_0])

  t.is(
    errorToHumanReadable(_1),
    `Problem with a value at _.foo
Expecting a STRING but actual value is

    [
        123
    ]`
  )
})

test('nested', t => {
  const _0 = OneOf([
    InField('bar', ExpectArray({ baz: 'str' })),
    OneOf([
      AtIndex(81, ExpectBoolean(123)),
      Optional(InField('foo', ExpectInt(false)))
    ])
  ])
  t.is(
    errorToHumanReadable(_0),
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

  const _2 = InField('baz', _0)
  t.is(
    errorToHumanReadable(_2),
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

test('enum', t => {
  const _8 = OneOf([
    ExpectExact('USD', 'str'),
    ExpectExact('RUB', 'str'),
    ExpectExact('EUR', 'str')
  ])

  t.is(
    errorToHumanReadable(_8),
    `All possibilities of oneOf failed in the following 3 ways:

    (1) Problem with the given value
    Expecting an EXACT value "USD" but actual value is

        "str"

    (2) Problem with the given value
    Expecting an EXACT value "RUB" but actual value is

        "str"

    (3) Problem with the given value
    Expecting an EXACT value "EUR" but actual value is

        "str"`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('foo', ExpectBoolean([123]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.foo
Expecting a BOOLEAN but actual value is

    [
        123
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(82, ExpectInt(1.23))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[82]
Expecting an INTEGER but actual value is

    1.23`
  )
})
