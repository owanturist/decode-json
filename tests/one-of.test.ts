/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Decoder } from '../src/decode-json'
import {
  OneOf,
  InField,
  AtIndex,
  Failure,
  ExpectString,
  ExpectInt,
  ExpectFloat,
  ExpectBoolean,
  RequiredField
} from './error'

test('Decode.oneOf()', t => {
  // Decoder<string>
  const _0 = Decode.oneOf([Decode.string, Decode.float.map(a => a.toFixed(2))])

  t.is(_0.decode('str').value, 'str')
  t.is(_0.decode(1).value, '1.00')
  t.is(_0.decode(1.234).value, '1.23')

  t.deepEqual(
    _0.decode(undefined).error,
    OneOf([ExpectString(undefined), ExpectFloat(undefined)])
  )
  t.deepEqual(
    _0.decode(null).error,
    OneOf([ExpectString(null), ExpectFloat(null)])
  )
  t.deepEqual(
    _0.decode(false).error,
    OneOf([ExpectString(false), ExpectFloat(false)])
  )
  t.deepEqual(_0.decode({}).error, OneOf([ExpectString({}), ExpectFloat({})]))
  t.deepEqual(_0.decode([]).error, OneOf([ExpectString([]), ExpectFloat([])]))

  // Decoder<number>
  const _1 = Decode.oneOf([Decode.int])

  t.is(_1.decode(1).value, 1)
  t.deepEqual(_1.decode(1.23).error, OneOf([ExpectInt(1.23)]))

  // Decoder<unknown>
  const _2 = Decode.oneOf([])

  t.deepEqual(_2.decode(null).error, OneOf([]))

  // Decoder<number>
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
      OneOf([]),
      ExpectString([]),
      OneOf([ExpectFloat([]), ExpectBoolean([])])
    ])
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
      OneOf([ExpectFloat('2.j2'), Failure('Not float "2.j2"', '2.j2')])
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
    AtIndex(1, OneOf([ExpectInt(null), ExpectString(null)]))
  )
  t.deepEqual(
    _0.decode([0, 1.23]).error,
    AtIndex(1, OneOf([ExpectInt(1.23), ExpectString(1.23)]))
  )
})

test('Spread arguments', t => {
  const _0 = Decode.oneOf(
    Decode.string,
    Decode.boolean.map(x => (x ? 'yes' : 'no'))
  )

  t.is(_0.decode('hi').value, 'hi')
  t.is(_0.decode(false).value, 'no')
  t.is(_0.decode(true).value, 'yes')

  const _1 = Decode.oneOf(
    Decode.string,
    Decode.boolean.map(x => (x ? 'yes' : 'no')),
    Decode.int.map(x => x.toFixed(2))
  )

  t.is(_1.decode(123).value, '123.00')
})

interface User {
  id: string
  age: number
  username: string
  lastActive: Date
}

test('Real world example', t => {
  const timeOffset = new Date().getTimezoneOffset() * 60 * 1000 // minutes * 60sec

  const dateDecoder = Decode.oneOf([
    Decode.int.map(timestamp => new Date(timestamp + timeOffset)),
    Decode.string.chain(str => {
      const date = new Date(str)

      if (isNaN(date.getMilliseconds())) {
        return Decode.fail(`Wrong string date "${str}" at {location}`)
      }

      return Decode.succeed(date)
    })
  ])

  const userDecoder: Decoder<User> = Decode.oneOf([
    Decode.shape({
      id: Decode.field('uuid').string,
      age: Decode.field('user_age').int,
      username: Decode.field('user_name').string,
      lastActive: Decode.field('last_active').of(dateDecoder)
    }),
    Decode.shape({
      id: Decode.field('id').string,
      age: Decode.field('age').int,
      username: Decode.field('username').string,
      lastActive: Decode.field('last_activity').of(dateDecoder)
    })
  ])

  t.deepEqual(
    userDecoder.decode({
      uuid: 'i1',
      user_age: 27,
      user_name: 'John',
      last_active: '12-24-2020'
    }).value,
    {
      id: 'i1',
      age: 27,
      username: 'John',
      lastActive: new Date('12-24-2020')
    }
  )

  t.deepEqual(
    userDecoder.decode({
      id: 'j10',
      age: 31,
      username: 'Walter',
      last_activity: 1608768000000
    }).value,
    {
      id: 'j10',
      age: 31,
      username: 'Walter',
      lastActive: new Date('12-24-2020')
    }
  )

  const source = {
    id: 'j10',
    age: 31,
    username: 'Walter',
    last_activity: '24/12/2020'
  }

  t.deepEqual(
    userDecoder.decode(source).error,
    OneOf([
      RequiredField('uuid', source),
      InField(
        'last_activity',
        OneOf([
          ExpectInt(source.last_activity),
          Failure(
            'Wrong string date "24/12/2020" at {location}',
            source.last_activity
          )
        ])
      )
    ])
  )
})
