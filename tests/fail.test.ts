/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Failure } from './error'

test('Decode.fail()', t => {
  t.deepEqual(Decode.fail('err msg').decode([]).error, Failure('err msg', []))
  t.deepEqual(Decode.fail('msg').decode(null).error, Failure('msg', null))
})

test('Decode.fail().map()', t => {
  t.deepEqual(
    Decode.fail('msg')
      .map((a: number) => a * 2)
      .decode(0).error,
    Failure('msg', 0)
  )
})

test('Decode.fail().chain()', t => {
  t.deepEqual(
    Decode.fail('msg')
      .chain((a: number) => Decode.succeed(a * 2))
      .decode(true).error,
    Failure('msg', true)
  )

  t.deepEqual(
    Decode.fail('msg')
      .chain((err: string) => Decode.fail(err))
      .decode({}).error,
    Failure('msg', {})
  )
})
