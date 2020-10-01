import test from 'ava'

import Decode from '../src'
import { InField, ParseJsonError, UnknownError } from '../src/error'

test('Decoder.decodeJSON()', t => {
  t.is(
    Decode.string.decodeJSON('"correct json string"').value,
    'correct json string'
  )

  t.deepEqual(
    Decode.string.decodeJSON('wrong json string').error,
    ParseJsonError(
      new SyntaxError('Unexpected token w in JSON at position 0'),
      'wrong json string'
    )
  )

  const _0 = Decode.string.chain(msg => {
    throw new Error(msg)
  })

  t.deepEqual(
    _0.decodeJSON('"report"').error,
    UnknownError(new Error('report'))
  )

  t.deepEqual(
    Decode.field('_0').of(_0).decodeJSON('{"_0": "err"}').error,
    InField('_0', UnknownError(new Error('err')))
  )
})
