/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right } from '../src'
import {
  Optional,
  InField,
  RequiredField,
  AtIndex,
  RequiredIndex,
  JsonValue
} from '../src/error'

test('Decode.int', t => {
  t.deepEqual(Decode.int.decode(undefined), Left(JsonValue('INT', undefined)))

  t.deepEqual(Decode.int.decode(null), Left(JsonValue('INT', null)))

  t.deepEqual(Decode.int.decode('str'), Left(JsonValue('INT', 'str')))

  t.deepEqual(Decode.int.decode(true), Left(JsonValue('INT', true)))

  t.deepEqual(Decode.int.decode(1), Right(1))

  t.deepEqual(Decode.int.decode(1.1), Left(JsonValue('INT', 1.1)))
})

test('Decode.optional.int', t => {
  t.deepEqual(Decode.optional.int.decode(undefined), Right(null))

  t.deepEqual(Decode.optional.int.decode(null), Right(null))

  t.deepEqual(
    Decode.optional.int.decode('str'),
    Left(Optional(JsonValue('INT', 'str')))
  )

  t.deepEqual(
    Decode.optional.int.decode(true),
    Left(Optional(JsonValue('INT', true)))
  )

  t.deepEqual(Decode.optional.int.decode(1), Right(1))

  t.deepEqual(
    Decode.optional.int.decode(1.1),
    Left(Optional(JsonValue('INT', 1.1)))
  )
})

test('Decode.field().int', t => {
  // Decode<number>
  const _0 = Decode.field('_0').int

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('INT', null)))
  )

  t.deepEqual(_0.decode({ _0: 1 }), Right(1))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', JsonValue('INT', 'str')))
  )
})

test('Decode.field().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.int

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: 1 }), Right(1))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', Optional(JsonValue('INT', 'str'))))
  )
})

test('Decode.index().int', t => {
  // Decode<number>
  const _0 = Decode.index(1).int

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Left(AtIndex(1, JsonValue('INT', null))))

  t.deepEqual(_0.decode([0, 1]), Right(1))

  t.deepEqual(_0.decode(['', 'str']), Left(AtIndex(1, JsonValue('INT', 'str'))))
})

test('Decode.index().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.int

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(_0.decode([0, 1]), Right(1))

  t.deepEqual(
    _0.decode(['', 'str']),
    Left(AtIndex(1, Optional(JsonValue('INT', 'str'))))
  )
})
