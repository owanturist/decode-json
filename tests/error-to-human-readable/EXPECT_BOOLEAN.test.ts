/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectBoolean } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _0 = Optional(ExpectBoolean(1.23))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL BOOLEAN but actual value is

    1.23`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectBoolean([{ bar: false }]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting a BOOLEAN but actual value is

    [
        {
            "bar": false
        }
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectBoolean([null]))

  t.is(
    errorToHumanReadable(_0, { indent: 0 }),
    `Problem with a value at _[83]
Expecting a BOOLEAN but actual value is

[null]`
  )
})
