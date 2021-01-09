/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import {
  Optional,
  InField,
  AtIndex,
  ExpectObject,
  ExpectInt,
  ExpectFloat
} from './error'

test('Decode.record()', t => {
  class Foo {
    public readonly pub = 1
    protected readonly prot = 2
    private readonly priv = 3

    public bar(): number {
      return this.priv
    }
  }

  // Decoder<Record<string, number>>
  const _0 = Decode.record(Decode.int)

  t.deepEqual(_0.decode({}).value, {})
  t.deepEqual(_0.decode({ 0: 123, 1: 456 }).value, { 0: 123, 1: 456 })
  t.deepEqual(_0.decode({ foo: 123, bar: 456 }).value, { foo: 123, bar: 456 })
  t.deepEqual(_0.decode(new Foo()).value, { pub: 1, prot: 2, priv: 3 })

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode(null).error, ExpectObject(null))
  t.deepEqual(_0.decode('str').error, ExpectObject('str'))
  t.deepEqual(_0.decode(1).error, ExpectObject(1))
  t.deepEqual(_0.decode(1.1).error, ExpectObject(1.1))
  t.deepEqual(_0.decode([]).error, ExpectObject([]))
  t.deepEqual(
    _0.decode({ foo: 123, bar: false }).error,
    InField('bar', ExpectInt(false))
  )
  t.deepEqual(
    _0.decode({ foo: 123, bar: null }).error,
    InField('bar', ExpectInt(null))
  )
  t.deepEqual(
    _0.decode({ foo: 123, bar: undefined }).error,
    InField('bar', ExpectInt(undefined))
  )

  // Decoder<Record<string, number | null>>
  const _1 = Decode.record(Decode.optional.int)

  t.deepEqual(_1.decode({ foo: 123, bar: null }).value, { foo: 123, bar: null })
  t.deepEqual(_1.decode({ foo: 123, bar: undefined }).value, {
    foo: 123,
    bar: null
  })

  // Decoder<Record<string, number>>
  const _2 = Decode.record(Decode.field('_0').int)

  t.deepEqual(_2.decode({ foo: { _0: 0 }, bar: { _0: 1 } }).value, {
    foo: 0,
    bar: 1
  })

  // Decoder<Record<string, string>>
  const _3 = Decode.record(Decode.index(0).string)

  t.deepEqual(_3.decode({ foo: ['f'], bar: ['b'] }).value, {
    foo: 'f',
    bar: 'b'
  })
})

test('Decode.optional.record()', t => {
  // Decoder<Record<string, number> | null>
  const _0 = Decode.optional.record(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.deepEqual(_0.decode({}).value, {})
  t.deepEqual(_0.decode({ 0: 1.23, 1: 4.56 }).value, { 0: 1.23, 1: 4.56 })
  t.deepEqual(_0.decode({ foo: 1.2, bar: 3.4 }).value, { foo: 1.2, bar: 3.4 })

  t.deepEqual(_0.decode('str').error, Optional(ExpectObject('str')))
  t.deepEqual(_0.decode(1).error, Optional(ExpectObject(1)))
  t.deepEqual(_0.decode(1.1).error, Optional(ExpectObject(1.1)))
  t.deepEqual(_0.decode([]).error, Optional(ExpectObject([])))
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: false }).error,
    Optional(InField('bar', ExpectFloat(false)))
  )
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: null }).error,
    Optional(InField('bar', ExpectFloat(null)))
  )
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: undefined }).error,
    Optional(InField('bar', ExpectFloat(undefined)))
  )
})

test('Decode.field().record()', t => {
  // Decoder<Record<string, string>>
  const _0 = Decode.field('_0').record(Decode.string)

  t.deepEqual(_0.decode({ _0: { foo: 'bar' } }).value, { foo: 'bar' })

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(_0.decode({ _0: [] }).error, InField('_0', ExpectObject([])))
})

test('Decode.field().optional.record()', t => {
  // Decode<Record<string, boolean> | null>
  const _0 = Decode.field('_0').optional.record(Decode.boolean)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.deepEqual(_0.decode({ _0: { foo: false } }).value, { foo: false })

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectObject('str')))
  )
})

test('Decode.index().record()', t => {
  // Decode<Record<string, number>>
  const _0 = Decode.index(1).record(Decode.int)

  t.deepEqual(_0.decode([0, { foo: 123 }]).value, { foo: 123 })

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectObject(null)))
  t.deepEqual(_0.decode(['', []]).error, AtIndex(1, ExpectObject([])))
})

test('Decode.index().optional.record()', t => {
  // Decode<Record<string, number> | null>
  const _0 = Decode.index(1).optional.record(Decode.float)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.deepEqual(_0.decode([0, { foo: 123 }]).value, { foo: 123 })

  t.deepEqual(_0.decode(['', []]).error, AtIndex(1, Optional(ExpectObject([]))))
})
