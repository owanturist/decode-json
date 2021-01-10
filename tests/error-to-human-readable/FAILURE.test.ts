/* eslint-disable no-undefined */

import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { InField, AtIndex, Failure } from '../error'

test('standalone', t => {
  const template =
    'Custom message at {path} or {context} is:\n\n{json}\n\n{value}\n\n{source}'

  const _0 = Failure(template, undefined)

  t.is(
    errorToHumanReadable(_0),
    `Custom message at _ or _ is:

    undefined

    undefined

    undefined`
  )

  const _1 = Failure(template, {
    foo: [{ bar: 123 }]
  })

  t.is(
    errorToHumanReadable(_1, { indent: 2 }),
    `Custom message at _ or _ is:

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }

  {
    "foo": [
      {
        "bar": 123
      }
    ]
  }`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(
    83,
    Failure('Fails with some reason at {path}:\n\n{json}', ['Reason'])
  )

  t.is(
    errorToHumanReadable(_0),
    `Fails with some reason at _[83]:

    [
        "Reason"
    ]`
  )
})

test('IN_FIELD', t => {
  const _0 = InField(
    'bar',
    Failure('Unexpected value at {context}:\n\n{value}', { foo: false })
  )

  t.is(
    errorToHumanReadable(_0),
    `Unexpected value at _.bar:

    {
        "foo": false
    }`
  )
})
