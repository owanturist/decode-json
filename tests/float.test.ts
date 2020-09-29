/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, AtIndex, JsonValue } from '../src/error'

test('Decode.float', t => {
  t.is(Decode.float.decode(1).value, 1)
  t.is(Decode.float.decode(1.1).value, 1.1)

  t.deepEqual(
    Decode.float.decode(undefined).error,
    JsonValue('FLOAT', undefined)
  )
  t.deepEqual(Decode.float.decode(null).error, JsonValue('FLOAT', null))
  t.deepEqual(Decode.float.decode('str').error, JsonValue('FLOAT', 'str'))
  t.deepEqual(Decode.float.decode(true).error, JsonValue('FLOAT', true))
})

test('Decode.optional.float', t => {
  t.is(Decode.optional.float.decode(undefined).value, null)
  t.is(Decode.optional.float.decode(null).value, null)
  t.is(Decode.optional.float.decode(1).value, 1)
  t.is(Decode.optional.float.decode(1.1).value, 1.1)

  t.deepEqual(
    Decode.optional.float.decode('str').error,
    Optional(JsonValue('FLOAT', 'str'))
  )
  t.deepEqual(
    Decode.optional.float.decode(true).error,
    Optional(JsonValue('FLOAT', true))
  )
})

test('Decode.field().float', t => {
  // Decode<number>
  const _0 = Decode.field('_0').float

  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('FLOAT', null))
  )
  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', JsonValue('FLOAT', 'str'))
  )
})

test('Decode.field().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.float

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 1 }).value, 1)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(JsonValue('FLOAT', 'str')))
  )
})

test('Decode.index().float', t => {
  // Decode<number>
  const _0 = Decode.index(1).float

  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(_0.decode(['', null]).error, AtIndex(1, JsonValue('FLOAT', null)))
  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, JsonValue('FLOAT', 'str'))
  )
})

test('Decode.index().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.float

  t.is(_0.decode(['', null]).value, null)
  t.is(_0.decode([0, 1]).value, 1)

  t.deepEqual(
    _0.decode(['', 'str']).error,
    AtIndex(1, Optional(JsonValue('FLOAT', 'str')))
  )
})
