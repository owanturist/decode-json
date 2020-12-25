/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import {
  Optional,
  ExpectExact,
  InField,
  AtIndex,
  OneOf,
  ExpectString
} from './error'

interface Currency {
  toCode(): string
}

const EUR: Currency = { toCode: () => '€' }
const USD: Currency = { toCode: () => '$' }
const RUB: Currency = { toCode: () => '₽' }

test('Decode.exact()', t => {
  // Decoder<"SOME_STRING">
  const _0 = Decode.exact('SOME_STRING')

  t.is(_0.decode('SOME_STRING').value, 'SOME_STRING')

  t.deepEqual(_0.decode(undefined).error, ExpectExact('SOME_STRING', undefined))
  t.deepEqual(_0.decode(null).error, ExpectExact('SOME_STRING', null))
  t.deepEqual(_0.decode(1).error, ExpectExact('SOME_STRING', 1))
  t.deepEqual(_0.decode('msg').error, ExpectExact('SOME_STRING', 'msg'))
  t.deepEqual(_0.decode(false).error, ExpectExact('SOME_STRING', false))

  // Decoder<Currency>
  const _1 = Decode.exact(1, EUR)

  t.is(_1.decode(1).value, EUR)
})

test('Decode.optional.exact()', t => {
  // Decoder<false | null>
  const _0 = Decode.optional.exact(false)

  t.is(_0.decode(undefined).value, null)
  t.is(_0.decode(null).value, null)
  t.is(_0.decode(false).value, false)

  t.deepEqual(_0.decode('str').error, Optional(ExpectExact(false, 'str')))
  t.deepEqual(_0.decode(true).error, Optional(ExpectExact(false, true)))

  // Decoder<Currency | null>
  const _1 = Decode.optional.exact('usd', USD)

  t.is(_1.decode('usd').value, USD)
})

test('Decode.field().exact()', t => {
  // Decoder<Currency>
  const _0 = Decode.field('_0').exact(true, RUB)

  t.is(_0.decode({ _0: true }).value, RUB)

  t.deepEqual(
    _0.decode({ _0: false }).error,
    InField('_0', ExpectExact(true, false))
  )
})

test('Decode.field().optional.exact()', t => {
  // Decode<123 | null>
  const _0 = Decode.field('_0').optional.exact(123)

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: undefined }).value, null)
  t.is(_0.decode({ _0: 123 }).value, 123)

  t.deepEqual(
    _0.decode({ _0: 'str' }).error,
    InField('_0', Optional(ExpectExact(123, 'str')))
  )
})

test('Decode.index().exact()', t => {
  // Decode<"key">
  const _0 = Decode.index(1).exact('key')

  t.is(_0.decode([0, 'key']).value, 'key')

  t.deepEqual(_0.decode([0, null]).error, AtIndex(1, ExpectExact('key', null)))
  t.deepEqual(_0.decode([0, 1.23]).error, AtIndex(1, ExpectExact('key', 1.23)))
})

test('Decode.index().optional.exact()', t => {
  // Decode<0 | null>
  const _0 = Decode.index(1).optional.exact(0)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, 0]).value, 0)

  t.deepEqual(_0.decode(['', 1]).error, AtIndex(1, Optional(ExpectExact(0, 1))))
})

test('Decode.oneOf(Decode.exact())', t => {
  // Decode<Currency>
  const _0 = Decode.oneOf([
    Decode.exact('usd', USD),
    Decode.exact('rub', RUB),
    Decode.exact('eur', EUR)
  ])

  t.is(_0.decode('usd').value, USD)
  t.is(_0.decode('rub').value, RUB)
  t.is(_0.decode('eur').value, EUR)

  t.deepEqual(
    _0.decode('chr').error,
    OneOf([
      ExpectExact('usd', 'chr'),
      ExpectExact('rub', 'chr'),
      ExpectExact('eur', 'chr')
    ])
  )

  const _1 = Decode.oneOf<1 | 'str' | false>([
    Decode.exact(1),
    Decode.exact('str'),
    Decode.exact(false)
  ])

  t.is(_1.decode(1).value, 1)
  t.is(_1.decode('str').value, 'str')
  t.is(_1.decode(false).value, false)
})

type Action =
  | { type: 'Input'; value: string }
  | { type: 'Check'; id: number; checked: boolean }

test('Real world example', t => {
  const actionDecoder = Decode.oneOf<Action>([
    Decode.shape({
      type: Decode.index(0).exact('Input'),
      value: Decode.index(1).string
    }),

    Decode.shape({
      type: Decode.index(0).exact('Check'),
      id: Decode.index(1).int,
      checked: Decode.index(2).boolean
    })
  ])

  t.deepEqual(actionDecoder.decode(['Input', 'name']).value, {
    type: 'Input',
    value: 'name'
  })
  t.deepEqual(actionDecoder.decode(['Check', 213, false]).value, {
    type: 'Check',
    id: 213,
    checked: false
  })
  t.deepEqual(
    actionDecoder.decode(['Input', 213, false]).error,
    OneOf([
      AtIndex(1, ExpectString(213)),
      AtIndex(0, ExpectExact('Check', 'Input'))
    ])
  )
})
