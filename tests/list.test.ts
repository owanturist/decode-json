/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Optional, InField, AtIndex, ExpectArray, ExpectInt } from './error'

test('Decode.list()', t => {
  // Decoder<number[]>
  const _0 = Decode.list(Decode.int)

  t.deepEqual(_0.decode([]).value, [])
  t.deepEqual(_0.decode([1, 3, 2]).value, [1, 3, 2])

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(_0.decode(null).error, ExpectArray(null))
  t.deepEqual(_0.decode('str').error, ExpectArray('str'))
  t.deepEqual(_0.decode(1).error, ExpectArray(1))
  t.deepEqual(_0.decode(1.1).error, ExpectArray(1.1))
  t.deepEqual(_0.decode({}).error, ExpectArray({}))
  t.deepEqual(_0.decode([1, false, 2]).error, AtIndex(1, ExpectInt(false)))
  t.deepEqual(_0.decode([1, 3, null, 4]).error, AtIndex(2, ExpectInt(null)))
  t.deepEqual(
    _0.decode([undefined, 2, 1]).error,
    AtIndex(0, ExpectInt(undefined))
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

  t.deepEqual(_0.decode('str').error, Optional(ExpectArray('str')))
  t.deepEqual(_0.decode(1).error, Optional(ExpectArray(1)))
  t.deepEqual(_0.decode(1.1).error, Optional(ExpectArray(1.1)))
  t.deepEqual(_0.decode({}).error, Optional(ExpectArray({})))
  t.deepEqual(
    _0.decode([1, false, 2]).error,
    Optional(AtIndex(1, ExpectInt(false)))
  )
  t.deepEqual(
    _0.decode([1, 3, null, 4]).error,
    Optional(AtIndex(2, ExpectInt(null)))
  )
  t.deepEqual(
    _0.decode([undefined, 2, 1]).error,
    Optional(AtIndex(0, ExpectInt(undefined)))
  )
})

test('Decode.field().list()', t => {
  // Decoder<string[]>
  const _0 = Decode.field('_0').list(Decode.string)

  t.deepEqual(_0.decode({ _0: ['bar', 'baz'] }).value, ['bar', 'baz'])

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectArray(null)))
  t.deepEqual(_0.decode({ _0: {} }).error, InField('_0', ExpectArray({})))
})

test('Decode.field().optional.list()', t => {
  // Decode<boolean[] | null>
  const _0 = Decode.field('_0').optional.list(Decode.boolean)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.deepEqual(_0.decode({ _0: [false, true] }).value, [false, true])

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectArray('str')))
  )
})

test('Decode.index().list()', t => {
  // Decode<number[]>
  const _0 = Decode.index(1).list(Decode.int)

  t.deepEqual(_0.decode([0, [1, 2, 3]]).value, [1, 2, 3])

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectArray(null)))
  t.deepEqual(_0.decode(['', {}]).error, AtIndex(1, ExpectArray({})))
})

test('Decode.index().optional.list()', t => {
  // Decode<number[] | null>
  const _0 = Decode.index(1).optional.list(Decode.float)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.deepEqual(_0.decode([0, [1.2, 3.4]]).value, [1.2, 3.4])

  t.deepEqual(_0.decode(['', {}]).error, AtIndex(1, Optional(ExpectArray({}))))
})
