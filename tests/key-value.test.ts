/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { DecodeResult } from '../src/decode-json'
import {
  Optional,
  InField,
  AtIndex,
  Failure,
  ExpectObject,
  ExpectInt
} from './error'

const toNumber = (key: string): DecodeResult<string, number> => {
  const id = Number(key)

  if (isNaN(id)) {
    return { error: `Not a number "${key}"` }
  }

  return { value: id }
}

test('Decode.keyValue()', t => {
  // Decoder<[string, number][]>
  const _0 = Decode.keyValue(Decode.int)

  t.deepEqual(_0.decode({}).value, [])
  t.deepEqual(_0.decode({ 0: 1, 1: 3, 2: 2 }).value, [
    ['0', 1],
    ['1', 3],
    ['2', 2]
  ])

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode(null).error, ExpectObject(null))
  t.deepEqual(_0.decode('str').error, ExpectObject('str'))
  t.deepEqual(_0.decode(1).error, ExpectObject(1))
  t.deepEqual(_0.decode(1.1).error, ExpectObject(1.1))
  t.deepEqual(_0.decode([]).error, ExpectObject([]))
  t.deepEqual(
    _0.decode({ _0: 1, _1: false, _2: 2 }).error,
    InField('_1', ExpectInt(false))
  )
  t.deepEqual(
    _0.decode({ _0: 1, _1: 3, _2: null }).error,
    InField('_2', ExpectInt(null))
  )
  t.deepEqual(
    _0.decode({ _0: undefined, _1: 3, _2: 2 }).error,
    InField('_0', ExpectInt(undefined))
  )

  // Decoder<[string, number | null][]>
  const _1 = Decode.keyValue(Decode.optional.int)

  t.deepEqual(_1.decode({ _0: 1, _1: 3, _2: null }).value, [
    ['_0', 1],
    ['_1', 3],
    ['_2', null]
  ])
  t.deepEqual(_1.decode({ _0: undefined, _1: 3, _2: 2 }).value, [
    ['_0', null],
    ['_1', 3],
    ['_2', 2]
  ])

  // Decoder<[string, number][]>
  const _2 = Decode.keyValue(Decode.field('_0').int)

  t.deepEqual(_2.decode({ _1: { _0: 2 }, _2: { _0: 3 } }).value, [
    ['_1', 2],
    ['_2', 3]
  ])

  // Decoder<[string, string][]>
  const _3 = Decode.keyValue(Decode.index(0).string)

  t.deepEqual(_3.decode({ _1: ['f'], _3: ['b'] }).value, [
    ['_1', 'f'],
    ['_3', 'b']
  ])

  // Decoder<[number, string][]>
  const _4 = Decode.keyValue(toNumber, Decode.string)

  t.deepEqual(_4.decode({ 0: 'a', 1: 'b' }).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _4.decode({ 0: 'a', 1: 'b', _2: 'c' }).error,
    Failure('Not a number "_2"', '_2')
  )
})

test('Decode.optional.keyValue()', t => {
  // Decoder<[string, number][] | null>
  const _0 = Decode.optional.keyValue(Decode.int)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.deepEqual(_0.decode({}).value, [])
  t.deepEqual(_0.decode({ 0: 1, 1: 3, 2: 2 }).value, [
    ['0', 1],
    ['1', 3],
    ['2', 2]
  ])

  t.deepEqual(_0.decode('str').error, Optional(ExpectObject('str')))
  t.deepEqual(_0.decode(1).error, Optional(ExpectObject(1)))
  t.deepEqual(_0.decode(1.1).error, Optional(ExpectObject(1.1)))
  t.deepEqual(_0.decode([]).error, Optional(ExpectObject([])))
  t.deepEqual(
    _0.decode({ _0: 1, _1: false, _2: 2 }).error,
    Optional(InField('_1', ExpectInt(false)))
  )
  t.deepEqual(
    _0.decode({ _0: 1, _1: 3, _2: null }).error,
    Optional(InField('_2', ExpectInt(null)))
  )
  t.deepEqual(
    _0.decode({ _0: undefined, _1: 3, _2: 2 }).error,
    Optional(InField('_0', ExpectInt(undefined)))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode({ 0: 'a', 1: 'b' }).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode({ 0: 'a', 1: 'b', _2: 'c' }).error,
    Optional(Failure('Not a number "_2"', '_2'))
  )
})

test('Decode.field().keyValue()', t => {
  // Decoder<[string, string][]>
  const _0 = Decode.field('_0').keyValue(Decode.string)

  t.deepEqual(_0.decode({ _0: { 0: 'a', 1: 'b', 2: 'c' } }).value, [
    ['0', 'a'],
    ['1', 'b'],
    ['2', 'c']
  ])

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(_0.decode({ _0: [] }).error, InField('_0', ExpectObject([])))

  // Decoder<[number, boolean][] | null>
  const _1 = Decode.field('_0').keyValue(toNumber, Decode.boolean)

  t.deepEqual(_1.decode({ _0: { 0: true, 1: false } }).value, [
    [0, true],
    [1, false]
  ])
  t.deepEqual(
    _1.decode({ _0: { 0: true, 1: false, _2: true } }).error,
    InField('_0', Failure('Not a number "_2"', '_2'))
  )
})

test('Decode.field().optional.keyValue()', t => {
  // Decode<[string, boolean][] | null>
  const _0 = Decode.field('_0').optional.keyValue(Decode.boolean)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.deepEqual(_0.decode({ _0: { 0: true, 1: false } }).value, [
    ['0', true],
    ['1', false]
  ])

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectObject('str')))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.field('_0').optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode({ _0: { 0: 'a', 1: 'b' } }).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode({ _0: { 0: 'a', 1: 'b', _2: null } }).error,
    InField('_0', Optional(Failure('Not a number "_2"', '_2')))
  )
})

test('Decode.index().keyValue()', t => {
  // Decode<[string, string][]>
  const _0 = Decode.index(1).keyValue(Decode.string)

  t.deepEqual(_0.decode([0, { 0: 'a', 1: 'b', 2: 'c' }]).value, [
    ['0', 'a'],
    ['1', 'b'],
    ['2', 'c']
  ])

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectObject(null)))
  t.deepEqual(_0.decode(['', []]).error, AtIndex(1, ExpectObject([])))

  // Decoder<[number, boolean][] | null>
  const _1 = Decode.index(0).keyValue(toNumber, Decode.boolean)

  t.deepEqual(_1.decode([{ 0: true, 1: false }]).value, [
    [0, true],
    [1, false]
  ])
  t.deepEqual(
    _1.decode([{ 0: true, 1: false, _2: true }]).error,
    AtIndex(0, Failure('Not a number "_2"', '_2'))
  )
})

test('Decode.index().optional.keyValue()', t => {
  // Decode<[string, boolean][] | null>
  const _0 = Decode.index(1).optional.keyValue(Decode.boolean)

  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([false, undefined]).value, null)
  t.deepEqual(_0.decode([{}, { 0: true, 1: false }]).value, [
    ['0', true],
    ['1', false]
  ])

  t.deepEqual(
    _0.decode([null, 'str']).error,
    AtIndex(1, Optional(ExpectObject('str')))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.index(0).optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode([{ 0: 'a', 1: 'b' }]).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode([{ 0: 'a', 1: 'b', _2: null }]).error,
    AtIndex(0, Optional(Failure('Not a number "_2"', '_2')))
  )
})
