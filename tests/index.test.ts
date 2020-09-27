/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right } from '../src'
import {
  Optional,
  AtIndex,
  RequiredIndex,
  InField,
  RequiredField,
  JsonValue
} from '../src/error'

test('Decode.index().of', t => {
  // Decode<string>
  const _0 = Decode.index(1).of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([0]), Left(RequiredIndex(1, [0])))

  t.deepEqual(_0.decode([0, null]), Left(AtIndex(1, JsonValue('STRING', null))))

  t.deepEqual(_0.decode([0, 1]), Left(AtIndex(1, JsonValue('STRING', 1))))

  t.deepEqual(_0.decode([null, 'str']), Right('str'))
})

test('Decode.index().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.index(1).optional.of(Decode.int)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode({}), Left(JsonValue('ARRAY', {})))

  t.deepEqual(_0.decode([0]), Left(RequiredIndex(1, [0])))

  t.deepEqual(_0.decode([0, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 'str']),
    Left(AtIndex(1, Optional(JsonValue('INT', 'str'))))
  )

  t.deepEqual(_0.decode([null, 123]), Right(123))
})

test('Decode.optional.index().of', t => {
  // Decode<number | null>
  const _0 = Decode.optional.index(1).of(Decode.float)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode({}), Left(Optional(JsonValue('ARRAY', {}))))

  t.deepEqual(_0.decode([0]), Right(null))

  t.deepEqual(
    _0.decode([0, null]),
    Left(Optional(AtIndex(1, JsonValue('FLOAT', null))))
  )

  t.deepEqual(
    _0.decode([0, false]),
    Left(Optional(AtIndex(1, JsonValue('FLOAT', false))))
  )

  t.deepEqual(_0.decode([null, 1.23]), Right(1.23))
})

test('Decode.optional.index().optional.of', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.index(1).optional.of(Decode.boolean)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode({}), Left(Optional(JsonValue('ARRAY', {}))))

  t.deepEqual(_0.decode([0]), Right(null))

  t.deepEqual(_0.decode([0, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 123]),
    Left(Optional(AtIndex(1, Optional(JsonValue('BOOLEAN', 123)))))
  )

  t.deepEqual(_0.decode([null, true]), Right(true))
})

test('Decode.index().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).index(1).of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode([null]), Left(AtIndex(0, JsonValue('ARRAY', null))))

  t.deepEqual(_0.decode([[]]), Left(AtIndex(0, RequiredIndex(1, []))))

  t.deepEqual(
    _0.decode([[1, null]]),
    Left(AtIndex(0, AtIndex(1, JsonValue('STRING', null))))
  )

  t.deepEqual(_0.decode([[null, 'str']]), Right('str'))
})

test('Decode.index().index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.index(0).index(1).optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode([null]), Left(AtIndex(0, JsonValue('ARRAY', null))))

  t.deepEqual(_0.decode([[]]), Left(AtIndex(0, RequiredIndex(1, []))))

  t.deepEqual(_0.decode([[1, null]]), Right(null))

  t.deepEqual(_0.decode([[null, 'str']]), Right('str'))
})

test('Decode.index().optional.index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).optional.index(1).of(Decode.int)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('ARRAY', undefined)))

  t.deepEqual(_0.decode([null]), Right(null))

  t.deepEqual(_0.decode([[]]), Right(null))

  t.deepEqual(
    _0.decode([[1, null]]),
    Left(AtIndex(0, Optional(AtIndex(1, JsonValue('INT', null)))))
  )

  t.deepEqual(_0.decode([[null, 123]]), Right(123))
})

test('Decode.optional.index().index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.index(0).index(1).of(Decode.float)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(
    _0.decode([null]),
    Left(Optional(AtIndex(0, JsonValue('ARRAY', null))))
  )

  t.deepEqual(_0.decode([[]]), Left(Optional(AtIndex(0, RequiredIndex(1, [])))))

  t.deepEqual(
    _0.decode([[1, null]]),
    Left(Optional(AtIndex(0, AtIndex(1, JsonValue('FLOAT', null)))))
  )

  t.deepEqual(_0.decode([[null, 1.23]]), Right(1.23))
})

test('Decode.optional.index().index().optional.of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.index(0).index(1).optional.of(Decode.boolean)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(
    _0.decode([null]),
    Left(Optional(AtIndex(0, JsonValue('ARRAY', null))))
  )

  t.deepEqual(_0.decode([[]]), Left(Optional(AtIndex(0, RequiredIndex(1, [])))))

  t.deepEqual(_0.decode([[1, null]]), Right(null))

  t.deepEqual(_0.decode([[null, false]]), Right(false))
})

