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

test('Decode.boolean', t => {
  t.deepEqual(
    Decode.boolean.decode(undefined),
    Left(JsonValue('BOOLEAN', undefined))
  )

  t.deepEqual(Decode.boolean.decode(null), Left(JsonValue('BOOLEAN', null)))

  t.deepEqual(Decode.boolean.decode('str'), Left(JsonValue('BOOLEAN', 'str')))

  t.deepEqual(Decode.boolean.decode(true), Right(true))

  t.deepEqual(Decode.boolean.decode(1), Left(JsonValue('BOOLEAN', 1)))

  t.deepEqual(Decode.boolean.decode(1.1), Left(JsonValue('BOOLEAN', 1.1)))
})

test('Decode.optional.boolean', t => {
  t.deepEqual(Decode.optional.boolean.decode(undefined), Right(null))

  t.deepEqual(Decode.optional.boolean.decode(null), Right(null))

  t.deepEqual(
    Decode.optional.boolean.decode('str'),
    Left(Optional(JsonValue('BOOLEAN', 'str')))
  )

  t.deepEqual(Decode.optional.boolean.decode(false), Right(false))

  t.deepEqual(
    Decode.optional.boolean.decode(1),
    Left(Optional(JsonValue('BOOLEAN', 1)))
  )

  t.deepEqual(
    Decode.optional.boolean.decode(1.1),
    Left(Optional(JsonValue('BOOLEAN', 1.1)))
  )
})

test('Decode.field().boolean', t => {
  // Decode<boolean>
  const _0 = Decode.field('_0').boolean

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('BOOLEAN', null)))
  )

  t.deepEqual(_0.decode({ _0: false }), Right(false))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', JsonValue('BOOLEAN', 'str')))
  )
})

test('Decode.field().optional.boolean', t => {
  // Decode<boolean | null>
  const _0 = Decode.field('_0').optional.boolean

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: true }), Right(true))

  t.deepEqual(
    _0.decode({ _0: 'str' }),
    Left(InField('_0', Optional(JsonValue('BOOLEAN', 'str'))))
  )
})

test('Decode.index().boolean', t => {
  // Decode<boolean>
  const _0 = Decode.index(1).boolean

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(
    _0.decode([null, null]),
    Left(AtIndex(1, JsonValue('BOOLEAN', null)))
  )

  t.deepEqual(_0.decode([false, true]), Right(true))

  t.deepEqual(
    _0.decode(['', 'str']),
    Left(AtIndex(1, JsonValue('BOOLEAN', 'str')))
  )
})

test('Decode.index().optional.boolean', t => {
  // Decode<boolean | null>
  const _0 = Decode.index(1).optional.boolean

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(1, [])))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(_0.decode([true, false]), Right(false))

  t.deepEqual(
    _0.decode(['', 'str']),
    Left(AtIndex(1, Optional(JsonValue('BOOLEAN', 'str'))))
  )
})
