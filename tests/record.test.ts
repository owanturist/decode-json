/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, AtIndex, JsonValue } from '../src/error'

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

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode('str').error, JsonValue('OBJECT', 'str'))
  t.deepEqual(_0.decode(1).error, JsonValue('OBJECT', 1))
  t.deepEqual(_0.decode(1.1).error, JsonValue('OBJECT', 1.1))
  t.deepEqual(_0.decode([]).error, JsonValue('OBJECT', []))
  t.deepEqual(
    _0.decode({ foo: 123, bar: false }).error,
    InField('bar', JsonValue('INT', false))
  )
  t.deepEqual(
    _0.decode({ foo: 123, bar: null }).error,
    InField('bar', JsonValue('INT', null))
  )
  t.deepEqual(
    _0.decode({ foo: 123, bar: undefined }).error,
    InField('bar', JsonValue('INT', undefined))
  )

  // Decoder<Record<string, number | null>>
  const _1 = Decode.record(Decode.optional.int)

  t.deepEqual(_1.decode({ foo: 123, bar: null }).value, { foo: 123, bar: null })
  t.deepEqual(_1.decode({ foo: 123, bar: undefined }).value, {
    foo: 123,
    bar: null
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

  t.deepEqual(_0.decode('str').error, Optional(JsonValue('OBJECT', 'str')))
  t.deepEqual(_0.decode(1).error, Optional(JsonValue('OBJECT', 1)))
  t.deepEqual(_0.decode(1.1).error, Optional(JsonValue('OBJECT', 1.1)))
  t.deepEqual(_0.decode([]).error, Optional(JsonValue('OBJECT', [])))
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: false }).error,
    Optional(InField('bar', JsonValue('FLOAT', false)))
  )
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: null }).error,
    Optional(InField('bar', JsonValue('FLOAT', null)))
  )
  t.deepEqual(
    _0.decode({ foo: 1.23, bar: undefined }).error,
    Optional(InField('bar', JsonValue('FLOAT', undefined)))
  )

  // Decoder<Record<string, number | null> | null>
  const _1 = Decode.optional.record(Decode.optional.float)

  t.deepEqual(_1.decode({ foo: 1.23, bar: null }).value, {
    foo: 1.23,
    bar: null
  })
  t.deepEqual(_1.decode({ foo: 1.23, bar: undefined }).value, {
    foo: 1.23,
    bar: null
  })
})

test('Decode.field().record()', t => {
  // Decoder<Record<string, string>>
  const _0 = Decode.field('_0').record(Decode.string)

  t.deepEqual(_0.decode({ _0: { foo: 'bar' } }).value, { foo: 'bar' })

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('OBJECT', null))
  )
  t.deepEqual(
    _0.decode({ _0: [] }).error,
    InField('_0', JsonValue('OBJECT', []))
  )
})

test('Decode.field().optional.record()', t => {
  // Decode<Record<string, boolean> | null>
  const _0 = Decode.field('_0').optional.record(Decode.boolean)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.deepEqual(_0.decode({ _0: { foo: false } }).value, { foo: false })

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(JsonValue('OBJECT', 'str')))
  )
})

test('Decode.index().record()', t => {
  // Decode<Record<string, number>>
  const _0 = Decode.index(1).record(Decode.int)

  t.deepEqual(_0.decode([0, { foo: 123 }]).value, { foo: 123 })

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('OBJECT', null)))
  t.deepEqual(_0.decode(['', []]).error, AtIndex(1, JsonValue('OBJECT', [])))
})

test('Decode.index().optional.record()', t => {
  // Decode<Record<string, number> | null>
  const _0 = Decode.index(1).optional.record(Decode.float)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.deepEqual(_0.decode([0, { foo: 123 }]).value, { foo: 123 })

  t.deepEqual(
    _0.decode(['', []]).error,
    AtIndex(1, Optional(JsonValue('OBJECT', [])))
  )
})
