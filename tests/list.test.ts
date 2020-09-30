/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, AtIndex, JsonValue } from '../src/error'

test('Decode.list()', t => {
  // Decoder<number[]>
  const _0 = Decode.list(Decode.int)

  t.deepEqual(_0.decode([]).value, [])
  t.deepEqual(_0.decode([1, 3, 2]).value, [1, 3, 2])

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('ARRAY', null))
  t.deepEqual(_0.decode('str').error, JsonValue('ARRAY', 'str'))
  t.deepEqual(_0.decode(1).error, JsonValue('ARRAY', 1))
  t.deepEqual(_0.decode(1.1).error, JsonValue('ARRAY', 1.1))
  t.deepEqual(_0.decode({}).error, JsonValue('ARRAY', {}))
  t.deepEqual(
    _0.decode([1, false, 2]).error,
    AtIndex(1, JsonValue('INT', false))
  )
  t.deepEqual(
    _0.decode([1, 3, null, 4]).error,
    AtIndex(2, JsonValue('INT', null))
  )
  t.deepEqual(
    _0.decode([undefined, 2, 1]).error,
    AtIndex(0, JsonValue('INT', undefined))
  )

  // Decoder<(number | null)[]>
  const _1 = Decode.list(Decode.optional.int)

  t.deepEqual(_1.decode([1, 3, null, 4]).value, [1, 3, null, 4])
  t.deepEqual(_1.decode([undefined, 2, 1]).value, [null, 2, 1])

  // Decoder<number[]>
  const _2 = Decode.list(Decode.field('_0').int)

  t.deepEqual(_2.decode([{ _0: 0 }, { _0: 1 }]).value, [0, 1])

  // Decoder<string[]>
  const _3 = Decode.list(Decode.index(0).string)

  t.deepEqual(_3.decode([['f'], ['b']]).value, ['f', 'b'])
})

test('Decode.optional.list()', t => {
  // Decoder<number[] | null>
  const _0 = Decode.optional.list(Decode.int)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.deepEqual(_0.decode([]).value, [])
  t.deepEqual(_0.decode([1, 3, 2]).value, [1, 3, 2])

  t.deepEqual(_0.decode('str').error, Optional(JsonValue('ARRAY', 'str')))
  t.deepEqual(_0.decode(1).error, Optional(JsonValue('ARRAY', 1)))
  t.deepEqual(_0.decode(1.1).error, Optional(JsonValue('ARRAY', 1.1)))
  t.deepEqual(_0.decode({}).error, Optional(JsonValue('ARRAY', {})))
  t.deepEqual(
    _0.decode([1, false, 2]).error,
    Optional(AtIndex(1, JsonValue('INT', false)))
  )
  t.deepEqual(
    _0.decode([1, 3, null, 4]).error,
    Optional(AtIndex(2, JsonValue('INT', null)))
  )
  t.deepEqual(
    _0.decode([undefined, 2, 1]).error,
    Optional(AtIndex(0, JsonValue('INT', undefined)))
  )
})

test('Decode.field().list()', t => {
  // Decoder<string[]>
  const _0 = Decode.field('_0').list(Decode.string)

  t.deepEqual(_0.decode({ _0: ['bar', 'baz'] }).value, ['bar', 'baz'])

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('ARRAY', null))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', JsonValue('ARRAY', {}))
  )
})

test('Decode.field().optional.list()', t => {
  // Decode<boolean[] | null>
  const _0 = Decode.field('_0').optional.list(Decode.boolean)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.deepEqual(_0.decode({ _0: [false, true] }).value, [false, true])

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(JsonValue('ARRAY', 'str')))
  )
})

test('Decode.index().list()', t => {
  // Decode<number[]>
  const _0 = Decode.index(1).list(Decode.int)

  t.deepEqual(_0.decode([0, [1, 2, 3]]).value, [1, 2, 3])

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('ARRAY', null)))
  t.deepEqual(_0.decode(['', {}]).error, AtIndex(1, JsonValue('ARRAY', {})))
})

test('Decode.index().optional.list()', t => {
  // Decode<number[] | null>
  const _0 = Decode.index(1).optional.list(Decode.float)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.deepEqual(_0.decode([0, [1.2, 3.4]]).value, [1.2, 3.4])

  t.deepEqual(
    _0.decode(['', {}]).error,
    AtIndex(1, Optional(JsonValue('ARRAY', {})))
  )
})
