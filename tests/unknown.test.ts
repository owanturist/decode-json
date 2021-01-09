/* eslint-disable no-undefined */

import test from 'ava'

import Decode from '../src/decode-json'

const identity = <T>(val: T): T => val

test('Decode.unknown', t => {
  t.is(Decode.unknown.decode(undefined).value, undefined)
  t.is(Decode.unknown.decode(null).value, null)
  t.is(Decode.unknown.decode('str').value, 'str')
  t.is(Decode.unknown.decode(true).value, true)
  t.is(Decode.unknown.decode(1).value, 1)
  t.is(Decode.unknown.decode(1.1).value, 1.1)
  t.is(Decode.unknown.decode(identity).value, identity)
})

test('Decode.field().unknown', t => {
  // Decode<unknown>
  const _0 = Decode.field('_0').unknown

  t.is(_0.decode({ _0: null }).value, null)
  t.is(_0.decode({ _0: 1 }).value, 1)
  t.is(_0.decode({ _0: 'str' }).value, 'str')
  t.is(_0.decode({ _0: identity }).value, identity)
})

test('Decode.index().string', t => {
  // Decode<unknown>
  const _0 = Decode.index(1).unknown

  t.is(_0.decode([null, null]).value, null)
  t.is(_0.decode([0, 1]).value, 1)
  t.is(_0.decode(['', 'str']).value, 'str')
  t.is(_0.decode(['', identity]).value, identity)
})
