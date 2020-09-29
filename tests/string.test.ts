/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, AtIndex, JsonValue } from '../src/error'

test('Decode.string', t => {
  t.is(Decode.string.decode('str').value, 'str')

  t.deepEqual(
    Decode.string.decode(undefined).error,
    JsonValue('STRING', undefined)
  )
  t.deepEqual(Decode.string.decode(null).error, JsonValue('STRING', null))
  t.deepEqual(Decode.string.decode(true).error, JsonValue('STRING', true))
  t.deepEqual(Decode.string.decode(1).error, JsonValue('STRING', 1))
  t.deepEqual(Decode.string.decode(1.1).error, JsonValue('STRING', 1.1))
})

test('Decode.optional.string', t => {
  t.is(Decode.optional.string.decode(undefined).value, null)
  t.is(Decode.optional.string.decode(null).value, null)
  t.is(Decode.optional.string.decode('str').value, 'str')

  t.deepEqual(
    Decode.optional.string.decode(true).error,
    Optional(JsonValue('STRING', true))
  )
  t.deepEqual(
    Decode.optional.string.decode(1).error,
    Optional(JsonValue('STRING', 1))
  )
  t.deepEqual(
    Decode.optional.string.decode(1.1).error,
    Optional(JsonValue('STRING', 1.1))
  )
})

test('Decode.field().string', t => {
  // Decode<string>
  const _0 = Decode.field('_0').string

  t.is(_0.decode({ _0: 'str' }).value, 'str')

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('STRING', null))
  )
  t.deepEqual(_0.decode({ _0: 1 }).error, InField('_0', JsonValue('STRING', 1)))
})

test('Decode.field().optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.field('_0').optional.string

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 'str' }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode([0]).error, JsonValue('OBJECT', [0]))
  t.deepEqual(
    _0.decode({ _0: 1 }).error,
    InField('_0', Optional(JsonValue('STRING', 1)))
  )
})

test('Decode.index().string', t => {
  // Decode<string>
  const _0 = Decode.index(1).string

  t.is(_0.decode(['', 'str']).value, 'str')

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('STRING', null)))
  t.deepEqual(_0.decode([0, 1]).error, AtIndex(1, JsonValue('STRING', 1)))
})

test('Decode.index().optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.index(1).optional.string

  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode(['', 'str']).value, 'str')

  t.deepEqual(
    _0.decode([0, 1]).error,
    AtIndex(1, Optional(JsonValue('STRING', 1)))
  )
})
