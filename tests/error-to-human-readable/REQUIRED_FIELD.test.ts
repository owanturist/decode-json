import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, RequiredField } from '../error'

test('standalone', t => {
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
})

test('OPTIONAL', t => {
  const _1 = Optional(RequiredField('0', { 1: 'first' }))

  t.is(
    errorToHumanReadable(_1),
    `Problem with the given value
Expecting an OBJECT with a FIELD named '0':

    {
        "1": "first"
    }`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', RequiredField('bar', { foo: 42 }))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an OBJECT with a FIELD named 'bar':

    {
        "foo": 42
    }`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, RequiredField('foo', {}))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an OBJECT with a FIELD named 'foo':

    {}`
  )
})
