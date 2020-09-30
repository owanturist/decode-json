/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import {
  Optional,
  OneOf,
  InField,
  AtIndex,
  JsonValue,
  Failure
} from '../src/error'

test('Decode.oneOf()', t => {
  // Decoder<string>
  const _0 = Decode.oneOf([Decode.string, Decode.float.map(a => a.toFixed(2))])

  t.is(_0.decode('str').value, 'str')
  t.is(_0.decode(1).value, '1.00')
  t.is(_0.decode(1.234).value, '1.23')

  t.deepEqual(
    _0.decode(undefined).error,
    OneOf([JsonValue('STRING', undefined), JsonValue('FLOAT', undefined)])
  )
  t.deepEqual(
    _0.decode(null).error,
    OneOf([JsonValue('STRING', null), JsonValue('FLOAT', null)])
  )
  t.deepEqual(
    _0.decode(false).error,
    OneOf([JsonValue('STRING', false), JsonValue('FLOAT', false)])
  )
  t.deepEqual(
    _0.decode({}).error,
    OneOf([JsonValue('STRING', {}), JsonValue('FLOAT', {})])
  )
  t.deepEqual(
    _0.decode([]).error,
    OneOf([JsonValue('STRING', []), JsonValue('FLOAT', [])])
  )

  // Decoder<number>
  const _1 = Decode.oneOf([Decode.int])

  t.is(_1.decode(1).value, 1)
  t.deepEqual(_1.decode(1.23).error, JsonValue('INT', 1.23))

  // Decoder<unknown>
  const _2 = Decode.oneOf([])

  t.deepEqual(_2.decode(null).error, OneOf([]))

  const _3 = Decode.oneOf([Decode.int, Decode.succeed(0)])

  t.is(_3.decode(123).value, 123)
  t.is(_3.decode(123.2).value, 0)
  t.is(_3.decode('msg').value, 0)
  t.is(_3.decode(null).value, 0)

  // Decoder<string>
  const _4 = Decode.oneOf([
    Decode.oneOf([]),
    Decode.string,
    Decode.oneOf([
      Decode.float.map(x => x.toFixed(1)),
      Decode.boolean.map(x => (x ? 'yes' : 'no'))
    ])
  ])

  t.is(_4.decode('str').value, 'str')
  t.is(_4.decode(1.234).value, '1.2')
  t.is(_4.decode(false).value, 'no')

  t.deepEqual(
    _4.decode([]).error,
    OneOf([
      JsonValue('STRING', []),
      JsonValue('FLOAT', []),
      JsonValue('BOOLEAN', [])
    ])
  )
})

test('Decode.optional.oneOf()', t => {
  // Decoder<number | null>
  const _0 = Decode.optional.oneOf([Decode.int, Decode.float.map(Math.round)])

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode(1).value, 1)
  t.is(_0.decode(1.7).value, 2)

  t.deepEqual(
    _0.decode('str').error,
    Optional(OneOf([JsonValue('INT', 'str'), JsonValue('FLOAT', 'str')]))
  )
  t.deepEqual(
    _0.decode(true).error,
    Optional(OneOf([JsonValue('INT', true), JsonValue('FLOAT', true)]))
  )
})

test('Decode.field().oneOf()', t => {
  // Decoder<number>
  const _0 = Decode.field('_0').oneOf([
    Decode.float,
    Decode.string.chain(num => {
      const x = Number(num)

      if (isNaN(x)) {
        return Decode.fail(`Not float "${num}"`)
      }

      return Decode.succeed(x)
    })
  ])

  t.is(_0.decode({ _0: 1.23 }).value, 1.23)
  t.is(_0.decode({ _0: '2.92' }).value, 2.92)

  t.deepEqual(
    _0.decode({ _0: '2.j2' }).error,
    InField(
      '_0',
      OneOf([JsonValue('FLOAT', '2.j2'), Failure('Not float "2.j2"', '2.j2')])
    )
  )
})

test('Decode.field().optional.oneOf()', t => {
  // Decode<boolean | null>
  const _0 = Decode.field('_0').optional.oneOf([
    Decode.boolean,
    Decode.int.map(num => num > 0)
  ])

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: false }).value, false)
  t.is(_0.decode({ _0: 123 }).value, true)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField(
      '_0',
      Optional(OneOf([JsonValue('BOOLEAN', 'str'), JsonValue('INT', 'str')]))
    )
  )
})

test('Decode.index().oneOf()', t => {
  // Decode<string | number>
  const _0 = Decode.index(1).oneOf<number | string>([Decode.int, Decode.string])

  t.is(_0.decode([0, 1]).value, 1)
  t.is(_0.decode([0, 'str']).value, 'str')

  t.deepEqual(
    _0.decode([0, null]).error,
    AtIndex(1, OneOf([JsonValue('INT', null), JsonValue('STRING', null)]))
  )
  t.deepEqual(
    _0.decode([0, 1.23]).error,
    AtIndex(1, OneOf([JsonValue('INT', 1.23), JsonValue('STRING', 1.23)]))
  )
})

test('Decode.index().optional.list()', t => {
  // Decode<string | null>
  const _0 = Decode.index(1).optional.oneOf([
    Decode.string,
    Decode.boolean.map(x => (x ? 'yes' : 'no'))
  ])

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, 'str']).value, 'str')
  t.is(_0.decode([0, false]).value, 'no')
  t.is(_0.decode([0, true]).value, 'yes')

  t.deepEqual(
    _0.decode(['', {}]).error,
    AtIndex(
      1,
      Optional(OneOf([JsonValue('STRING', {}), JsonValue('BOOLEAN', {})]))
    )
  )
})
