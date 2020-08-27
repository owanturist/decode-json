/* eslint-disable no-undefined */

import test from 'ava'

import Decode, {
  Left,
  Right,
  FieldErr,
  IndexErr,
  FailureErr
} from '../src/refactor'

test('Decode.string', t => {
  t.deepEqual(
    Decode.string.decode(undefined),
    Left(FailureErr('Expecting a STRING', undefined))
  )

  t.deepEqual(
    Decode.string.decode(null),
    Left(FailureErr('Expecting a STRING', null))
  )

  t.deepEqual(Decode.string.decode('str'), Right('str'))

  t.deepEqual(
    Decode.string.decode(true),
    Left(FailureErr('Expecting a STRING', true))
  )

  t.deepEqual(
    Decode.string.decode(1),
    Left(FailureErr('Expecting a STRING', 1))
  )

  t.deepEqual(
    Decode.string.decode(1.1),
    Left(FailureErr('Expecting a STRING', 1.1))
  )
})

test('Decode.field(name).string', t => {
  // Decode<string>
  const _0 = Decode.field('_0').string

  t.deepEqual(
    _0.decode(undefined),
    Left(FailureErr('Expecting an OBJECT', undefined))
  )

  t.deepEqual(_0.decode(null), Left(FailureErr('Expecting an OBJECT', null)))

  t.deepEqual(_0.decode([]), Left(FailureErr('Expecting an OBJECT', [])))

  t.deepEqual(
    _0.decode({}),
    Left(FailureErr("Expecting an OBJECT with a FIELD named '_0'", {}))
  )

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(FieldErr('_0', FailureErr('Expecting a STRING', null)))
  )

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(FieldErr('_0', FailureErr('Expecting a STRING', 1)))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.field(name).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.field('_0').optional.string

  t.deepEqual(
    _0.decode(undefined),
    Left(FailureErr('Expecting an OBJECT', undefined))
  )

  t.deepEqual(_0.decode(null), Left(FailureErr('Expecting an OBJECT', null)))

  t.deepEqual(_0.decode([]), Left(FailureErr('Expecting an OBJECT', [])))

  t.deepEqual(
    _0.decode({}),
    Left(FailureErr("Expecting an OBJECT with a FIELD named '_0'", {}))
  )

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(FieldErr('_0', FailureErr('Expecting an OPTIONAL STRING', 1)))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.optional.field(name).string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.field('_0').string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(
    _0.decode([]),
    Left(FailureErr('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Right(null))

  t.deepEqual(
    _0.decode({ _0: null }),
    Left(FieldErr('_0', FailureErr('Expecting a STRING', null)))
  )

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(FieldErr('_0', FailureErr('Expecting a STRING', 1)))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.optional.field(name).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.field('_0').optional.string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(
    _0.decode([]),
    Left(FailureErr('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Right(null))

  t.deepEqual(_0.decode({ _0: null }), Right(null))

  t.deepEqual(
    _0.decode({ _0: 1 }),
    Left(FieldErr('_0', FailureErr('Expecting an OPTIONAL STRING', 1)))
  )

  t.deepEqual(_0.decode({ _0: 'str' }), Right('str'))
})

test('Decode.index(position).string', t => {
  // Decode<string>
  const _0 = Decode.index(1).string

  t.deepEqual(
    _0.decode(undefined),
    Left(FailureErr('Expecting an ARRAY', undefined))
  )

  t.deepEqual(_0.decode(null), Left(FailureErr('Expecting an ARRAY', null)))

  t.deepEqual(
    _0.decode([]),
    Left(
      FailureErr(
        'Expecting an ARRAY with an ELEMENT at [1] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode({}), Left(FailureErr('Expecting an ARRAY', {})))

  t.deepEqual(
    _0.decode([null, null]),
    Left(IndexErr(1, FailureErr('Expecting a STRING', null)))
  )

  t.deepEqual(
    _0.decode([0, 1]),
    Left(IndexErr(1, FailureErr('Expecting a STRING', 1)))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})

test('Decode.index(position).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.index(1).optional.string

  t.deepEqual(
    _0.decode(undefined),
    Left(FailureErr('Expecting an ARRAY', undefined))
  )

  t.deepEqual(_0.decode(null), Left(FailureErr('Expecting an ARRAY', null)))

  t.deepEqual(
    _0.decode([]),
    Left(
      FailureErr(
        'Expecting an ARRAY with an ELEMENT at [1] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode({}), Left(FailureErr('Expecting an ARRAY', {})))

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 1]),
    Left(IndexErr(1, FailureErr('Expecting an OPTIONAL STRING', 1)))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})

test('Decode.optional.index(position).string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.index(1).string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(
    _0.decode({}),
    Left(FailureErr('Expecting an OPTIONAL ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([null, null]),
    Left(IndexErr(1, FailureErr('Expecting a STRING', null)))
  )

  t.deepEqual(
    _0.decode([0, 1]),
    Left(IndexErr(1, FailureErr('Expecting a STRING', 1)))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})

test('Decode.optional.index(position).optional.string', t => {
  // Decode<string | null>
  const _0 = Decode.optional.index(1).optional.string

  t.deepEqual(_0.decode(undefined), Right(null))

  t.deepEqual(_0.decode(null), Right(null))

  t.deepEqual(_0.decode([]), Right(null))

  t.deepEqual(
    _0.decode({}),
    Left(FailureErr('Expecting an OPTIONAL ARRAY', {}))
  )

  t.deepEqual(_0.decode([null, null]), Right(null))

  t.deepEqual(
    _0.decode([0, 1]),
    Left(IndexErr(1, FailureErr('Expecting a STRING', 1)))
  )

  t.deepEqual(_0.decode(['', 'str']), Right('str'))
})
