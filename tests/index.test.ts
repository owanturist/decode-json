/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, AtIndex, RequiredIndex, JsonValue } from '../src/error'

test('Decode.index().of', t => {
  // Decode<string>
  const _0 = Decode.index(1).of(Decode.string)

  t.is(_0.decode([null, 'str']).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('ARRAY', null))
  t.deepEqual(_0.decode({}).error, JsonValue('ARRAY', {}))
  t.deepEqual(_0.decode([0]).error, RequiredIndex(1, [0]))
  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, JsonValue('STRING', null)))
  t.deepEqual(_0.decode([0, 1]).error, AtIndex(1, JsonValue('STRING', 1)))
})

test('Decode.index().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.of(Decode.int)

  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([null, 123]).value, 123)

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(_0.decode(null).error, JsonValue('ARRAY', null))
  t.deepEqual(_0.decode({}).error, JsonValue('ARRAY', {}))
  t.deepEqual(_0.decode([0]).error, RequiredIndex(1, [0]))
  t.deepEqual(
    _0.decode([0, 'str']).error,
    AtIndex(1, Optional(JsonValue('INT', 'str')))
  )
})

test('Decode.optional.index().of', t => {
  // Decode<number | null>
  const _0 = Decode.optional.index(1).of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([null, 1.23]).value, 1.23)

  t.deepEqual(_0.decode({}).error, Optional(JsonValue('ARRAY', {})))
  t.deepEqual(
    _0.decode([0, null]).error,
    Optional(AtIndex(1, JsonValue('FLOAT', null)))
  )
  t.deepEqual(
    _0.decode([0, false]).error,
    Optional(AtIndex(1, JsonValue('FLOAT', false)))
  )
})

test('Decode.optional.index().optional.of', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.index(1).optional.of(Decode.boolean)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([null, true]).value, true)

  t.deepEqual(_0.decode({}).error, Optional(JsonValue('ARRAY', {})))
  t.deepEqual(
    _0.decode([0, 123]).error,
    Optional(AtIndex(1, Optional(JsonValue('BOOLEAN', 123))))
  )
})

test('Decode.index().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).index(1).of(Decode.string)

  t.is(_0.decode([[null, 'str']]).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(_0.decode([null]).error, AtIndex(0, JsonValue('ARRAY', null)))
  t.deepEqual(_0.decode([[]]).error, AtIndex(0, RequiredIndex(1, [])))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    AtIndex(0, AtIndex(1, JsonValue('STRING', null)))
  )
})

test('Decode.index().index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.index(0).index(1).optional.of(Decode.string)

  t.is(_0.decode([[1, undefined]]).value, null)
  t.is(_0.decode([[1, null]]).value, null)
  t.is(_0.decode([[null, 'str']]).value, 'str')

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(_0.decode([null]).error, AtIndex(0, JsonValue('ARRAY', null)))
  t.deepEqual(_0.decode([[]]).error, AtIndex(0, RequiredIndex(1, [])))
})

test('Decode.index().optional.index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).optional.index(1).of(Decode.int)

  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([[]]).value, null)
  t.is(_0.decode([[null, 123]]).value, 123)

  t.deepEqual(_0.decode(undefined).error, JsonValue('ARRAY', undefined))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    AtIndex(0, Optional(AtIndex(1, JsonValue('INT', null))))
  )
})

test('Decode.optional.index().index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.index(0).index(1).of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([[null, 1.23]]).value, 1.23)

  t.deepEqual(
    _0.decode([null]).error,
    Optional(AtIndex(0, JsonValue('ARRAY', null)))
  )
  t.deepEqual(_0.decode([[]]).error, Optional(AtIndex(0, RequiredIndex(1, []))))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    Optional(AtIndex(0, AtIndex(1, JsonValue('FLOAT', null))))
  )
})

test('Decode.optional.index().index().optional.of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.index(0).index(1).optional.of(Decode.boolean)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([[1, undefined]]).value, null)
  t.is(_0.decode([[1, null]]).value, null)
  t.is(_0.decode([[null, false]]).value, false)

  t.deepEqual(
    _0.decode([null]).error,
    Optional(AtIndex(0, JsonValue('ARRAY', null)))
  )
  t.deepEqual(_0.decode([[]]).error, Optional(AtIndex(0, RequiredIndex(1, []))))
})

test('Decode.optional.index().optional.index().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.index(0).optional.index(1).of(Decode.boolean)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([[]]).value, null)
  t.is(_0.decode([[null, true]]).value, true)

  t.deepEqual(
    _0.decode([[1, null]]).error,
    Optional(AtIndex(0, Optional(AtIndex(1, JsonValue('BOOLEAN', null)))))
  )
})

test('Decode.optional.index().optional.index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .index(0)
    .optional.index(1)
    .optional.of(Decode.string)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([[]]).value, null)
  t.is(_0.decode([[1, undefined]]).value, null)
  t.is(_0.decode([[1, null]]).value, null)
  t.is(_0.decode([[null, 'str']]).value, 'str')

  t.deepEqual(
    _0.decode([[null, 123]]).error,
    Optional(
      AtIndex(0, Optional(AtIndex(1, Optional(JsonValue('STRING', 123)))))
    )
  )
})

test('Decode.index().field().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).field('_0').index(1).of(Decode.string)

  t.is(_0.decode([{ _0: [null, 'str'] }]).value, 'str')
})

test('Decode.index().field().index().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).field('_0').index(1).optional.of(Decode.float)

  t.is(_0.decode([{ _0: [null, undefined] }]).value, null)
  t.is(_0.decode([{ _0: [null, null] }]).value, null)
  t.is(_0.decode([{ _0: [null, 1.23] }]).value, 1.23)
})

test('Decode.index().field().optional.index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).field('_0').optional.index(1).of(Decode.int)

  t.is(_0.decode([{ _0: undefined }]).value, null)
  t.is(_0.decode([{ _0: null }]).value, null)
  t.is(_0.decode([{ _0: [] }]).value, null)
  t.is(_0.decode([{ _0: [null, 123] }]).value, 123)
})

test('Decode.index().optional.field().index().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.index(0).optional.field('_0').index(1).of(Decode.boolean)

  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([{}]).value, null)
  t.is(_0.decode([{ _0: [null, false] }]).value, false)
})

test('Decode.optional.index().field().index().of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.index(0).field('_0').index(1).of(Decode.string)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([{ _0: [null, 'str'] }]).value, 'str')
})

test('Decode.optional.index().optional.field().optional.index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .index(0)
    .optional.field('_0')
    .optional.index(1)
    .optional.of(Decode.string)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([{}]).value, null)
  t.is(_0.decode([{ _0: undefined }]).value, null)
  t.is(_0.decode([{ _0: null }]).value, null)
  t.is(_0.decode([{ _0: [] }]).value, null)
  t.is(_0.decode([{ _0: [null, undefined] }]).value, null)
  t.is(_0.decode([{ _0: [null, null] }]).value, null)
  t.is(_0.decode([{ _0: [null, 'str'] }]).value, 'str')
})
