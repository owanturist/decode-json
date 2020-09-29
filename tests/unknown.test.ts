/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right } from '../src'
import { RequiredField, RequiredIndex, JsonValue } from '../src/error'

test('Decode.unknown', t => {
  t.deepEqual(Decode.unknown.decode(undefined), Right(undefined))

  t.deepEqual(Decode.unknown.decode(null), Right(null))

  t.deepEqual(Decode.unknown.decode('str'), Right('str'))

  t.deepEqual(Decode.unknown.decode(true), Right(true))

  t.deepEqual(Decode.unknown.decode(1), Right(1))

  t.deepEqual(Decode.unknown.decode(1.1), Right(1.1))
})

test('Decode.field().unknown', t => {
  // Decode<unknown>
  const _0 = Decode.field('_0').unknown

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: 1 }), Right(1))

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.index().string', t => {
  // Decode<unknown>
  const _0 = Decode.index(1).unknown

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(_0.decode([0, 1]), Right(1))

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})
