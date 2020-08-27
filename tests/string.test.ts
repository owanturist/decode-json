/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Left, Right, FailureErr } from '../src/refactor'

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
