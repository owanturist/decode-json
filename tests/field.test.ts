/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right } from '../src'
import {
  Optional,
  InField,
  RequiredField,
  AtIndex,
  RequiredIndex,
  JsonValue
} from '../src/error'

test('Decode.field().of', t => {
  // Decode<string>
  const _0 = Decode.field('_0').of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('STRING', null)))
  )

  t.deepEqual(_0.decode({ _0: 1 }), Left(InField('_0', JsonValue('STRING', 1))))

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.field().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.field('_0').optional.of(Decode.int)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode([0]), Left(JsonValue('OBJECT', [0])))

  t.deepEqual(_0.decode({ _1: 0 }), Left(RequiredField('_0', { _1: 0 })))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1.23 }),
    Left(InField('_0', Optional(JsonValue('INT', 1.23))))
  )

  t.deepEqual(_0.decode({ _0: 2 }), Right(2))
})

test('Decode.optional.field().of', t => {
  // Decode<boolean | null>
  const _0 = Decode.optional.field('_0').of(Decode.boolean)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([0]), Left(Optional(JsonValue('OBJECT', [0]))))

  t.deepEqual(_0.decode({ _1: 0 }), Right(null))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(Optional(InField('_0', JsonValue('BOOLEAN', null))))
  )

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(Optional(InField('_0', JsonValue('BOOLEAN', 1))))
  )

  t.deepEqual(_0.decode({ _0: false }), Right(false))
})

test('Decode.optional.field().optional.of', t => {
  // Decode<number | null>
  const _0 = Decode.optional.field('_0').optional.of(Decode.float)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([0]), Left(Optional(JsonValue('OBJECT', [0]))))

  t.deepEqual(_0.decode({ _1: 0 }), Right(null))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: false }),
    Left(Optional(InField('_0', Optional(JsonValue('FLOAT', false)))))
  )

  t.deepEqual(_0.decode({ _0: 2.23 }), Right(2.23))
})

test('Decode.field().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').field('_1').of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('OBJECT', null)))
  )

  t.deepEqual(
    _0.decode({ _0: {} }),
    Left(InField('_0', RequiredField('_1', {})))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Left(InField('_0', InField('_1', JsonValue('STRING', null))))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 'str'
      }
    }),
    Right('str')
  )
})

test('Decode.field().field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.field('_0').field('_1').optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(InField('_0', JsonValue('OBJECT', null)))
  )

  t.deepEqual(
    _0.decode({ _0: {} }),
    Left(InField('_0', RequiredField('_1', {})))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 'str'
      }
    }),
    Right('str')
  )
})

test('Decode.field().optional.field().of', t => {
  // Decoder<string | null>
  const _0 = Decode.field('_0').optional.field('_1').of(Decode.string)

  t.deepEqual(_0.decode(undefined), Left(JsonValue('OBJECT', undefined)))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: {} }), Right(null))

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Left(InField('_0', Optional(InField('_1', JsonValue('STRING', null)))))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 'str'
      }
    }),
    Right('str')
  )
})

test('Decode.optional.field().field().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.optional.field('_0').field('_1').of(Decode.boolean)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(Optional(InField('_0', JsonValue('OBJECT', null))))
  )

  t.deepEqual(
    _0.decode({ _0: {} }),
    Left(Optional(InField('_0', RequiredField('_1', {}))))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Left(Optional(InField('_0', InField('_1', JsonValue('BOOLEAN', null)))))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: true
      }
    }),
    Right(true)
  )
})

test('Decode.optional.field().field().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.field('_0').field('_1').optional.of(Decode.int)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(Optional(InField('_0', JsonValue('OBJECT', null))))
  )

  t.deepEqual(
    _0.decode({ _0: {} }),
    Left(Optional(InField('_0', RequiredField('_1', {}))))
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 'str'
      }
    }),
    Left(
      Optional(InField('_0', InField('_1', Optional(JsonValue('INT', 'str')))))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 123
      }
    }),
    Right(123)
  )
})

test('Decode.optional.field().optional.field().of', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.field('_0').optional.field('_1').of(Decode.float)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: {} }), Right(null))

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Left(
      Optional(InField('_0', Optional(InField('_1', JsonValue('FLOAT', null)))))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 1.32
      }
    }),
    Right(1.32)
  )
})

test('Decode.optional.field().optional.field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .field('_0')
    .optional.field('_1')
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(_0.decode({ _0: {} }), Right(null))

  t.deepEqual(
    _0.decode({
      _0: {
        _1: null
      }
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 123
      }
    }),
    Left(
      Optional(
        InField(
          '_0',
          Optional(InField('_1', Optional(JsonValue('STRING', 123))))
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {
        _1: 'str'
      }
    }),
    Right('str')
  )
})

test('Decode.field().index().field().of', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').index(0).field('_1').of(Decode.string)

  t.deepEqual(_0.decode(null), Left(JsonValue('OBJECT', null)))

  t.deepEqual(_0.decode({}), Left(RequiredField('_0', {})))

  t.deepEqual(_0.decode({ _0: [] }), Left(InField('_0', RequiredIndex(0, []))))

  t.deepEqual(
    _0.decode({ _0: [{}] }),
    Left(InField('_0', AtIndex(0, RequiredField('_1', {}))))
  )

  t.deepEqual(
    _0.decode({ _0: [{ _1: null }] }),
    Left(InField('_0', AtIndex(0, InField('_1', JsonValue('STRING', null)))))
  )

  t.deepEqual(
    _0.decode({
      _0: [{ _1: 'str' }]
    }),
    Right('str')
  )
})

test('Decode.field().index().field().optional.of', t => {
  // Decoder<number | null>
  const _0 = Decode.field('_0').index(0).field('_1').optional.of(Decode.float)

  t.deepEqual(
    _0.decode({
      _0: [{ _1: null }]
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: [{ _1: 123 }]
    }),
    Right(123)
  )
})

test('Decode.field().index().optional.field().of', t => {
  // Decoder<number | null>
  const _0 = Decode.field('_0').index(0).optional.field('_1').of(Decode.float)

  t.deepEqual(
    _0.decode({
      _0: [null, { _1: 12.34 }]
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: [{ _1: 12.34 }]
    }),
    Right(12.34)
  )
})

test('Decode.field().optional.index().field().of', t => {
  // Decoder<boolean | null>
  const _0 = Decode.field('_0').optional.index(0).field('_1').of(Decode.boolean)

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Right(null)
  )

  t.deepEqual(
    _0.decode({
      _0: [{ _1: false }]
    }),
    Right(false)
  )
})

test('Decode.optional.field().index().field().of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional.field('_0').index(0).field('_1').of(Decode.string)

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(
    _0.decode({
      _0: [{ _1: 'str' }]
    }),
    Right('str')
  )
})

test('Decode.optional.field().optional.index().optional.field().optional.of', t => {
  // Decoder<string | null>
  const _0 = Decode.optional
    .field('_0')
    .optional.index(0)
    .optional.field('_1')
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode({}), Right(null))

  t.deepEqual(_0.decode({ _0: [] }), Right(null))

  t.deepEqual(_0.decode({ _0: [{}] }), Right(null))

  t.deepEqual(_0.decode({ _0: [{ _1: null }] }), Right(null))

  t.deepEqual(
    _0.decode({
      _0: [{ _1: 'str' }]
    }),
    Right('str')
  )
})
