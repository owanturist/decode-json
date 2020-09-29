/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, InField, RequiredField, JsonValue } from '../src/error'

test('Decode.field().of', t => {
  // Decode<string>
  const _0 = Decode.field('_0').of(Decode.string)

  t.is(_0.decode({ _0: 'str' }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode([0]).error, JsonValue('OBJECT', [0]))
  t.deepEqual(_0.decode({ _1: 0 }).error, RequiredField('_0', { _1: 0 }))
  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('STRING', null))
  )
  t.deepEqual(_0.decode({ _0: 1 }).error, InField('_0', JsonValue('STRING', 1)))
})

test('Decode.field().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.of(Decode.int)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 2 }).value, 2)

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('OBJECT', null))
  t.deepEqual(_0.decode([0]).error, JsonValue('OBJECT', [0]))
  t.deepEqual(_0.decode({ _1: 0 }).error, RequiredField('_0', { _1: 0 }))
  t.deepEqual(
    _0.decode({ _0: 1.23 }).error,
    InField('_0', Optional(JsonValue('INT', 1.23)))
  )
})

test('Decode.optional.field().of', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.field('_0').of(Decode.boolean)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: false }).value, false)

  t.deepEqual(_0.decode([0]).error, Optional(JsonValue('OBJECT', [0])))
  t.deepEqual(
    _0.decode({ _0: null }).error,
    Optional(InField('_0', JsonValue('BOOLEAN', null)))
  )
  t.deepEqual(
    _0.decode({ _0: 1 }).error,
    Optional(InField('_0', JsonValue('BOOLEAN', 1)))
  )
})

test('Decode.optional.field().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.optional.field('_0').optional.of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 2.23 }).value, 2.23)

  t.deepEqual(_0.decode([0]).error, Optional(JsonValue('OBJECT', [0])))
  t.deepEqual(
    _0.decode({ _0: false }).error,
    Optional(InField('_0', Optional(JsonValue('FLOAT', false))))
  )
})

test('Decode.field().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').field('_1').of(Decode.string)

  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('OBJECT', null))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    InField('_0', RequiredField('_1', {}))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    InField('_0', InField('_1', JsonValue('STRING', null)))
  )
})

test('Decode.field().field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.field('_0').field('_1').optional.of(Decode.string)

  t.is(_0.decode({ _0: { _1: null } }).value, null)
  t.is(_0.decode({ _0: { _1: undefined } }).value, null)
  t.is(_0.decode({ _0: { _1: 'str' } }).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))
  t.deepEqual(
    _0.decode({ _0: null }).error,
    InField('_0', JsonValue('OBJECT', null))
  )
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

  t.deepEqual(_0.decode(undefined).error, JsonValue('OBJECT', undefined))

  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    InField('_0', Optional(InField('_1', JsonValue('STRING', null))))
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
    Optional(InField('_0', JsonValue('OBJECT', null)))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    Optional(InField('_0', RequiredField('_1', {})))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: null } }).error,
    Optional(InField('_0', InField('_1', JsonValue('BOOLEAN', null))))
  )
})

test('Decode.optional.field().field().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.field('_0').field('_1').optional.of(Decode.int)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode({}).value, null)
  t.is(_0.decode({ _0: { _1: undefined } }).value, null)
  t.is(_0.decode({ _0: { _1: null } }).value, null)
  t.is(_0.decode({ _0: { _1: 123 } }).value, 123)

  t.deepEqual(
    _0.decode({ _0: null }).error,
    Optional(InField('_0', JsonValue('OBJECT', null)))
  )
  t.deepEqual(
    _0.decode({ _0: {} }).error,
    Optional(InField('_0', RequiredField('_1', {})))
  )
  t.deepEqual(
    _0.decode({ _0: { _1: 'str' } }).error,
    Optional(InField('_0', InField('_1', Optional(JsonValue('INT', 'str')))))
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
    Optional(InField('_0', Optional(InField('_1', JsonValue('FLOAT', null)))))
  )
})

test('Decode.optional.field().optional.field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .field('_0')
    .optional.field('_1')
    .optional.of(Decode.string)

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
      InField('_0', Optional(InField('_1', Optional(JsonValue('STRING', 123)))))
    )
  )
})

test('Decode.field().index().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').index(0).field('_1').of(Decode.string)

  t.is(_0.decode({ _0: [{ _1: 'str' }] }).value, 'str')
})

test('Decode.field().index().field().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.field('_0').index(0).field('_1').optional.of(Decode.float)

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

test('Decode.optional.field().optional.index().optional.field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .field('_0')
    .optional.index(0)
    .optional.field('_1')
    .optional.of(Decode.string)

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
