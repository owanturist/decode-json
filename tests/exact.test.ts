/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src'
import { Optional, ExpectEnums, InField, AtIndex, OneOf } from './error'

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

  t.deepEqual(
    _0.decode(undefined).error,
    ExpectEnums(['SOME_STRING'], undefined)
  )
  t.deepEqual(_0.decode(null).error, ExpectEnums(['SOME_STRING'], null))
  t.deepEqual(_0.decode(1).error, ExpectEnums(['SOME_STRING'], 1))
  t.deepEqual(_0.decode('msg').error, ExpectEnums(['SOME_STRING'], 'msg'))
  t.deepEqual(_0.decode(false).error, ExpectEnums(['SOME_STRING'], false))

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

  t.deepEqual(_0.decode('str').error, Optional(ExpectEnums([false], 'str')))
  t.deepEqual(_0.decode(true).error, Optional(ExpectEnums([false], true)))

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
    InField('_0', ExpectEnums([true], false))
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
    InField('_0', Optional(ExpectEnums([123], 'str')))
  )
})

test('Decode.index().exact()', t => {
  // Decode<"key">
  const _0 = Decode.index(1).exact('key')

  t.is(_0.decode([0, 'key']).value, 'key')

  t.deepEqual(
    _0.decode([0, null]).error,
    AtIndex(1, ExpectEnums(['key'], null))
  )
  t.deepEqual(
    _0.decode([0, 1.23]).error,
    AtIndex(1, ExpectEnums(['key'], 1.23))
  )
})

test('Decode.index().optional.exact()', t => {
  // Decode<0 | null>
  const _0 = Decode.index(1).optional.exact(0)

  t.is(_0.decode([0, undefined]).value, null)
  t.is(_0.decode([0, null]).value, null)
  t.is(_0.decode([0, 0]).value, 0)

  t.deepEqual(
    _0.decode(['', 1]).error,
    AtIndex(1, Optional(ExpectEnums([0], 1)))
  )
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
      ExpectEnums(['usd'], 'chr'),
      ExpectEnums(['rub'], 'chr'),
      ExpectEnums(['eur'], 'chr')
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
