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

test('Decode.tuple()', t => {
  // Decoder<[string, number]>
  const _0 = Decode.tuple(Decode.field('foo').string, Decode.field('bar').int)

  t.deepEqual(_0.decode({ foo: 'str', bar: 1 }).value, ['str', 1])

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

  // Decoder<[boolean, number]>
  const _1 = Decode.tuple([Decode.index(0).boolean, Decode.index(2).int])

  t.deepEqual(_1.decode([false, null, 42]).value, [false, 42])

  // Decoder<[string, unknown]>
  const _2 = Decode.tuple(Decode.string, Decode.unknown)

  t.deepEqual(_2.decode('str').value, ['str', 'str'])
  t.deepEqual(_2.decode(0).error, ExpectString(0))

  // Decoder<[[number, string], boolean>
  const _3 = Decode.tuple([
    Decode.field('foo').tuple(
      Decode.field('bar').float,
      Decode.field('baz').string
    ),
    Decode.field('taz').boolean
  ])

  t.deepEqual(_3.decode({ foo: { bar: 1.23, baz: 'str' }, taz: true }).value, [
    [1.23, 'str'],
    true
  ])
})

test('Decode.field().tuple()', t => {
  // Decoder<[string, number]>
  const _0 = Decode.field('_0').tuple(
    Decode.field('foo').string,
    Decode.field('bar').int
  )

  t.deepEqual(_0.decode({ _0: { foo: 'str', bar: 123 } }).value, ['str', 123])

  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('foo', {}))
  )
})

test('Decode.index().shape()', t => {
  // Decoder<[string, number]>
  const _0 = Decode.index(1).tuple([
    Decode.field('foo').string,
    Decode.field('bar').int
  ])

  t.deepEqual(_0.decode([0, { foo: 'str', bar: 123 }]).value, ['str', 123])

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectObject(null)))
  t.deepEqual(_0.decode([0, {}]).error, AtIndex(1, RequiredField('foo', {})))
})
