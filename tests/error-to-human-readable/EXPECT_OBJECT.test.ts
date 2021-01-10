/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, ExpectObject } from '../error'

test('standalone', t => {
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
})
test('OPTIONAL', t => {
  const _0 = Optional(ExpectObject('I am not an object!'))

  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an OPTIONAL OBJECT but actual value is

    "I am not an object!"`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', ExpectObject([{ bar: 123 }]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an OBJECT but actual value is

    [
        {
            "bar": 123
        }
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, ExpectObject(null))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an OBJECT but actual value is

    null`
  )
})
