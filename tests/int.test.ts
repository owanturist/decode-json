/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Optional, InField, AtIndex, ExpectInt } from './error'

test('Decode.int', t => {
  t.is(Decode.int.decode(1).value, 1)

  t.deepEqual(Decode.int.decode(undefined).error, ExpectInt(undefined))
  t.deepEqual(Decode.int.decode(null).error, ExpectInt(null))
  t.deepEqual(Decode.int.decode('str').error, ExpectInt('str'))
  t.deepEqual(Decode.int.decode(true).error, ExpectInt(true))
  t.deepEqual(Decode.int.decode(1.1).error, ExpectInt(1.1))
  t.deepEqual(Decode.int.decode(NaN).error, ExpectInt(NaN))
  t.deepEqual(Decode.int.decode(Infinity).error, ExpectInt(Infinity))
})

test('Decode.optional.int', t => {
  t.is(Decode.optional.int.decode(undefined).value, null)
  t.is(Decode.optional.int.decode(null).value, null)
  t.is(Decode.optional.int.decode(1).value, 1)

  t.deepEqual(
    Decode.optional.int.decode('str').error,
    Optional(ExpectInt('str'))
  )
  t.deepEqual(Decode.optional.int.decode(true).error, Optional(ExpectInt(true)))
  t.deepEqual(Decode.optional.int.decode(1.1).error, Optional(ExpectInt(1.1)))
  t.deepEqual(Decode.optional.int.decode(NaN).error, Optional(ExpectInt(NaN)))
  t.deepEqual(
    Decode.optional.int.decode(Infinity).error,
    Optional(ExpectInt(Infinity))
  )
})

test('Decode.field().int', t => {
  // Decode<number>
  const _0 = Decode.field('_0').int

  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectInt(null)))
  t.deepEqual(_0.decode({ _0: 'str' }).error, InField('_0', ExpectInt('str')))
})

test('Decode.field().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.int

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectInt('str')))
  )
})

test('Decode.index().int', t => {
  // Decode<number>
  const _0 = Decode.index(1).int

  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(_0.decode(['', null]).error, AtIndex(1, ExpectInt(null)))
  t.deepEqual(_0.decode(['', 'str']).error, AtIndex(1, ExpectInt('str')))
})

test('Decode.index().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.int

  t.is(_0.decode(['', null]).value, null)
  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, Optional(ExpectInt('str')))
  )
})
