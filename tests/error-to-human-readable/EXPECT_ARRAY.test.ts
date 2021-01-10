/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectArray } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _0 = Optional(ExpectArray('I am a string!'))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL ARRAY but actual value is

    "I am a string!"`
  )
})

test('IN_FIELD', t => {
  const _0 = InField(
    'bar',
    ExpectArray({
      bar: [0, 1]
    })
  )

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an ARRAY but actual value is

    {
        "bar": [
            0,
            1
        ]
    }`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectArray(null))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an ARRAY but actual value is

    null`
  )
})
