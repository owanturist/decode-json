/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectInt } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _0 = Optional(ExpectInt(true))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL INTEGER but actual value is

    true`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectInt([1.2, 3.4]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an INTEGER but actual value is

    [
        1.2,
        3.4
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectInt('1.23'))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an INTEGER but actual value is

    "1.23"`
  )
})
