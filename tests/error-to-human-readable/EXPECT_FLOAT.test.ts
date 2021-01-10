/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectFloat } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _0 = Optional(ExpectFloat(true))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL FLOAT but actual value is

    true`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectFloat([1.2, 3.4]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting a FLOAT but actual value is

    [
        1.2,
        3.4
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectFloat('1.23'))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting a FLOAT but actual value is

    "1.23"`
  )
})
