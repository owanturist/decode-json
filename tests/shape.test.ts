/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { InField, AtIndex, RequiredField, JsonValue } from '../src/error'

test('Decode.shape()', t => {
  // Decoder<{
  //    0: string
  //    _1: number
  // }>
  const _0 = Decode.shape({
    0: Decode.field('foo').string,
    _1: Decode.field('bar').int
  })

  t.deepEqual(_0.decode({ foo: 'str', bar: 1 }).value, { 0: 'str', _1: 1 })

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode('str').error, JsonValue('OBJECT', 'str'))
  t.deepEqual(_0.decode(1).error, JsonValue('OBJECT', 1))
  t.deepEqual(_0.decode(1.1).error, JsonValue('OBJECT', 1.1))
  t.deepEqual(_0.decode([]).error, JsonValue('OBJECT', []))
  t.deepEqual(_0.decode({}).error, RequiredField('foo', {}))
  t.deepEqual(
    _0.decode({ foo: 1, bar: '' }).error,
    InField('foo', JsonValue('STRING', 1))
  )
  t.deepEqual(
    _0.decode({ foo: 'str' }).error,
    RequiredField('bar', { foo: 'str' })
  )

  // Decoder<Record<string, unknown>>
  const _1 = Decode.shape({})

  t.deepEqual(_1.decode(null).value, {})

  // Decoder<{
  //    _0: string
  //    _1: unknown
  // }>
  const _2 = Decode.shape({
    _0: Decode.string,
    _1: Decode.unknown
  })

  t.deepEqual(_2.decode('str').value, { _0: 'str', _1: 'str' })
  t.deepEqual(_2.decode(0).error, JsonValue('STRING', 0))

  // Decoder<{
  //    _0: {
  //        _1: number
  //    }
  // }>
  const _3 = Decode.shape({
    _0: Decode.field('foo').shape({
      _1: Decode.field('bar').float
    })
  })

  t.deepEqual(_3.decode({ foo: { bar: 1.23 } }).value, { _0: { _1: 1.23 } })
})

test('Decode.field().shape()', t => {
  // Decoder<{
  //    _1: string
  // }>
  const _0 = Decode.field('_0').shape({
    _1: Decode.field('foo').string
  })

  t.deepEqual(_0.decode({ _0: { foo: 'str' } }).value, { _1: 'str' })

  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('OBJECT', null))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('foo', {}))
  )
})

test('Decode.index().list()', t => {
  // Decoder<{
  //    _1: string
  // }>
  const _0 = Decode.index(1).shape({
    _1: Decode.field('foo').string
  })

  t.deepEqual(_0.decode([0, { foo: 'str' }]).value, { _1: 'str' })

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('OBJECT', null)))
  t.deepEqual(_0.decode([0, {}]).error, AtIndex(1, RequiredField('foo', {})))
})