test('Decode.optional.index().optional.index().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.index(0).optional.index(1).of(Decode.boolean)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode([null]), Right(null))

  t.deepEqual(_0.decode([[]]), Right(null))

  t.deepEqual(
    _0.decode([[1, null]]),
    Left(Optional(AtIndex(0, Optional(AtIndex(1, JsonValue('BOOLEAN', null))))))
  )

  t.deepEqual(_0.decode([[null, true]]), Right(true))
})

test('Decode.optional.index().optional.index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .index(0)
    .optional.index(1)
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode([null]), Right(null))

  t.deepEqual(_0.decode([[]]), Right(null))

  t.deepEqual(_0.decode([[1, null]]), Right(null))

  t.deepEqual(
    _0.decode([[null, 123]]),
    Left(
      Optional(
        AtIndex(0, Optional(AtIndex(1, Optional(JsonValue('STRING', 123)))))
      )
    )
  )

  t.deepEqual(_0.decode([[null, 'str']]), Right('str'))
})

test('Decode.index().field().index().of', t => {
  // Decoder<string>
  const _0 = Decode.index(0).field('_0').index(1).of(Decode.string)

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(0, [])))

  t.deepEqual(_0.decode([{}]), Left(AtIndex(0, RequiredField('_0', {}))))

  t.deepEqual(
    _0.decode([{ _0: [] }]),
    Left(AtIndex(0, InField('_0', RequiredIndex(1, []))))
  )

  t.deepEqual(
    _0.decode([{ _0: [null, null] }]),
    Left(AtIndex(0, InField('_0', AtIndex(1, JsonValue('STRING', null)))))
  )

  t.deepEqual(_0.decode([{ _0: [null, 'str'] }]), Right('str'))
})

test('Decode.index().field().index().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).field('_0').index(1).optional.of(Decode.float)

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(0, [])))

  t.deepEqual(_0.decode([{}]), Left(AtIndex(0, RequiredField('_0', {}))))

  t.deepEqual(
    _0.decode([{ _0: [] }]),
    Left(AtIndex(0, InField('_0', RequiredIndex(1, []))))
  )

  t.deepEqual(_0.decode([{ _0: [null, null] }]), Right(null))

  t.deepEqual(_0.decode([{ _0: [null, 1.23] }]), Right(1.23))
})

test('Decode.index().field().optional.index().of', t => {
  // Decoder<number | null>
  const _0 = Decode.index(0).field('_0').optional.index(1).of(Decode.int)

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(0, [])))

  t.deepEqual(_0.decode([{}]), Left(AtIndex(0, RequiredField('_0', {}))))

  t.deepEqual(_0.decode([{ _0: [] }]), Right(null))

  t.deepEqual(
    _0.decode([{ _0: [null, null] }]),
    Left(
      AtIndex(0, InField('_0', Optional(AtIndex(1, JsonValue('INT', null)))))
    )
  )

  t.deepEqual(_0.decode([{ _0: [null, 123] }]), Right(123))
})

test('Decode.index().optional.field().index().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.index(0).optional.field('_0').index(1).of(Decode.boolean)

  t.deepEqual(_0.decode(null), Left(JsonValue('ARRAY', null)))

  t.deepEqual(_0.decode([]), Left(RequiredIndex(0, [])))

  t.deepEqual(_0.decode([{}]), Right(null))

  t.deepEqual(
    _0.decode([{ _0: [] }]),
    Left(AtIndex(0, Optional(InField('_0', RequiredIndex(1, [])))))
  )

  t.deepEqual(
    _0.decode([{ _0: [null, null] }]),
    Left(
      AtIndex(
        0,
        Optional(InField('_0', AtIndex(1, JsonValue('BOOLEAN', null))))
      )
    )
  )

  t.deepEqual(_0.decode([{ _0: [null, false] }]), Right(false))
})

test('Decode.optional.index().field().index().of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.index(0).field('_0').index(1).of(Decode.string)

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(
    _0.decode([{}]),
    Left(Optional(AtIndex(0, RequiredField('_0', {}))))
  )

  t.deepEqual(
    _0.decode([{ _0: [] }]),
    Left(Optional(AtIndex(0, InField('_0', RequiredIndex(1, [])))))
  )

  t.deepEqual(
    _0.decode([{ _0: [null, null] }]),
    Left(
      Optional(AtIndex(0, InField('_0', AtIndex(1, JsonValue('STRING', null)))))
    )
  )

  t.deepEqual(_0.decode([{ _0: [null, 'str'] }]), Right('str'))
})

test('Decode.optional.index().optional.field().optional.index().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .index(0)
    .optional.field('_0')
    .optional.index(1)
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(_0.decode([{}]), Right(null))

  t.deepEqual(_0.decode([{ _0: [] }]), Right(null))

  t.deepEqual(_0.decode([{ _0: [null, null] }]), Right(null))

  t.deepEqual(_0.decode([{ _0: [null, 'str'] }]), Right('str'))
})
