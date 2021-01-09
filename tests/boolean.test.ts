/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Optional, InField, AtIndex, ExpectBoolean } from './error'

test('Decode.boolean', t => {
  t.is(Decode.boolean.decode(true).value, true)

  t.deepEqual(Decode.boolean.decode(undefined).error, ExpectBoolean(undefined))
  t.deepEqual(Decode.boolean.decode(null).error, ExpectBoolean(null))
  t.deepEqual(Decode.boolean.decode('str').error, ExpectBoolean('str'))
  t.deepEqual(Decode.boolean.decode(1).error, ExpectBoolean(1))
  t.deepEqual(Decode.boolean.decode(1.1).error, ExpectBoolean(1.1))
})

test('Decode.optional.boolean', t => {
  t.is(Decode.optional.boolean.decode(undefined).value, null)
  t.is(Decode.optional.boolean.decode(null).value, null)
  t.is(Decode.optional.boolean.decode(false).value, false)

  t.deepEqual(
    Decode.optional.boolean.decode('str').error,
    Optional(ExpectBoolean('str'))
  )
  t.deepEqual(
    Decode.optional.boolean.decode(1).error,
    Optional(ExpectBoolean(1))
  )
  t.deepEqual(
    Decode.optional.boolean.decode(1.1).error,
    Optional(ExpectBoolean(1.1))
  )
})

test('Decode.field().boolean', t => {
  // Decode<boolean>
  const _0 = Decode.field('_0').boolean

  t.is(_0.decode({ _0: false }).value, false)

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectBoolean(null)))
  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', ExpectBoolean('str'))
  )
})

test('Decode.field().optional.boolean', t => {
  // Decode<boolean | null>
  const _0 = Decode.field('_0').optional.boolean

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: true }).value, true)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectBoolean('str')))
  )
})

test('Decode.index().boolean', t => {
  // Decode<boolean>
  const _0 = Decode.index(1).boolean

  t.is(_0.decode([false, true]).value, true)

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectBoolean(null)))
  t.deepEqual(_0.decode(['', 'str']).error, AtIndex(1, ExpectBoolean('str')))
})

test('Decode.index().optional.boolean', t => {
  // Decode<boolean | null>
  const _0 = Decode.index(1).optional.boolean

  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([true, false]).value, false)

  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, Optional(ExpectBoolean('str')))
  )
})
