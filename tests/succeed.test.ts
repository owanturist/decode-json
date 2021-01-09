/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'
import { Failure } from './error'

test('Decode.succeed()', t => {
  t.is(Decode.succeed('val').decode([]).value, 'val')
  t.deepEqual(Decode.succeed([{}, null, 1]).decode(null).value, [{}, null, 1])
})

test('Decode.succeed().map()', t => {
  t.is(
    Decode.succeed(123)
      .map(a => a * 2)
      .decode(0).value,
    246
  )
})

test('Decode.succeed().chain()', t => {
  t.is(
    Decode.succeed(9)
      .chain(a => Decode.succeed(a * a))
      .decode(true).value,
    81
  )

  t.deepEqual(
    Decode.succeed('msg')
      .chain(err => Decode.fail(err))
      .decode({}).error,
    Failure('msg', {})
  )
})
