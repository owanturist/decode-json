/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { DecodeResult } from '../src'
import { Optional, InField, AtIndex, JsonValue, Failure } from '../src/error'

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

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode('str').error, JsonValue('OBJECT', 'str'))
  t.deepEqual(_0.decode(1).error, JsonValue('OBJECT', 1))
  t.deepEqual(_0.decode(1.1).error, JsonValue('OBJECT', 1.1))
  t.deepEqual(_0.decode([]).error, JsonValue('OBJECT', []))
  t.deepEqual(
    _0.decode({ _0: 1, _1: false, _2: 2 }).error,
    InField('_1', JsonValue('INT', false))
  )
  t.deepEqual(
    _0.decode({ _0: 1, _1: 3, _2: null }).error,
    InField('_2', JsonValue('INT', null))
  )
  t.deepEqual(
    _0.decode({ _0: undefined, _1: 3, _2: 2 }).error,
    InField('_0', JsonValue('INT', undefined))
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
    InField('_2', Failure('Not a number "_2"', '_2'))
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

  t.deepEqual(_0.decode('str').error, Optional(JsonValue('OBJECT', 'str')))
  t.deepEqual(_0.decode(1).error, Optional(JsonValue('OBJECT', 1)))
  t.deepEqual(_0.decode(1.1).error, Optional(JsonValue('OBJECT', 1.1)))
  t.deepEqual(_0.decode([]).error, Optional(JsonValue('OBJECT', [])))
  t.deepEqual(
    _0.decode({ _0: 1, _1: false, _2: 2 }).error,
    Optional(InField('_1', JsonValue('INT', false)))
  )
  t.deepEqual(
    _0.decode({ _0: 1, _1: 3, _2: null }).error,
    Optional(InField('_2', JsonValue('INT', null)))
  )
  t.deepEqual(
    _0.decode({ _0: undefined, _1: 3, _2: 2 }).error,
    Optional(InField('_0', JsonValue('INT', undefined)))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode({ 0: 'a', 1: 'b' }).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode({ 0: 'a', 1: 'b', _2: 'c' }).error,
    Optional(InField('_2', Failure('Not a number "_2"', '_2')))
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

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('OBJECT', null))
  )
  t.deepEqual(
    _0.decode({ _0: [] }).error,
    InField('_0', JsonValue('OBJECT', []))
  )

  // Decoder<[number, boolean][] | null>
  const _1 = Decode.field('_0').keyValue(toNumber, Decode.boolean)

  t.deepEqual(_1.decode({ _0: { 0: true, 1: false } }).value, [
    [0, true],
    [1, false]
  ])
  t.deepEqual(
    _1.decode({ _0: { 0: true, 1: false, _2: true } }).error,
    InField('_0', InField('_2', Failure('Not a number "_2"', '_2')))
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
    InField('_0', Optional(JsonValue('OBJECT', 'str')))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.field('_0').optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode({ _0: { 0: 'a', 1: 'b' } }).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode({ _0: { 0: 'a', 1: 'b', _2: null } }).error,
    InField('_0', Optional(InField('_2', Failure('Not a number "_2"', '_2'))))
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

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('OBJECT', null)))
  t.deepEqual(_0.decode(['', []]).error, AtIndex(1, JsonValue('OBJECT', [])))

  // Decoder<[number, boolean][] | null>
  const _1 = Decode.index(0).keyValue(toNumber, Decode.boolean)

  t.deepEqual(_1.decode([{ 0: true, 1: false }]).value, [
    [0, true],
    [1, false]
  ])
  t.deepEqual(
    _1.decode([{ 0: true, 1: false, _2: true }]).error,
    AtIndex(0, InField('_2', Failure('Not a number "_2"', '_2')))
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
    AtIndex(1, Optional(JsonValue('OBJECT', 'str')))
  )

  // Decoder<[number, string][] | null>
  const _1 = Decode.index(0).optional.keyValue(toNumber, Decode.string)

  t.deepEqual(_1.decode([{ 0: 'a', 1: 'b' }]).value, [
    [0, 'a'],
    [1, 'b']
  ])
  t.deepEqual(
    _1.decode([{ 0: 'a', 1: 'b', _2: null }]).error,
    AtIndex(0, Optional(InField('_2', Failure('Not a number "_2"', '_2'))))
  )
})
