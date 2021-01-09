/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import {
  Optional,
  AtIndex,
  RequiredIndex,
  ExpectArray,
  ExpectString,
  ExpectInt,
  ExpectFloat,
  ExpectBoolean
} from './error'

test('Decode.index().of', t => {
  // Decode<string>
  const _0 = Decode.index(1).of(Decode.string)

  t.is(_0.decode([null, 'str']).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(_0.decode(null).error, ExpectArray(null))
  t.deepEqual(_0.decode({}).error, ExpectArray({}))
  t.deepEqual(_0.decode([0]).error, RequiredIndex(1, [0]))
  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectString(null)))
  t.deepEqual(_0.decode([0, 1]).error, AtIndex(1, ExpectString(1)))
})

test('Decode.index().optional.int', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.int

  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([null, 123]).value, 123)

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(_0.decode(null).error, ExpectArray(null))
  t.deepEqual(_0.decode({}).error, ExpectArray({}))
  t.deepEqual(_0.decode([0]).error, RequiredIndex(1, [0]))
  t.deepEqual(
    _0.decode([0, 'str']).error,
    AtIndex(1, Optional(ExpectInt('str')))
  )
})

test('Decode.optional.index().of', t => {
  // Decode<number | null>
  const _0 = Decode.optional.index(1).of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([null, 1.23]).value, 1.23)

  t.deepEqual(_0.decode({}).error, Optional(ExpectArray({})))
  t.deepEqual(
    _0.decode([0, null]).error,
    Optional(AtIndex(1, ExpectFloat(null)))
  )
  t.deepEqual(
    _0.decode([0, false]).error,
    Optional(AtIndex(1, ExpectFloat(false)))
  )
})

test('Decode.optional.index().optional.boolean', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.index(1).optional.boolean

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([null, true]).value, true)

  t.deepEqual(_0.decode({}).error, Optional(ExpectArray({})))
  t.deepEqual(
    _0.decode([0, 123]).error,
    Optional(AtIndex(1, Optional(ExpectBoolean(123))))
  )
})

test('Decode.index().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).index(1).of(Decode.string)

  t.is(_0.decode([[null, 'str']]).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(_0.decode([null]).error, AtIndex(0, ExpectArray(null)))
  t.deepEqual(_0.decode([[]]).error, AtIndex(0, RequiredIndex(1, [])))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    AtIndex(0, AtIndex(1, ExpectString(null)))
  )
})

test('Decode.index().index().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.index(0).index(1).optional.string

  t.is(_0.decode([[1, undefined]]).value, null)
  t.is(_0.decode([[1, null]]).value, null)
  t.is(_0.decode([[null, 'str']]).value, 'str')

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(_0.decode([null]).error, AtIndex(0, ExpectArray(null)))
  t.deepEqual(_0.decode([[]]).error, AtIndex(0, RequiredIndex(1, [])))
})

test('Decode.index().optional.index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).optional.index(1).of(Decode.int)

  t.is(_0.decode([undefined]).value, null)
  t.is(_0.decode([null]).value, null)
  t.is(_0.decode([[]]).value, null)
  t.is(_0.decode([[null, 123]]).value, 123)

  t.deepEqual(_0.decode(undefined).error, ExpectArray(undefined))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    AtIndex(0, Optional(AtIndex(1, ExpectInt(null))))
  )
})

test('Decode.optional.index().index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.index(0).index(1).of(Decode.float)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([]).value, null)
  t.is(_0.decode([[null, 1.23]]).value, 1.23)

  t.deepEqual(_0.decode([null]).error, Optional(AtIndex(0, ExpectArray(null))))
  t.deepEqual(_0.decode([[]]).error, Optional(AtIndex(0, RequiredIndex(1, []))))
  t.deepEqual(
    _0.decode([[1, null]]).error,
    Optional(AtIndex(0, AtIndex(1, ExpectFloat(null))))
  )
})

test('Decode.optional.index().index().optional.of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.index(0).index(1).optional.boolean

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode([[1, undefined]]).value, null)
  t.is(_0.decode([[1, null]]).value, null)
  t.is(_0.decode([[null, false]]).value, false)

  t.deepEqual(_0.decode([null]).error, Optional(AtIndex(0, ExpectArray(null))))
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
    Optional(AtIndex(0, Optional(AtIndex(1, ExpectBoolean(null)))))
  )
})

test('Decode.optional.index().optional.index().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.index(0).optional.index(1).optional.string

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
    Optional(AtIndex(0, Optional(AtIndex(1, Optional(ExpectString(123))))))
  )
})

test('Decode.index().field().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).field('_0').index(1).of(Decode.string)

  t.is(_0.decode([{ _0: [null, 'str'] }]).value, 'str')
})

test('Decode.index().field().index().optional.float', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).field('_0').index(1).optional.float

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

test('Decode.optional.index().optional.field().optional.index().optional.string', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.index(0).optional.field('_0').optional.index(1)
    .optional.string

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
