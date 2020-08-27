/* eslint-disable no-undefined */
import test from 'ava'

import Decode from '../../src'
import Error from '../../src/Error'

test('Json.Decode.Error.cata(pattern)', t => {
  const pattern: Error.Pattern<string> = {
    Field(field: string, error: Error): string {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `"${field}" ${error.cata(pattern)}`
    },
    Index(index: number, error: Error): string {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `[${index}] ${error.cata(pattern)}`
    },
    OneOf(errors: Array<Error>): string {
      return errors
        .map((error: Error): string => error.cata(pattern))
        .join('\n')
    },
    Failure(message: string, source: Decode.Value): string {
      return `"${message}" > ${JSON.stringify(source)}`
    }
  }

  t.is(Error.Failure('Message', null).cata(pattern), '"Message" > null')

  t.is(
    Error.OneOf([
      Error.Failure('First message', null),
      Error.Failure('Second message', null)
    ]).cata(pattern),
    `"First message" > null
"Second message" > null`
  )

  t.is(
    Error.Index(0, Error.Failure('Message', null)).cata(pattern),
    '[0] "Message" > null'
  )

  t.is(
    Error.Field('foo', Error.Failure('Message', null)).cata(pattern),
    '"foo" "Message" > null'
  )

  t.is(
    Error.Failure('Message', null).cata({
      Failure: () => true,
      _: () => false
    }),
    true
  )

  t.is(
    Error.Failure('Message', null).cata({
      OneOf: () => true,
      Index: () => true,
      Field: () => true,
      _: () => false
    }),
    false
  )

  t.is(
    Error.Failure('Message', null).cata({
      _: () => false
    }),
    false
  )

  t.is(
    Error.OneOf([]).cata({
      OneOf: () => true,
      _: () => false
    }),
    true
  )

  t.is(
    Error.OneOf([]).cata({
      _: () => false
    }),
    false
  )

  t.is(
    Error.OneOf([]).cata({
      Failure: () => true,
      Index: () => true,
      Field: () => true,
      _: () => false
    }),
    false
  )

  t.is(
    Error.Index(1, Error.Failure('Message', null)).cata({
      Index: () => true,
      _: () => false
    }),
    true
  )

  t.is(
    Error.Index(1, Error.Failure('Message', null)).cata({
      Failure: () => true,
      OneOf: () => true,
      Field: () => true,
      _: () => false
    }),
    false
  )

  t.is(
    Error.Index(1, Error.Failure('Message', null)).cata({
      _: () => false
    }),
    false
  )

  t.is(
    Error.Field('foo', Error.Failure('Message', null)).cata({
      Field: () => true,
      _: () => false
    }),
    true
  )

  t.is(
    Error.Field('foo', Error.Failure('Message', null)).cata({
      Failure: () => true,
      OneOf: () => true,
      Index: () => true,
      _: () => false
    }),
    false
  )

  t.is(
    Error.Field('foo', Error.Failure('Message', null)).cata({
      _: () => false
    }),
    false
  )
})

test('Json.Decode.Error.OneOf.stringify(indent)', t => {
  t.is(
    Error.OneOf([]).stringify(0),
    'Ran into a Json.Decode.oneOf with no possibilities!'
  )

  t.is(
    Error.OneOf([Error.Failure('Message', undefined)]).stringify(0),
    `Problem with the given value:

    undefined

Message`
  )

  t.is(
    Error.OneOf([Error.Failure('Message', null)]).stringify(0),
    `Problem with the given value:

    null

Message`
  )

  t.is(
    Error.OneOf([
      Error.Failure('First message', null),
      Error.Failure('Second message', null)
    ]).stringify(0),
    `Json.Decode.oneOf failed in the following 2 ways


(1) Problem with the given value:

    null

First message


(2) Problem with the given value:

    null

Second message`
  )
})

