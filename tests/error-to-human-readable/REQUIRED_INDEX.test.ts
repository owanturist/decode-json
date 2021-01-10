import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, RequiredIndex } from '../error'

test('standalone', t => {
  const _0 = RequiredIndex(42, [{ bar: 123 }])

  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `Problem with the given value
Expecting an ARRAY with an ELEMENT at [42] but only see 1 entries:

  [
    {
      "bar": 123
    }
  ]`
  )
})

test('OPTIONAL', t => {
  const _0 = Optional(RequiredIndex(3, [{ foo: 'str' }]))
  t.is(
    errorToHumanReadable(_0),
    `Problem with the given value
Expecting an ARRAY with an ELEMENT at [3] but only see 1 entries:

    [
        {
            "foo": "str"
        }
    ]`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('bar', RequiredIndex(1, [null]))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _.bar
Expecting an ARRAY with an ELEMENT at [1] but only see 1 entries:

    [
        null
    ]`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(83, RequiredIndex(0, []))

  t.is(
    errorToHumanReadable(_0),
    `Problem with a value at _[83]
Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries:

    []`
  )
})
