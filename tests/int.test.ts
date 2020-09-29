/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, AtIndex, JsonValue } from '../src/error'

test('Decode.int', t => {
  t.is(Decode.int.decode(1).value, 1)

  t.deepEqual(Decode.int.decode(undefined).error, JsonValue('INT', undefined))
  t.deepEqual(Decode.int.decode(null).error, JsonValue('INT', null))
  t.deepEqual(Decode.int.decode('str').error, JsonValue('INT', 'str'))
  t.deepEqual(Decode.int.decode(true).error, JsonValue('INT', true))
  t.deepEqual(Decode.int.decode(1.1).error, JsonValue('INT', 1.1))
})

test('Decode.optional.int', t => {
  t.is(Decode.optional.int.decode(undefined).value, null)
  t.is(Decode.optional.int.decode(null).value, null)
  t.is(Decode.optional.int.decode(1).value, 1)

  t.deepEqual(
    Decode.optional.int.decode('str').error,
    Optional(JsonValue('INT', 'str'))
  )
  t.deepEqual(
    Decode.optional.int.decode(true).error,
    Optional(JsonValue('INT', true))
  )
  t.deepEqual(
    Decode.optional.int.decode(1.1).error,
    Optional(JsonValue('INT', 1.1))
  )
})

test('Decode.field().int', t => {
  // Decode<number>
  const _0 = Decode.field('_0').int

  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('INT', null))
  )
  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', JsonValue('INT', 'str'))
  )
})

test('Decode.field().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.int

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(JsonValue('INT', 'str')))
  )
})

test('Decode.index().int', t => {
  // Decode<number>
  const _0 = Decode.index(1).int

  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(_0.decode(['', null]).error, AtIndex(1, JsonValue('INT', null)))
  t.deepEqual(_0.decode(['', 'str']).error, AtIndex(1, JsonValue('INT', 'str')))
})

test('Decode.index().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.int

  t.is(_0.decode(['', null]).value, null)
  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, Optional(JsonValue('INT', 'str')))
  )
})
