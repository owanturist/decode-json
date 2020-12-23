/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, ExpectEnums, InField, AtIndex } from './error'

interface Currency {
  toCode(): string
}

const EUR: Currency = { toCode: () => '€' }
const USD: Currency = { toCode: () => '$' }
const RUB: Currency = { toCode: () => '₽' }

test('Decode.enums()', t => {
  // Decoder<Currency>
  const _0 = Decode.enums([
    [9, EUR],
    ['str', USD],
    [true, RUB]
  ])

  t.is(_0.decode(9).value, EUR)
  t.is(_0.decode('str').value, USD)
  t.is(_0.decode(true).value, RUB)

  t.deepEqual(
    _0.decode(undefined).error,
    ExpectEnums([9, 'str', true], undefined)
  )
  t.deepEqual(_0.decode(null).error, ExpectEnums([9, 'str', true], null))
  t.deepEqual(_0.decode(1).error, ExpectEnums([9, 'str', true], 1))
  t.deepEqual(_0.decode('msg').error, ExpectEnums([9, 'str', true], 'msg'))
  t.deepEqual(_0.decode(false).error, ExpectEnums([9, 'str', true], false))

  // Decoder<Currency>
  const _1 = Decode.enums([
    ['eur', EUR],
    [null, RUB]
  ])

  t.is(_1.decode('eur').value, EUR)
  t.is(_1.decode(null).value, RUB)

  // Decoder<unknown>
  const _2 = Decode.enums([])

  t.deepEqual(_2.decode({}).error, ExpectEnums([], {}))
})

test('Decode.optional.enums()', t => {
  // Decoder<Currency | null>
  const _0 = Decode.optional.enums([
    ['eur', EUR],
    ['usd', USD],
    ['rub', RUB]
  ])

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode('eur').value, EUR)
  t.is(_0.decode('usd').value, USD)
  t.is(_0.decode('rub').value, RUB)

  t.deepEqual(
    _0.decode('str').error,
    Optional(ExpectEnums(['eur', 'usd', 'rub'], 'str'))
  )
  t.deepEqual(
    _0.decode(true).error,
    Optional(ExpectEnums(['eur', 'usd', 'rub'], true))
  )
})

test('Decode.field().enums()', t => {
  // Decoder<string>
  const _0 = Decode.field('_0').enums([
    [1, 'first'],
    [2, 'second'],
    [3, 'third']
  ])

  t.is(_0.decode({ _0: 1 }).value, 'first')
  t.is(_0.decode({ _0: 2 }).value, 'second')
  t.is(_0.decode({ _0: 3 }).value, 'third')

  t.deepEqual(
    _0.decode({ _0: 0 }).error,
    InField('_0', ExpectEnums([1, 2, 3], 0))
  )
})

test('Decode.field().optional.enums()', t => {
  // Decode<boolean | null>
  const _0 = Decode.field('_0').optional.enums([
    ['true', true],
    ['false', false]
  ])

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 'false' }).value, false)
  t.is(_0.decode({ _0: 'true' }).value, true)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectEnums(['true', 'false'], 'str')))
  )
})

test('Decode.index().enums()', t => {
  // Decode<string | number>
  const _0 = Decode.index(1).enums<number | string>([
    [false, 0],
    [1, 'first'],
    [2, 'second']
  ])

  t.is(_0.decode([0, false]).value, 0)
  t.is(_0.decode([0, 1]).value, 'first')
  t.is(_0.decode([0, 2]).value, 'second')

  t.deepEqual(
    _0.decode([0, null]).error,
    AtIndex(1, ExpectEnums([false, 1, 2], null))
  )
  t.deepEqual(
    _0.decode([0, 1.23]).error,
    AtIndex(1, ExpectEnums([false, 1, 2], 1.23))
  )
})

test('Decode.index().optional.enums()', t => {
  // Decode<boolean | null>
  const _0 = Decode.index(1).optional.enums([
    ['yes', true],
    ['no', false]
  ])

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, 'yes']).value, true)
  t.is(_0.decode([0, 'no']).value, false)

  t.deepEqual(
    _0.decode(['', {}]).error,
    AtIndex(1, Optional(ExpectEnums(['yes', 'no'], {})))
  )
})
