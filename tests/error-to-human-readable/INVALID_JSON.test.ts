import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { InvalidJson } from '../error'

test('non JSON string input', t => {
  const source = 'invalid JSON'
  let err: SyntaxError = new Error()

  try {
    JSON.parse(source)
  } catch (jsonError) {
    err = jsonError
  }

  const _0 = InvalidJson(err, source)
  t.is(
    errorToHumanReadable(_0),
    `JSON parse error: Unexpected token i in JSON at position 0.

    invalid JSON`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `JSON parse error: Unexpected token i in JSON at position 0.

  invalid JSON`
  )
})

test('js value input', t => {
  const source = { foo: 'bar' } as never
  let err: SyntaxError = new Error()

  try {
    JSON.parse(source)
  } catch (jsonError) {
    err = jsonError
  }

  const _0 = InvalidJson(err, source)
  t.is(
    errorToHumanReadable(_0),
    `JSON parse error: Unexpected token o in JSON at position 1.

    [object Object]`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `JSON parse error: Unexpected token o in JSON at position 1.

  [object Object]`
  )
})

test('js class input', t => {
  class Foo {
    public constructor(private readonly id: number) {}

    public toString(): string {
      return `Foo [${this.id}]`
    }
  }
  const source = new Foo(123) as never
  let err: SyntaxError = new Error()

  try {
    JSON.parse(source)
  } catch (jsonError) {
    err = jsonError
  }

  const _0 = InvalidJson(err, source)
  t.is(
    errorToHumanReadable(_0),
    `JSON parse error: Unexpected token F in JSON at position 0.

    Foo [123]`
  )
  t.is(
    errorToHumanReadable(_0, { indent: 2 }),
    `JSON parse error: Unexpected token F in JSON at position 0.

  Foo [123]`
  )
})