test('Json.Decode.Error.Field.stringify(indent)', t => {
  t.is(
    Error.Field('foo', Error.Failure('Message', undefined)).stringify(0),
    `Problem with the value at _.foo:

    undefined

Message`
  )
  t.is(
    Error.Field('foo', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _.foo:

    null

Message`
  )

  t.is(
    Error.Field('_0', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _._0:

    null

Message`
  )

  t.is(
    Error.Field('foo_0', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _.foo_0:

    null

Message`
  )

  t.is(
    Error.Field('0foo', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _['0foo']:

    null

Message`
  )

  t.is(
    Error.Field('foo-bar', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _['foo-bar']:

    null

Message`
  )

  t.is(
    Error.Field('foo bar', Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _['foo bar']:

    null

Message`
  )

  t.is(
    Error.Field('foo', Error.OneOf([])).stringify(0),
    'Ran into a Json.Decode.oneOf with no possibilities at _.foo'
  )

  t.is(
    Error.Field(
      'foo',
      Error.OneOf([
        Error.Failure('First message', null),
        Error.Failure('Second message', null)
      ])
    ).stringify(0),
    `The Json.Decode.oneOf at _.foo failed in the following 2 ways


(1) Problem with the given value:

    null

First message


(2) Problem with the given value:

    null

Second message`
  )

  t.is(
    Error.Field(
      'foo',
      Error.OneOf([
        Error.Field('bar', Error.Failure('First message', null)),
        Error.Index(1, Error.Failure('Second message', null))
      ])
    ).stringify(0),
    `The Json.Decode.oneOf at _.foo failed in the following 2 ways


(1) Problem with the value at _.bar:

    null

First message


(2) Problem with the value at _[1]:

    null

Second message`
  )

  t.is(
    Error.Field(
      'foo',
      Error.Index(1, Error.Failure('Message', [0, 2, 3]))
    ).stringify(0),
    `Problem with the value at _.foo[1]:

    [0,2,3]

Message`
  )

  t.is(
    Error.Field(
      'foo',
      Error.Field(
        'bar',
        Error.Failure('Message', {
          bar: 'foo',
          foo: 'bar'
        })
      )
    ).stringify(4),
    `Problem with the value at _.foo.bar:

    {
        "bar": "foo",
        "foo": "bar"
    }

Message`
  )
})

test('Json.Decode.Error.Index.stringify(indent)', t => {
  t.is(
    Error.Index(0, Error.Failure('Message', undefined)).stringify(0),
    `Problem with the value at _[0]:

    undefined

Message`
  )

  t.is(
    Error.Index(0, Error.Failure('Message', null)).stringify(0),
    `Problem with the value at _[0]:

    null

Message`
  )

  t.is(
    Error.Index(0, Error.Failure('Message', [1, 2, 3])).stringify(4),
    `Problem with the value at _[0]:

    [
        1,
        2,
        3
    ]

Message`
  )

  t.is(
    Error.Index(0, Error.OneOf([])).stringify(0),
    'Ran into a Json.Decode.oneOf with no possibilities at _[0]'
  )

  t.is(
    Error.Index(
      0,
      Error.OneOf([
        Error.Failure('First message', null),
        Error.Failure('Second message', null)
      ])
    ).stringify(0),
    `The Json.Decode.oneOf at _[0] failed in the following 2 ways


(1) Problem with the given value:

    null

First message


(2) Problem with the given value:

    null

Second message`
  )

  t.is(
    Error.Index(
      0,
      Error.OneOf([
        Error.Field('foo', Error.Failure('First message', null)),
        Error.Index(1, Error.Failure('Second message', null))
      ])
    ).stringify(0),
    `The Json.Decode.oneOf at _[0] failed in the following 2 ways


(1) Problem with the value at _.foo:

    null

First message


(2) Problem with the value at _[1]:

    null

Second message`
  )

  t.is(
    Error.Index(
      0,
      Error.Index(1, Error.Failure('Message', [0, 2, 3]))
    ).stringify(0),
    `Problem with the value at _[0][1]:

    [0,2,3]

Message`
  )

  t.is(
    Error.Index(
      0,
      Error.Field(
        'foo',
        Error.Failure('Message', {
          bar: 'foo',
          foo: 'bar'
        })
      )
    ).stringify(0),
    `Problem with the value at _[0].foo:

    {"bar":"foo","foo":"bar"}

Message`
  )
})

test('Json.Decode.Error.Failure.stringify(indent)', t => {
  t.is(
    Error.Failure('Message', undefined).stringify(0),
    `Problem with the given value:

    undefined

Message`
  )

  t.is(
    Error.Failure('Message', null).stringify(0),
    `Problem with the given value:

    null

Message`
  )

  t.is(
    Error.Failure('Message', 'string').stringify(4),
    `Problem with the given value:

    "string"

Message`
  )

  t.is(
    Error.Failure('Message', {
      foo: 'bar',
      bar: 'foo'
    }).stringify(4),
    `Problem with the given value:

    {
        "foo": "bar",
        "bar": "foo"
    }

Message`
  )

  t.is(
    Error.Failure('Message', ['foo', 'bar', 'baz']).stringify(0),
    `Problem with the given value:

    ["foo","bar","baz"]

Message`
  )
})
