import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { RuntimeException, Optional, InField, AtIndex } from '../error'

const err = new Error('Something went wrong')

test('standalone', t => {
  const _0 = RuntimeException(new Error('Something went wrong'))
  t.is(
    errorToHumanReadable(_0),
    `Unexpected runtime error:

    Something went wrong`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `Unexpected runtime error:

  Something went wrong`
  )
})

test('OPTIONAL', t => {
  const _0 = Optional(RuntimeException(err))

  t.is(
    errorToHumanReadable(_0),
    `Unexpected runtime error:

    Something went wrong`
  )
})

test('IN_FIELD', t => {
  const _0 = InField('foo', RuntimeException(err))

  t.is(
    errorToHumanReadable(_0),
    `Unexpected runtime error at _.foo:

    Something went wrong`
  )
})

test('AT_INDEX', t => {
  const _0 = AtIndex(23, RuntimeException(err))

  t.is(
    errorToHumanReadable(_0),
    `Unexpected runtime error at _[23]:

    Something went wrong`
  )
})
