/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Optional, InField, AtIndex, ExpectFloat } from './error'

test('Decode.float', t => {
  t.is(Decode.float.decode(1).value, 1)
  t.is(Decode.float.decode(1.1).value, 1.1)

  t.deepEqual(Decode.float.decode(undefined).error, ExpectFloat(undefined))
  t.deepEqual(Decode.float.decode(null).error, ExpectFloat(null))
  t.deepEqual(Decode.float.decode('str').error, ExpectFloat('str'))
  t.deepEqual(Decode.float.decode(true).error, ExpectFloat(true))
  t.deepEqual(Decode.float.decode(NaN).error, ExpectFloat(NaN))
  t.deepEqual(Decode.float.decode(Infinity).error, ExpectFloat(Infinity))
})

test('Decode.optional.float', t => {
  t.is(Decode.optional.float.decode(undefined).value, null)
  t.is(Decode.optional.float.decode(null).value, null)
  t.is(Decode.optional.float.decode(1).value, 1)
  t.is(Decode.optional.float.decode(1.1).value, 1.1)

  t.deepEqual(
    Decode.optional.float.decode('str').error,
    Optional(ExpectFloat('str'))
  )
  t.deepEqual(
    Decode.optional.float.decode(true).error,
    Optional(ExpectFloat(true))
  )
  t.deepEqual(
    Decode.optional.float.decode(NaN).error,
    Optional(ExpectFloat(NaN))
  )
  t.deepEqual(
    Decode.optional.float.decode(Infinity).error,
    Optional(ExpectFloat(Infinity))
  )
})

test('Decode.field().float', t => {
  // Decode<number>
  const _0 = Decode.field('_0').float

  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectFloat(null)))
  t.deepEqual(_0.decode({ _0: 'str' }).error, InField('_0', ExpectFloat('str')))
})

test('Decode.field().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.float

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectFloat('str')))
  )
})

test('Decode.index().float', t => {
  // Decode<number>
  const _0 = Decode.index(1).float

  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(_0.decode(['', null]).error, AtIndex(1, ExpectFloat(null)))
  t.deepEqual(_0.decode(['', 'str']).error, AtIndex(1, ExpectFloat('str')))
})

test('Decode.index().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.float

  t.is(_0.decode(['', null]).value, null)
  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, Optional(ExpectFloat('str')))
  )
})
