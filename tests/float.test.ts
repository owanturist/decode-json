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

test('Decode.float', t => {
  t.deepEqual(
    Decode.float.decode(undefined),
    Left(JsonValue('FLOAT', undefined))
  )

  t.deepEqual(Decode.float.decode(null), Left(JsonValue('FLOAT', null)))

  t.deepEqual(Decode.float.decode('str'), Left(JsonValue('FLOAT', 'str')))

  t.deepEqual(Decode.float.decode(true), Left(JsonValue('FLOAT', true)))

  t.deepEqual(Decode.float.decode(1), Right(1))

  t.deepEqual(Decode.float.decode(1.1), Right(1.1))
})

test('Decode.optional.float', t => {
  t.deepEqual(Decode.optional.float.decode(undefined), Right(null))

  t.deepEqual(Decode.optional.float.decode(null), Right(null))

  t.deepEqual(
    Decode.optional.float.decode('str'),
    Left(Optional(JsonValue('FLOAT', 'str')))
  )

  t.deepEqual(
    Decode.optional.float.decode(true),
    Left(Optional(JsonValue('FLOAT', true)))
  )

  t.deepEqual(Decode.optional.float.decode(1), Right(1))

  t.deepEqual(Decode.optional.float.decode(1.1), Right(1.1))
})

test('Decode.field().float', t => {
  // Decode<number>
  const _0 = Decode.field('_0').float

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('FLOAT', null)))
  )

  t.deepEqual(_0.decode({ _0: 1 }), Right(1))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', JsonValue('FLOAT', 'str')))
  )
})

test('Decode.field().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.float

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: 1 }), Right(1))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', Optional(JsonValue('FLOAT', 'str'))))
  )
})

test('Decode.index().float', t => {
  // Decode<number>
  const _0 = Decode.index(1).float

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(
    _0.decode([null, null]),
    Left(AtIndex(1, JsonValue('FLOAT', null)))
  )

  t.deepEqual(_0.decode([0, 1]), Right(1))

  t.deepEqual(
    _0.decode(['', 'str']),
    Left(AtIndex(1, JsonValue('FLOAT', 'str')))
  )
})

test('Decode.index().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.float

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(_0.decode([0, 1]), Right(1))

  t.deepEqual(
    _0.decode(['', 'str']),
    Left(AtIndex(1, Optional(JsonValue('FLOAT', 'str'))))
  )
})
