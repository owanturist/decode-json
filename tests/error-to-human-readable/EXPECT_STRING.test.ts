/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectString } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _0 = Optional(ExpectString(true))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL STRING but actual value is

    true`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectString([1.2, 3.4]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting a STRING but actual value is

    [
        1.2,
        3.4
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectString(1.23))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting a STRING but actual value is

    1.23`
  )
})
