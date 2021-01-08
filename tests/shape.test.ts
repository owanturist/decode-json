/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import {
  InField,
  AtIndex,
  RequiredField,
  ExpectObject,
  ExpectString
} from './error'

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

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode(null).error, ExpectObject(null))
  t.deepEqual(_0.decode('str').error, ExpectObject('str'))
  t.deepEqual(_0.decode(1).error, ExpectObject(1))
  t.deepEqual(_0.decode(1.1).error, ExpectObject(1.1))
  t.deepEqual(_0.decode([]).error, ExpectObject([]))
  t.deepEqual(_0.decode({}).error, RequiredField('foo', {}))
  t.deepEqual(
    _0.decode({ foo: 1, bar: '' }).error,
    InField('foo', ExpectString(1))
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
  t.deepEqual(_2.decode(0).error, ExpectString(0))

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

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('foo', {}))
  )
})

test('Decode.index().shape()', t => {
  // Decoder<{
  //    _1: string
  // }>
  const _0 = Decode.index(1).shape({
    _1: Decode.field('foo').string
  })

  t.deepEqual(_0.decode([0, { foo: 'str' }]).value, { _1: 'str' })

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectObject(null)))
  t.deepEqual(_0.decode([0, {}]).error, AtIndex(1, RequiredField('foo', {})))
})
