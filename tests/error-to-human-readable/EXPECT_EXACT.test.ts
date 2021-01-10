/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectExact } from '../error'

test('standalone', t => {
  const _0 = ExpectExact('str', undefined)

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an EXACT value "str" but actual value is

    undefined`
  )

  const _1 = ExpectExact(false, {
    foo: [{ bar: 123 }]
  })

  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Problem with the given value
Expecting an EXACT value false but actual value is

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
  const _0 = Optional(ExpectExact(true, [true]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL EXACT value true but actual value is

    [
        true
    ]`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectExact('ADMIN', null))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an EXACT value "ADMIN" but actual value is

    null`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectExact(3.14, 3.1415))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an EXACT value 3.14 but actual value is

    3.1415`
  )
})
