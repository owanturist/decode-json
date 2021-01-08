/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import {
  Optional,
  InField,
  RequiredField,
  ExpectObject,
  ExpectString,
  ExpectInt,
  ExpectFloat,
  ExpectBoolean
} from './error'

test('Decode.field().of', t => {
  // Decode<string>
  const _0 = Decode.field('_0').of(Decode.string)

  t.is(_0.decode({ _0: 'str' }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode(null).error, ExpectObject(null))
  t.deepEqual(_0.decode([0]).error, ExpectObject([0]))
  t.deepEqual(_0.decode({ _1: 0 }).error, RequiredField('_0', { _1: 0 }))
  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectString(null)))
  t.deepEqual(_0.decode({ _0: 1 }).error, InField('_0', ExpectString(1)))
})

test('Decode.field().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.int

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 2 }).value, 2)

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode(null).error, ExpectObject(null))
  t.deepEqual(_0.decode([0]).error, ExpectObject([0]))
  t.deepEqual(_0.decode({ _1: 0 }).error, RequiredField('_0', { _1: 0 }))
  t.deepEqual(
    _0.decode({ _0: 1.23 }).error,
    InField('_0', Optional(ExpectInt(1.23)))
  )
})

test('Decode.optional.field().of', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.field('_0').of(Decode.boolean)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: false }).value, false)

  t.deepEqual(_0.decode([0]).error, Optional(ExpectObject([0])))
  t.deepEqual(
    _0.decode({ _0: null }).error,
    Optional(InField('_0', ExpectBoolean(null)))
  )
  t.deepEqual(
    _0.decode({ _0: 1 }).error,
    Optional(InField('_0', ExpectBoolean(1)))
  )
})

test('Decode.optional.field().optional.float', t => {
  // Decode<number | null>
  const _0 = Decode.optional.field('_0').optional.float

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 2.23 }).value, 2.23)

  t.deepEqual(_0.decode([0]).error, Optional(ExpectObject([0])))
  t.deepEqual(
    _0.decode({ _0: false }).error,
    Optional(InField('_0', Optional(ExpectFloat(false))))
  )
})

test('Decode.field().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').field('_1').of(Decode.string)

  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('_1', {}))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    InField('_0', InField('_1', ExpectString(null)))
  )
})

test('Decode.field().field().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.field('_0').field('_1').optional.string

  t.is(_0.decode({ _0: { _1: null } }).value, null)
  t.is(_0.decode({ _0: { _1: undefined } }).value, null)
  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))
  t.deepEqual(_0.decode({ _0: null }).error, InField('_0', ExpectObject(null)))
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('_1', {}))
  )
})

test('Decode.field().optional.field().of', t => {
  // Decoder<string | null>
  const _0 = Decode.field('_0').optional.field('_1').of(Decode.string)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: {} }).value, null)
  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectObject(undefined))

  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    InField('_0', Optional(InField('_1', ExpectString(null))))
  )
})

test('Decode.optional.field().field().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.field('_0').field('_1').of(Decode.boolean)

  t.is(_0.decode(null).value, null)
  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: { _1: true } }).value, true)

  t.deepEqual(
    _0.decode({ _0: null }).error,
    Optional(InField('_0', ExpectObject(null)))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    Optional(InField('_0', RequiredField('_1', {})))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    Optional(InField('_0', InField('_1', ExpectBoolean(null))))
  )
})

test('Decode.optional.field().field().optional.int', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.field('_0').field('_1').optional.int

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: { _1: undefined } }).value, null)
  t.is(_0.decode({ _0: { _1: null } }).value, null)
  t.is(_0.decode({ _0: { _1: 123 } }).value, 123)

  t.deepEqual(
    _0.decode({ _0: null }).error,
    Optional(InField('_0', ExpectObject(null)))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    Optional(InField('_0', RequiredField('_1', {})))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: 'str' } }).error,
    Optional(InField('_0', InField('_1', Optional(ExpectInt('str')))))
  )
})

test('Decode.optional.field().optional.field().of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.field('_0').optional.field('_1').of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: {} }).value, null)
  t.is(_0.decode({ _0: { _1: 1.32 } }).value, 1.32)

  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    Optional(InField('_0', Optional(InField('_1', ExpectFloat(null)))))
  )
})

test('Decode.optional.field().optional.field().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.field('_0').optional.field('_1').optional.string

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: {} }).value, null)
  t.is(_0.decode({ _0: { _1: undefined } }).value, null)
  t.is(_0.decode({ _0: { _1: null } }).value, null)
  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(
    _0.decode({ _0: { _1: 123 } }).error,
    Optional(
      InField('_0', Optional(InField('_1', Optional(ExpectString(123)))))
    )
  )
})

test('Decode.field().index().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').index(0).field('_1').of(Decode.string)

  t.is(_0.decode({ _0: [{ _1: 'str' }] }).value, 'str')
})

test('Decode.field().index().field().optional.float', t => {
  // Decoder<number | null>
  const _0 = Decode.field('_0').index(0).field('_1').optional.float

  t.is(_0.decode({ _0: [{ _1: undefined }] }).value, null)
  t.is(_0.decode({ _0: [{ _1: null }] }).value, null)
  t.is(_0.decode({ _0: [{ _1: 123 }] }).value, 123)
})

test('Decode.field().index().optional.field().of', t => {
  // Decoder<number | null>
  const _0 = Decode.field('_0').index(0).optional.field('_1').of(Decode.float)

  t.is(_0.decode({ _0: [undefined] }).value, null)
  t.is(_0.decode({ _0: [null] }).value, null)
  t.is(_0.decode({ _0: [{}] }).value, null)
  t.is(_0.decode({ _0: [{ _1: 12.34 }] }).value, 12.34)
})

test('Decode.field().optional.index().field().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.field('_0').optional.index(0).field('_1').of(Decode.boolean)

  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: [] }).value, null)
  t.is(_0.decode({ _0: [{ _1: false }] }).value, false)
})

test('Decode.optional.field().index().field().of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.field('_0').index(0).field('_1').of(Decode.string)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: [{ _1: 'str' }] }).value, 'str')
})

test('Decode.optional.field().optional.index().optional.field().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.field('_0').optional.index(0).optional.field('_1')
    .optional.string

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: [] }).value, null)
  t.is(_0.decode({ _0: [undefined] }).value, null)
  t.is(_0.decode({ _0: [null] }).value, null)
  t.is(_0.decode({ _0: [{}] }).value, null)
  t.is(_0.decode({ _0: [{ _1: undefined }] }).value, null)
  t.is(_0.decode({ _0: [{ _1: null }] }).value, null)
  t.is(_0.decode({ _0: [{ _1: 'str' }] }).value, 'str')
})
