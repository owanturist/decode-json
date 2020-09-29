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

test('Decode.string', t => {
  t.deepEqual(
    Decode.string.decode(undefined),
    Left(JsonValue('STRING', undefined))
  )

  t.deepEqual(Decode.string.decode(null), Left(JsonValue('STRING', null)))

  t.deepEqual(Decode.string.decode('str'), Right('str'))

  t.deepEqual(Decode.string.decode(true), Left(JsonValue('STRING', true)))

  t.deepEqual(Decode.string.decode(1), Left(JsonValue('STRING', 1)))

  t.deepEqual(Decode.string.decode(1.1), Left(JsonValue('STRING', 1.1)))
})

test('Decode.optional.string', t => {
  t.deepEqual(Decode.optional.string.decode(undefined), Right(null))

  t.deepEqual(Decode.optional.string.decode(null), Right(null))

  t.deepEqual(Decode.optional.string.decode('str'), Right('str'))

  t.deepEqual(
    Decode.optional.string.decode(true),
    Left(Optional(JsonValue('STRING', true)))
  )

  t.deepEqual(
    Decode.optional.string.decode(1),
    Left(Optional(JsonValue('STRING', 1)))
  )

  t.deepEqual(
    Decode.optional.string.decode(1.1),
    Left(Optional(JsonValue('STRING', 1.1)))
  )
})

test('Decode.field().string', t => {
  // Decode<string>
  const _0 = Decode.field('_0').string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('STRING', null)))
  )

  t.deepEqual(_0.decode({ _0: 1 }), Left(InField('_0', JsonValue('STRING', 1))))

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.field().optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.field('_0').optional.string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(InField('_0', Optional(JsonValue('STRING', 1))))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.index().string', t => {
  // Decode<string>
  const _0 = Decode.index(1).string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(
    _0.decode([null, null]),
    Left(AtIndex(1, JsonValue('STRING', null)))
  )

  t.deepEqual(_0.decode([0, 1]), Left(AtIndex(1, JsonValue('STRING', 1))))

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})

test('Decode.index().optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.index(1).optional.string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 1]),
    Left(AtIndex(1, Optional(JsonValue('STRING', 1))))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})
