/* eslint-disable ava/no-skip-test */
/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right } from '../src/refactor'
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

test('Decode.field(name).string', t => {
  // Decode<string>
  const _0 = Decode.field('_0').string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([]), Left(JsonValue('OBJECT', [])))

  t.deepEqual(_0.decode({}), Left(RequiredField('_0', {})))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('STRING', null)))
  )

  t.deepEqual(_0.decode({ _0: 1 }), Left(InField('_0', JsonValue('STRING', 1))))

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.field(name).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.field('_0').optional.string

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([]), Left(JsonValue('OBJECT', [])))

  t.deepEqual(_0.decode({}), Left(RequiredField('_0', {})))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(InField('_0', Optional(JsonValue('STRING', 1))))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.optional.field(name).string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.field('_0').string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Left(Optional(JsonValue('OBJECT', []))))

  t.deepEqual(_0.decode({}), Right(null))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(Optional(InField('_0', JsonValue('STRING', null))))
  )

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(Optional(InField('_0', JsonValue('STRING', 1))))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.optional.field(name).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.field('_0').optional.string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Left(Optional(JsonValue('OBJECT', []))))

  t.deepEqual(_0.decode({}), Right(null))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(Optional(InField('_0', Optional(JsonValue('STRING', 1)))))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test.skip('Decode.index(position).string', t => {
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

test.skip('Decode.index(position).optional.string', t => {
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

test.skip('Decode.optional.index(position).string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.index(1).string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(_0.decode({}), Left(Optional(JsonValue('ARRAY', {}))))

  t.deepEqual(
    _0.decode([null, null]),
    Left(AtIndex(1, JsonValue('STRING', null)))
  )

  t.deepEqual(_0.decode([0, 1]), Left(AtIndex(1, JsonValue('STRING', 1))))

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})

test.skip('Decode.optional.index(position).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.index(1).optional.string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(_0.decode({}), Left(Optional(JsonValue('ARRAY', {}))))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 1]),
    Left(AtIndex(1, Optional(JsonValue('STRING', 1))))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})
