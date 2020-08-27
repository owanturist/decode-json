/* eslint-disable no-undefined */

import test from 'ava'

import Maybe from '../../src/Maybe'
import Either from '../../src/Either'
import Decode from '../../src/Json/Decode'

test('Json.Decode.string', t => {
  t.deepEqual(
    Decode.string.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting a STRING', undefined))
  )

  t.deepEqual(
    Decode.string.decode(null),
    Either.Left(Decode.Error.Failure('Expecting a STRING', null))
  )

  t.deepEqual(Decode.string.decode('str'), Either.Right('str'))

  t.deepEqual(
    Decode.string.decode(true),
    Either.Left(Decode.Error.Failure('Expecting a STRING', true))
  )

  t.deepEqual(
    Decode.string.decode(1),
    Either.Left(Decode.Error.Failure('Expecting a STRING', 1))
  )

  t.deepEqual(
    Decode.string.decode(1.1),
    Either.Left(Decode.Error.Failure('Expecting a STRING', 1.1))
  )
})

test('Json.Decode.boolean', t => {
  t.deepEqual(
    Decode.boolean.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting a BOOLEAN', undefined))
  )

  t.deepEqual(
    Decode.boolean.decode(null),
    Either.Left(Decode.Error.Failure('Expecting a BOOLEAN', null))
  )

  t.deepEqual(
    Decode.boolean.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting a BOOLEAN', 'str'))
  )

  t.deepEqual(Decode.boolean.decode(true), Either.Right(true))

  t.deepEqual(
    Decode.boolean.decode(1),
    Either.Left(Decode.Error.Failure('Expecting a BOOLEAN', 1))
  )

  t.deepEqual(
    Decode.boolean.decode(1.1),
    Either.Left(Decode.Error.Failure('Expecting a BOOLEAN', 1.1))
  )
})

test('Json.Decode.int', t => {
  t.deepEqual(
    Decode.int.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', undefined))
  )

  t.deepEqual(
    Decode.int.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', null))
  )

  t.deepEqual(
    Decode.int.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', 'str'))
  )

  t.deepEqual(
    Decode.int.decode(true),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', true))
  )

  t.deepEqual(Decode.int.decode(1), Either.Right(1))

  t.deepEqual(
    Decode.int.decode(1.1),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', 1.1))
  )
})

test('Json.Decode.float', t => {
  t.deepEqual(
    Decode.float.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', undefined))
  )

  t.deepEqual(
    Decode.float.decode(null),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', null))
  )

  t.deepEqual(
    Decode.float.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', 'str'))
  )

  t.deepEqual(
    Decode.float.decode(true),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', true))
  )

  t.deepEqual(Decode.float.decode(1), Either.Right(1))

  t.deepEqual(Decode.float.decode(1.1), Either.Right(1.1))
})

test('Json.Decode.value', t => {
  const serializeValue = (value: Decode.Value): unknown => value.serialize()

  t.deepEqual(Decode.value.decode(null).map(serializeValue), Either.Right(null))

  t.deepEqual(
    Decode.value.decode('str').map(serializeValue),
    Either.Right('str')
  )

  t.deepEqual(Decode.value.decode(true).map(serializeValue), Either.Right(true))

  t.deepEqual(Decode.value.decode(1).map(serializeValue), Either.Right(1))

  t.deepEqual(Decode.value.decode(1.1).map(serializeValue), Either.Right(1.1))

  t.deepEqual(Decode.value.decode([]).map(serializeValue), Either.Right([]))

  t.deepEqual(
    Decode.value.decode([0, '_1', false]).map(serializeValue),
    Either.Right([0, '_1', false])
  )

  t.deepEqual(Decode.value.decode({}).map(serializeValue), Either.Right({}))

  t.deepEqual(
    Decode.value
      .decode({
        _0: 0,
        _1: '_1',
        _2: false
      })
      .map(serializeValue),
    Either.Right({
      _0: 0,
      _1: '_1',
      _2: false
    })
  )
})

test('Json.Decode.fail(message)', t => {
  t.deepEqual(
    Decode.fail('Some error').decode(undefined),
    Either.Left(Decode.Error.Failure('Some error', undefined))
  )

  t.deepEqual(
    Decode.fail('Some error').decode(null),
    Either.Left(Decode.Error.Failure('Some error', null))
  )

  t.deepEqual(
    Decode.fail('Some error').decode('str'),
    Either.Left(Decode.Error.Failure('Some error', 'str'))
  )

  t.deepEqual(
    Decode.fail('Some error').decode(true),
    Either.Left(Decode.Error.Failure('Some error', true))
  )

  t.deepEqual(
    Decode.fail('Some error').decode(1),
    Either.Left(Decode.Error.Failure('Some error', 1))
  )

  t.deepEqual(
    Decode.fail('Some error').decode(1.1),
    Either.Left(Decode.Error.Failure('Some error', 1.1))
  )
})

test('Json.Decode.succeed(value)', t => {
  t.deepEqual(Decode.succeed('str').decode(undefined), Either.Right('str'))

  t.deepEqual(Decode.succeed(false).decode(null), Either.Right(false))

  t.deepEqual(Decode.succeed(1).decode('str'), Either.Right(1))

  t.deepEqual(Decode.succeed(1.1).decode(true), Either.Right(1.1))

  t.deepEqual(Decode.succeed(null).decode(1), Either.Right(null))

  t.deepEqual(Decode.succeed([]).decode(1.1), Either.Right([]))
})

test('Json.Decode.shape(object)', t => {
  const _0 /* Decoder<{}> */ = Decode.shape({})

  t.deepEqual(_0.decode(undefined), Either.Right({}))

  t.deepEqual(_0.decode(null), Either.Right({}))

  t.deepEqual(_0.decode('str'), Either.Right({}))

  t.deepEqual(_0.decode(true), Either.Right({}))

  t.deepEqual(_0.decode(1), Either.Right({}))

  t.deepEqual(_0.decode(1.1), Either.Right({}))

  const _1 /* Decoder<{
        _0_: string
    }> */ = Decode.shape({
    _0_: Decode.string
  })
  t.deepEqual(
    _1.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting a STRING', undefined))
  )
  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting a STRING', null))
  )
  t.deepEqual(
    _1.decode(1),
    Either.Left(Decode.Error.Failure('Expecting a STRING', 1))
  )
  t.deepEqual(
    _1.decode('str'),
    Either.Right({
      _0_: 'str'
    })
  )

  const _2 /* Decoder<{
        _0_: Maybe<string>
    }> */ = Decode.shape({
    _0_: Decode.optional.string
  })
  t.deepEqual(
    _2.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL STRING', 1))
  )
  t.deepEqual(
    _2.decode(undefined),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _2.decode(null),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _2.decode('str'),
    Either.Right({
      _0_: Maybe.Just('str')
    })
  )

  const _3 /* Decoder<{
        _0_: string
    }> */ = Decode.shape({
    _0_: Decode.field('__0__').of(Decode.string)
  })
  t.deepEqual(
    _3.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', 1))
  )
  t.deepEqual(
    _3.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _3.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _3.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '__0__'", {})
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: null
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', null)
      )
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: 'str'
    }),
    Either.Right({
      _0_: 'str'
    })
  )

  const _4 /* Decoder<{
        _0_: Maybe<string>
    }> */ = Decode.shape({
    _0_: Decode.optional.field('__0__').of(Decode.string)
  })
  t.deepEqual(
    _4.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(
    _4.decode(undefined),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _4.decode(null),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _4.decode({}),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _4.decode({
      __0__: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: null
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', null)
      )
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: 'str'
    }),
    Either.Right({
      _0_: Maybe.Just('str')
    })
  )

  const _5 /* Decoder<{
        _0_: Maybe<string>
    }> */ = Decode.shape({
    _0_: Decode.field('__0__').optional.of(Decode.string)
  })
  t.deepEqual(
    _5.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', 1))
  )
  t.deepEqual(
    _5.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _5.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _5.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '__0__'", {})
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: undefined
    }),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _5.decode({
      __0__: null
    }),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _5.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: 'str'
    }),
    Either.Right({
      _0_: Maybe.Just('str')
    })
  )

  const _6 /* Decoder<{
        _0_: Maybe<string>
    }> */ = Decode.shape({
    _0_: Decode.optional.field('__0__').optional.of(Decode.string)
  })
  t.deepEqual(
    _6.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(
    _6.decode(undefined),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _6.decode(null),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _6.decode({}),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _6.decode({
      __0__: null
    }),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _6.decode({
      __0__: undefined
    }),
    Either.Right({
      _0_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _6.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )
  t.deepEqual(
    _6.decode({
      __0__: 'str'
    }),
    Either.Right({
      _0_: Maybe.Just('str')
    })
  )

  const _7 /* Decoder<{
        _0_: string;
        _1_: number;
    }> */ = Decode.shape(
    {
      _0_: Decode.field('__0__').string,
      _1_: Decode.field('__1__').int
    }
  )
  t.deepEqual(
    _7.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '__0__'", {})
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 0
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 0))
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str'
    }),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '__1__'", {
        __0__: 'str'
      })
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str',
      __1__: 1.1
    }),
    Either.Left(
      Decode.Error.Field(
        '__1__',
        Decode.Error.Failure('Expecting an INTEGER', 1.1)
      )
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str',
      __1__: 1
    }),
    Either.Right({
      _0_: 'str',
      _1_: 1
    })
  )
})

test('Json.Decode.list(decoder)', t => {
  const _0 /* Decoder<Array<string>> */ = Decode.list(Decode.string)
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )
  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )
  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )
  t.deepEqual(_0.decode([]), Either.Right([]))
  t.deepEqual(
    _0.decode([0]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting a STRING', 0))
    )
  )
  t.deepEqual(
    _0.decode(['_0_', undefined]),
    Either.Left(
      Decode.Error.Index(
        1,
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )
  t.deepEqual(
    _0.decode(['_0_', null]),
    Either.Left(
      Decode.Error.Index(1, Decode.Error.Failure('Expecting a STRING', null))
    )
  )
  t.deepEqual(_0.decode(['_0_', '_1_']), Either.Right(['_0_', '_1_']))

  const _1 /* Decoder<Array<Maybe<string>>> */ = Decode.list(
    Decode.optional.string
  )
  t.deepEqual(
    _1.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )
  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )
  t.deepEqual(
    _1.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )
  t.deepEqual(_1.decode([]), Either.Right([]))
  t.deepEqual(
    _1.decode([0]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 0)
      )
    )
  )
  t.deepEqual(
    _1.decode(['_0_', null, undefined]),
    Either.Right([Maybe.Just('_0_'), Maybe.Nothing, Maybe.Nothing])
  )
  t.deepEqual(
    _1.decode(['_0_', '_1_']),
    Either.Right([Maybe.Just('_0_'), Maybe.Just('_1_')])
  )
})

test('Json.Decode.keyValue(decoder)', t => {
  const _0 /* Decoder<Array<[ string, number ]>> */ = Decode.keyValue(
    Decode.int
  )
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_0.decode({}), Either.Right([]))
  t.deepEqual(
    _0.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '_0_',
        Decode.Error.Failure('Expecting an INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '_1_',
        Decode.Error.Failure('Expecting an INTEGER', undefined)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: null
    }),
    Either.Left(
      Decode.Error.Field(
        '_1_',
        Decode.Error.Failure('Expecting an INTEGER', null)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: 1
    }),
    Either.Right<Array<[string, number]>>([
      ['_0_', 0],
      ['_1_', 1]
    ])
  )

  const _1 /* Decoder<Array<[ string, Maybe<number> ]>> */ = Decode.keyValue(
    Decode.optional.int
  )
  t.deepEqual(
    _1.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _1.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_1.decode({}), Either.Right([]))
  t.deepEqual(
    _1.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '_0_',
        Decode.Error.Failure('Expecting an OPTIONAL INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _1.decode({
      _0_: 0,
      _1_: null,
      _2_: undefined
    }),
    Either.Right<Array<[string, Maybe<number>]>>([
      ['_0_', Maybe.Just(0)],
      ['_1_', Maybe.Nothing],
      ['_2_', Maybe.Nothing]
    ])
  )
  t.deepEqual(
    _1.decode({
      _0_: 0,
      _1_: 1
    }),
    Either.Right<Array<[string, Maybe<number>]>>([
      ['_0_', Maybe.Just(0)],
      ['_1_', Maybe.Just(1)]
    ])
  )
})

test('Json.Decode.keyValue(convertKey, decoder)', t => {
  const toDate = (str: string): Either<string, Date> => {
    const date = new Date(str)

    return isNaN(date.getTime())
      ? Either.Left('Expecting a DATE')
      : Either.Right(date)
  }

  const _0 /* Decoder<Array<[ Date, number ]>> */ = Decode.keyValue(
    toDate,
    Decode.int
  )
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_0.decode({}), Either.Right([]))
  t.deepEqual(
    _0.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field('_0_', Decode.Error.Failure('Expecting a DATE', '_0_'))
    )
  )
  t.deepEqual(
    _0.decode({
      '2019-09-02': '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '2019-09-02',
        Decode.Error.Failure('Expecting an INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _0.decode({
      '2019-09-02': 0,
      '2019-10-02': undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '2019-10-02',
        Decode.Error.Failure('Expecting an INTEGER', undefined)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      '2019-09-02': 0,
      '2019-10-02': null
    }),
    Either.Left(
      Decode.Error.Field(
        '2019-10-02',
        Decode.Error.Failure('Expecting an INTEGER', null)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      '2019-09-02': 0,
      '2019-10-02': 1
    }),
    Either.Right<Array<[Date, number]>>([
      [new Date(2019, 8, 2, 7), 0],
      [new Date(2019, 9, 2, 7), 1]
    ])
  )

  const _1 /* Decoder<Array<[ Date, Maybe<number> ]>> */ = Decode.keyValue(
    toDate,
    Decode.optional.int
  )
  t.deepEqual(
    _1.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _1.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_1.decode({}), Either.Right([]))
  t.deepEqual(
    _1.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field('_0_', Decode.Error.Failure('Expecting a DATE', '_0_'))
    )
  )
  t.deepEqual(
    _1.decode({
      '2019-09-02': '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '2019-09-02',
        Decode.Error.Failure('Expecting an OPTIONAL INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _1.decode({
      '2019-09-02': 0,
      '2019-10-02': null,
      '2019-10-03': undefined
    }),
    Either.Right<Array<[Date, Maybe<number>]>>([
      [new Date(2019, 8, 2, 7), Maybe.Just(0)],
      [new Date(2019, 9, 2, 7), Maybe.Nothing],
      [new Date(2019, 9, 3, 7), Maybe.Nothing]
    ])
  )
  t.deepEqual(
    _1.decode({
      '2019-09-02': 0,
      '2019-10-02': 1
    }),
    Either.Right<Array<[Date, Maybe<number>]>>([
      [new Date(2019, 8, 2, 7), Maybe.Just(0)],
      [new Date(2019, 9, 2, 7), Maybe.Just(1)]
    ])
  )
})

test('Json.Decode.dict(decoder)', t => {
  const _0 /* Decoder<{
        [ key: string ]: number;
    }> */ = Decode.dict(
    Decode.int
  )
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_0.decode({}), Either.Right({}))
  t.deepEqual(
    _0.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '_0_',
        Decode.Error.Failure('Expecting an INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '_1_',
        Decode.Error.Failure('Expecting an INTEGER', undefined)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: null
    }),
    Either.Left(
      Decode.Error.Field(
        '_1_',
        Decode.Error.Failure('Expecting an INTEGER', null)
      )
    )
  )
  t.deepEqual(
    _0.decode({
      _0_: 0,
      _1_: 1
    }),
    Either.Right({
      _0_: 0,
      _1_: 1
    })
  )

  const _1 /* Decoder<{
        [ key: string ]: Maybe<number>;
    }> */ = Decode.dict(
    Decode.optional.int
  )
  t.deepEqual(
    _1.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )
  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )
  t.deepEqual(
    _1.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )
  t.deepEqual(_1.decode({}), Either.Right({}))
  t.deepEqual(
    _1.decode({
      _0_: '0'
    }),
    Either.Left(
      Decode.Error.Field(
        '_0_',
        Decode.Error.Failure('Expecting an OPTIONAL INTEGER', '0')
      )
    )
  )
  t.deepEqual(
    _1.decode({
      _0_: 0,
      _1_: null,
      _2_: undefined
    }),
    Either.Right({
      _0_: Maybe.Just(0),
      _1_: Maybe.Nothing,
      _2_: Maybe.Nothing
    })
  )
  t.deepEqual(
    _1.decode({
      _0_: 0,
      _1_: 1
    }),
    Either.Right({
      _0_: Maybe.Just(0),
      _1_: Maybe.Just(1)
    })
  )
})

test('Json.Decode.oneOf(decoders)', t => {
  t.deepEqual(
    Decode.oneOf([]).decode(undefined),
    Either.Left(Decode.Error.OneOf([]))
  )

  t.deepEqual(
    Decode.oneOf([]).decode(null),
    Either.Left(Decode.Error.OneOf([]))
  )

  t.deepEqual(
    Decode.oneOf([Decode.string]).decode(undefined),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting a STRING', undefined)
      ])
    )
  )

  t.deepEqual(
    Decode.oneOf([Decode.string]).decode(null),
    Either.Left(
      Decode.Error.OneOf([Decode.Error.Failure('Expecting a STRING', null)])
    )
  )

  t.deepEqual(
    Decode.oneOf([
      Decode.string.map(Maybe.Just),
      Decode.succeed(Maybe.Nothing)
    ]).decode(undefined),
    Either.Right(Maybe.Nothing)
  )

  const _0 /* Decoder<string> */ = Decode.oneOf([
    Decode.string,
    Decode.float.map(float => float.toFixed(2))
  ])
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting a STRING', undefined),
        Decode.Error.Failure('Expecting a FLOAT', undefined)
      ])
    )
  )
  t.deepEqual(
    _0.decode(null),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting a STRING', null),
        Decode.Error.Failure('Expecting a FLOAT', null)
      ])
    )
  )
  t.deepEqual(
    _0.decode(false),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting a STRING', false),
        Decode.Error.Failure('Expecting a FLOAT', false)
      ])
    )
  )
  t.deepEqual(_0.decode('123.45'), Either.Right('123.45'))
  t.deepEqual(_0.decode(234.567), Either.Right('234.57'))
})

test('Json.Decode.enums(variants)', t => {
  t.deepEqual(
    Decode.enums([]).decode(undefined),
    Either.Left(Decode.Error.OneOf([]))
  )

  t.deepEqual(
    Decode.enums([]).decode(null),
    Either.Left(Decode.Error.OneOf([]))
  )

  const _0 /* Decoder<Date> */ = Decode.enums([['foo', new Date(2000, 3, 10)]])
  t.deepEqual(
    _0.decode(undefined),
    Either.Left(
      Decode.Error.OneOf([Decode.Error.Failure('Expecting `"foo"`', undefined)])
    )
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(
      Decode.Error.OneOf([Decode.Error.Failure('Expecting `"foo"`', null)])
    )
  )

  t.deepEqual(
    _0.decode(123),
    Either.Left(
      Decode.Error.OneOf([Decode.Error.Failure('Expecting `"foo"`', 123)])
    )
  )

  t.deepEqual(
    _0.decode('bar'),
    Either.Left(
      Decode.Error.OneOf([Decode.Error.Failure('Expecting `"foo"`', 'bar')])
    )
  )

  t.deepEqual(_0.decode('foo'), Either.Right(new Date(2000, 3, 10)))

  const _1 /* Decoder<number> */ = Decode.enums([
    ['Jan', 0],
    ['Feb', 1],
    ['Mar', 2]
  ])

  t.deepEqual(
    _1.decode('Jul'),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting `"Jan"`', 'Jul'),
        Decode.Error.Failure('Expecting `"Feb"`', 'Jul'),
        Decode.Error.Failure('Expecting `"Mar"`', 'Jul')
      ])
    )
  )

  t.deepEqual(_1.decode('Jan'), Either.Right(0))
  t.deepEqual(_1.decode('Feb'), Either.Right(1))
  t.deepEqual(_1.decode('Mar'), Either.Right(2))

  const _2 /* Decoder<Maybe<string>> */ = Decode.enums([
    [null, Maybe.Nothing],
    ['', Maybe.Nothing],
    [false, Maybe.Nothing],
    [NaN, Maybe.Nothing],
    [Infinity, Maybe.Just('Infinity')],
    ['str', Maybe.Just('string')],
    [true, Maybe.Just('boolean')],
    [3, Maybe.Just('number')]
  ])

  t.deepEqual(
    _2.decode([]),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting `null`', []),
        Decode.Error.Failure('Expecting `""`', []),
        Decode.Error.Failure('Expecting `false`', []),
        Decode.Error.Failure('Expecting `NaN`', []),
        Decode.Error.Failure('Expecting `Infinity`', []),
        Decode.Error.Failure('Expecting `"str"`', []),
        Decode.Error.Failure('Expecting `true`', []),
        Decode.Error.Failure('Expecting `3`', [])
      ])
    )
  )

  t.deepEqual(_2.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(''), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(false), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(NaN), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(Infinity), Either.Right(Maybe.Just('Infinity')))
  t.deepEqual(_2.decode('str'), Either.Right(Maybe.Just('string')))
  t.deepEqual(_2.decode(true), Either.Right(Maybe.Just('boolean')))
  t.deepEqual(_2.decode(3), Either.Right(Maybe.Just('number')))
})

test('Json.Decode.lazy(callDecoder)', t => {
  type Folder = {
    name: string
    children: Array<Folder>
  }

  const _0: Decode.Decoder<Folder> = Decode.shape({
    name: Decode.field('n').string,
    children: Decode.field('c').list(Decode.lazy(() => _0))
  })

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode({
      n: 'folder_0',
      c: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        'c',
        Decode.Error.Failure('Expecting an ARRAY', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      n: 'folder_0',
      c: null
    }),
    Either.Left(
      Decode.Error.Field('c', Decode.Error.Failure('Expecting an ARRAY', null))
    )
  )

  t.deepEqual(
    _0.decode({
      n: 'folder_0',
      c: []
    }),
    Either.Right({
      name: 'folder_0',
      children: []
    })
  )

  t.deepEqual(
    _0.decode({
      n: 'folder_0',
      c: [
        {
          n: 'folder_1_0',
          c: [
            {
              n: 'folder_2_0',
              c: [
                {
                  n: 'folder_3_0',
                  c: [null]
                }
              ]
            }
          ]
        },
        {
          n: 'folder_1_1',
          c: []
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        'c',
        Decode.Error.Index(
          0,
          Decode.Error.Field(
            'c',
            Decode.Error.Index(
              0,
              Decode.Error.Field(
                'c',
                Decode.Error.Index(
                  0,
                  Decode.Error.Field(
                    'c',
                    Decode.Error.Index(
                      0,
                      Decode.Error.Failure('Expecting an OBJECT', null)
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      n: 'folder_0',
      c: [
        {
          n: 'folder_1_0',
          c: [
            {
              n: 'folder_2_0',
              c: [
                {
                  n: 'folder_3_0',
                  c: []
                }
              ]
            }
          ]
        },
        {
          n: 'folder_1_1',
          c: []
        }
      ]
    }),
    Either.Right({
      name: 'folder_0',
      children: [
        {
          name: 'folder_1_0',
          children: [
            {
              name: 'folder_2_0',
              children: [
                {
                  name: 'folder_3_0',
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: 'folder_1_1',
          children: []
        }
      ]
    })
  )
})

/**
 * F I E L D
 */

test('Json.Decode.field(name).of(decoder)', t => {
  const _0 /* Decode<string> */ = Decode.field('_1').of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
    )
  )

  t.deepEqual(
    _0.decode({ _1: null }),
    Either.Left(
      Decode.Error.Field('_1', Decode.Error.Failure('Expecting a STRING', null))
    )
  )

  t.deepEqual(
    _0.decode({ _1: 1 }),
    Either.Left(
      Decode.Error.Field('_1', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(_0.decode({ _1: 'str' }), Either.Right('str'))
})

test('Json.Decode.field(name).{`of` shortcuts}', t => {
  t.deepEqual(
    Decode.field('__0__').string.decode({
      __0__: 'str'
    }),
    Either.Right('str'),
    'Json.Decode.field(name).string'
  )

  t.deepEqual(
    Decode.field('__0__').boolean.decode({
      __0__: true
    }),
    Either.Right(true),
    'Json.Decode.field(name).boolean'
  )

  t.deepEqual(
    Decode.field('__0__').int.decode({
      __0__: 1
    }),
    Either.Right(1),
    'Json.Decode.field(name).int'
  )

  t.deepEqual(
    Decode.field('__0__').float.decode({
      __0__: 1.23
    }),
    Either.Right(1.23),
    'Json.Decode.field(name).float'
  )

  t.deepEqual(
    Decode.field('__0__')
      .value.decode({
        __0__: [1, null, false, {}]
      })
      .map(value => value.serialize()),
    Either.Right([1, null, false, {}]),
    'Json.Decode.field(name).value'
  )

  t.deepEqual(
    Decode.field('__0__')
      .shape({
        _0: Decode.field('_0_').string,
        _1: Decode.field('_1_').int
      })
      .decode({
        __0__: {
          _0_: 'str',
          _1_: 123
        }
      }),
    Either.Right({
      _0: 'str',
      _1: 123
    }),
    'Json.Decode.field(name).shape(object)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .list(Decode.int)
      .decode({
        __0__: [3, 2, 1, 0]
      }),
    Either.Right([3, 2, 1, 0]),
    'Json.Decode.field(name).list(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .keyValue(Decode.boolean)
      .decode({
        __0__: {
          _0: true,
          _1: false,
          _2: false
        }
      }),
    Either.Right<Array<[string, boolean]>>([
      ['_0', true],
      ['_1', false],
      ['_2', false]
    ]),
    'Json.Decode.field(name).keyValue(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .keyValue(
        str => Either.Right(Number(str.replace('_', ''))),
        Decode.boolean
      )
      .decode({
        __0__: {
          _0: true,
          _1: false,
          _2: false
        }
      }),
    Either.Right<Array<[number, boolean]>>([
      [0, true],
      [1, false],
      [2, false]
    ]),
    'Json.Decode.field(name).keyValue(convertKey, decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .dict(Decode.float)
      .decode({
        __0__: {
          _0: 1.23,
          _1: 4.56,
          _2: 7.89
        }
      }),
    Either.Right({
      _0: 1.23,
      _1: 4.56,
      _2: 7.89
    }),
    'Json.Decode.field(name).dict(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .enums([
        ['true', true],
        ['false', false]
      ])
      .decode({
        __0__: 'true'
      }),
    Either.Right(true),
    'Json.Decode.field(name).enums(variants)'
  )

  const _0 /* Decoder<boolean> */ = Decode.field('__0__').oneOf([
    Decode.boolean,
    Decode.int.map(x => x > 0)
  ])

  t.deepEqual(
    _0.decode({
      __0__: false
    }),
    Either.Right(false),
    'Json.Decode.field(name).oneOf(decoders)'
  )
  t.deepEqual(
    _0.decode({
      __0__: 10
    }),
    Either.Right(true),
    'Json.Decode.field(name).oneOf(decoders)'
  )

  const _1: Decode.Decoder<string> = Decode.field('__0__').lazy(() =>
    Decode.oneOf([_1, Decode.string])
  )

  t.deepEqual(
    _1.decode({
      __0__: '_1'
    }),
    Either.Right('_1'),
    'Json.Decode.field(name).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode({
      __0__: {
        __0__: '_2'
      }
    }),
    Either.Right('_2'),
    'Json.Decode.field(name).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode({
      __0__: {
        __0__: {
          __0__: '_3'
        }
      }
    }),
    Either.Right('_3'),
    'Json.Decode.field(name).lazy(callDecoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .field('__1__')
      .of(Decode.string)
      .decode({
        __0__: {
          __1__: 'str'
        }
      }),
    Either.Right('str'),
    'Json.Decode.field(name).field(name).of(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .index(1)
      .of(Decode.string)
      .decode({
        __0__: ['str0', 'str1']
      }),
    Either.Right('str1'),
    'Json.Decode.field(name).index(position).of(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .at([1, '__2__'])
      .of(Decode.string)
      .decode({
        __0__: [
          null,
          {
            __2__: 'str'
          }
        ]
      }),
    Either.Right('str'),
    'Json.Decode.field(name).at(path).of(decoder)'
  )

  t.deepEqual(
    Decode.field('__0__')
      .at(['__1__', 2])
      .of(Decode.string)
      .decode({
        __0__: {
          __1__: [null, null, 'str']
        }
      }),
    Either.Right('str'),
    'Json.Decode.field(name).at(path).of(decoder)'
  )
})

test('Json.Decode.field(name).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.field('_1').optional.of(
    Decode.string
  )

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
    )
  )

  t.deepEqual(_0.decode({ _1: undefined }), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode({ _1: null }), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({ _1: 1 }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )

  t.deepEqual(_0.decode({ _1: 'str' }), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.field(name).optional.field(name).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.field('_1')
    .optional.field('_2')
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _1: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: null
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: []
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: {}
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: {
        _2: undefined
      }
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Field(
          '_2',
          Decode.Error.Failure('Expecting a STRING', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: {
        _2: null
      }
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Field(
          '_2',
          Decode.Error.Failure('Expecting a STRING', null)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: {
        _2: 1
      }
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Field('_2', Decode.Error.Failure('Expecting a STRING', 1))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: {
        _2: 'str'
      }
    }),
    Either.Right(Maybe.Just('str'))
  )
})

test('Json.Decode.field(name).optional.index(position).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.field('_1')
    .optional.index(2)
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _1: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: null
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: {}
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: []
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, undefined]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(
          2,
          Decode.Error.Failure('Expecting a STRING', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, null]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(2, Decode.Error.Failure('Expecting a STRING', null))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, 1]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(2, Decode.Error.Failure('Expecting a STRING', 1))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, 'str']
    }),
    Either.Right(Maybe.Just('str'))
  )
})

test('Json.Decode.field(name).optional.at(path).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.field('_1')
    .optional.at([2, '_3'])
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _1: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: null
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: {}
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: []
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, undefined]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, null]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(
          2,
          Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [null, null, {}]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _1: [
        null,
        null,
        {
          _3: undefined
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(
          2,
          Decode.Error.Field(
            '_3',
            Decode.Error.Failure('Expecting a STRING', undefined)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [
        null,
        null,
        {
          _3: null
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(
          2,
          Decode.Error.Field(
            '_3',
            Decode.Error.Failure('Expecting a STRING', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [
        null,
        null,
        {
          _3: 1
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Index(
          2,
          Decode.Error.Field(
            '_3',
            Decode.Error.Failure('Expecting a STRING', 1)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _1: [
        null,
        null,
        {
          _3: 'str'
        }
      ]
    }),
    Either.Right(Maybe.Just('str'))
  )
})

/**
 * I N D E X
 */

test('Json.Decode.index(position).of(decoder)', t => {
  const _0 /* Decoder<string> */ = Decode.index(0).string

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(
    _0.decode([null]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting a STRING', null))
    )
  )

  t.deepEqual(
    _0.decode([1]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(_0.decode(['str']), Either.Right('str'))

  const _1 /* Decoder<string> */ = Decode.index(-1).string

  t.deepEqual(
    _1.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _1.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _1.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [-1] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(
    _1.decode([null, null]),
    Either.Left(
      Decode.Error.Index(-1, Decode.Error.Failure('Expecting a STRING', null))
    )
  )

  t.deepEqual(
    _1.decode([null, 1]),
    Either.Left(
      Decode.Error.Index(-1, Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(_1.decode([null, 'str']), Either.Right('str'))
})

test('Json.Decode.index(position).{`of` shortcuts}', t => {
  t.deepEqual(
    Decode.index(0).string.decode(['str']),
    Either.Right('str'),
    'Json.Decode.index(position).string'
  )

  t.deepEqual(
    Decode.index(0).boolean.decode([true]),
    Either.Right(true),
    'Json.Decode.index(position).boolean'
  )

  t.deepEqual(
    Decode.index(0).int.decode([1]),
    Either.Right(1),
    'Json.Decode.index(position).int'
  )

  t.deepEqual(
    Decode.index(0).float.decode([1.23]),
    Either.Right(1.23),
    'Json.Decode.index(position).float'
  )

  t.deepEqual(
    Decode.index(0)
      .value.decode([
        {
          _0: 1,
          _1: null,
          _3: false,
          _4: []
        }
      ])
      .map(value => value.serialize()),
    Either.Right({
      _0: 1,
      _1: null,
      _3: false,
      _4: []
    }),
    'Json.Decode.index(position).value'
  )

  t.deepEqual(
    Decode.index(0)
      .shape({
        _0: Decode.field('_0_').string,
        _1: Decode.field('_1_').int
      })
      .decode([
        {
          _0_: 'str',
          _1_: 123
        }
      ]),
    Either.Right({
      _0: 'str',
      _1: 123
    }),
    'Json.Decode.index(position).shape(object)'
  )

  t.deepEqual(
    Decode.index(0)
      .list(Decode.int)
      .decode([[3, 2, 1, 0]]),
    Either.Right([3, 2, 1, 0]),
    'Json.Decode.index(position).list(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .keyValue(Decode.boolean)
      .decode([
        {
          _0: true,
          _1: false,
          _2: false
        }
      ]),
    Either.Right<Array<[string, boolean]>>([
      ['_0', true],
      ['_1', false],
      ['_2', false]
    ]),
    'Json.Decode.index(position).keyValue(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .keyValue(
        str => Either.Right(Number(str.replace('_', ''))),
        Decode.boolean
      )
      .decode([
        {
          _0: true,
          _1: false,
          _2: false
        }
      ]),
    Either.Right<Array<[number, boolean]>>([
      [0, true],
      [1, false],
      [2, false]
    ]),
    'Json.Decode.index(position).keyValue(convertKey, decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .dict(Decode.float)
      .decode([
        {
          _0: 1.23,
          _1: 4.56,
          _2: 7.89
        }
      ]),
    Either.Right({
      _0: 1.23,
      _1: 4.56,
      _2: 7.89
    }),
    'Json.Decode.index(position).dict(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .enums([
        ['true', true],
        ['false', false]
      ])
      .decode(['false']),
    Either.Right(false),
    'Json.Decode.index(position).enums(variants)'
  )

  const _0 /* Decoder<boolean> */ = Decode.index(0).oneOf([
    Decode.boolean,
    Decode.int.map(x => x > 0)
  ])

  t.deepEqual(
    _0.decode([false]),
    Either.Right(false),
    'Json.Decode.index(position).oneOf(decoders)'
  )
  t.deepEqual(
    _0.decode([10]),
    Either.Right(true),
    'Json.Decode.index(position).oneOf(decoders)'
  )

  const _1: Decode.Decoder<string> = Decode.index(0).lazy(() =>
    Decode.oneOf([_1, Decode.string])
  )

  t.deepEqual(
    _1.decode(['_1']),
    Either.Right('_1'),
    'Json.Decode.index(position).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode([['_2']]),
    Either.Right('_2'),
    'Json.Decode.index(position).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode([[['_3']]]),
    Either.Right('_3'),
    'Json.Decode.index(position).lazy(callDecoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .field('__1__')
      .of(Decode.string)
      .decode([
        {
          __1__: 'str'
        }
      ]),
    Either.Right('str'),
    'Json.Decode.index(position).field(name).of(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .index(1)
      .of(Decode.string)
      .decode([['str0', 'str1']]),
    Either.Right('str1'),
    'Json.Decode.index(position).index(position).of(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .at(['__1__', 2])
      .of(Decode.string)
      .decode([
        {
          __1__: [null, null, 'str']
        }
      ]),
    Either.Right('str'),
    'Json.Decode.index(position).at(path).of(decoder)'
  )

  t.deepEqual(
    Decode.index(0)
      .at([1, '__2__'])
      .of(Decode.string)
      .decode([
        [
          null,
          {
            __2__: 'str'
          }
        ]
      ]),
    Either.Right('str'),
    'Json.Decode.index(position).at(path).of(decoder)'
  )
})

test('Json.Decode.index(position).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.index(0).optional.of(
    Decode.string
  )

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode([undefined]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([null]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([1]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )

  t.deepEqual(_0.decode(['str']), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.index(position).optional.field(name).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.index(0)
    .optional.field('_1')
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode([undefined]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([null]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([[]]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
      )
    )
  )

  t.deepEqual(_0.decode([{}]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([
      {
        _1: undefined
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting a STRING', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: undefined
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting a STRING', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: null
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting a STRING', null)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: 1
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field('_1', Decode.Error.Failure('Expecting a STRING', 1))
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: 'str'
      }
    ]),
    Either.Right(Maybe.Just('str'))
  )
})

test('Json.Decode.index(position).optional.index(position).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.index(0)
    .optional.index(1)
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode([undefined]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([null]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([{}]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
      )
    )
  )

  t.deepEqual(_0.decode([[]]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([[null, undefined]]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Index(
          1,
          Decode.Error.Failure('Expecting a STRING', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([[null, null]]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Index(1, Decode.Error.Failure('Expecting a STRING', null))
      )
    )
  )

  t.deepEqual(
    _0.decode([[null, 1]]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Index(1, Decode.Error.Failure('Expecting a STRING', 1))
      )
    )
  )

  t.deepEqual(_0.decode([[null, 'str']]), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.index(position).optional.at(path).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.index(0)
    .optional.at(['_1', 2])
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(_0.decode([undefined]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([null]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([[]]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
      )
    )
  )

  t.deepEqual(_0.decode([{}]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([
      {
        _1: undefined
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: null
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: {}
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: []
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, undefined]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Failure('Expecting a STRING', undefined)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, null]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Failure('Expecting a STRING', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, 1]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(2, Decode.Error.Failure('Expecting a STRING', 1))
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, 'str']
      }
    ]),
    Either.Right(Maybe.Just('str'))
  )
})

/**
 * A T
 */

test('Json.Decode.at(path).of(decoder)', t => {
  const _0 /* Decoder<string> */ = Decode.at(['_0', 1, '_2', 3]).of(
    Decode.string
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_0'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', null))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {}
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', {}))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure(
          'Expecting an ARRAY with an ELEMENT at [1] but only see 1 entries',
          [0]
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, null]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(1, Decode.Error.Failure('Expecting an OBJECT', null))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(1, Decode.Error.Failure('Expecting an OBJECT', []))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, {}]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure(
            "Expecting an OBJECT with a FIELD named '_2'",
            {}
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: null
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an ARRAY', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: {}
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an ARRAY', {})
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure(
              'Expecting an ARRAY with an ELEMENT at [3] but only see 3 entries',
              [0, 1, 2]
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, null]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(
              3,
              Decode.Error.Failure('Expecting a STRING', null)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 3]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(3, Decode.Error.Failure('Expecting a STRING', 3))
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 'final']
        }
      ]
    }),
    Either.Right('final')
  )
})

test('Json.Decode.at(path).{`of` shortcuts}', t => {
  t.deepEqual(
    Decode.at([0, '__1__']).string.decode([
      {
        __1__: 'str'
      }
    ]),
    Either.Right('str'),
    'Json.Decode.at(path).string'
  )

  t.deepEqual(
    Decode.at([0, '__1__']).boolean.decode([
      {
        __1__: true
      }
    ]),
    Either.Right(true),
    'Json.Decode.at(path).boolean'
  )

  t.deepEqual(
    Decode.at([0, '__1__']).int.decode([
      {
        __1__: 1
      }
    ]),
    Either.Right(1),
    'Json.Decode.at(path).int'
  )

  t.deepEqual(
    Decode.at([0, '__1__']).float.decode([
      {
        __1__: 1.23
      }
    ]),
    Either.Right(1.23),
    'Json.Decode.at(path).float'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .value.decode([
        {
          __1__: [1, null, false, {}]
        }
      ])
      .map(value => value.serialize()),
    Either.Right([1, null, false, {}]),
    'Json.Decode.at(path).value'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .shape({
        _0: Decode.field('_0_').string,
        _1: Decode.field('_1_').int
      })
      .decode([
        {
          __1__: {
            _0_: 'str',
            _1_: 123
          }
        }
      ]),
    Either.Right({
      _0: 'str',
      _1: 123
    }),
    'Json.Decode.at(path).shape(object)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .list(Decode.int)
      .decode([
        {
          __1__: [3, 2, 1, 0]
        }
      ]),
    Either.Right([3, 2, 1, 0]),
    'Json.Decode.at(path).list(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .keyValue(Decode.boolean)
      .decode([
        {
          __1__: {
            _0: true,
            _1: false,
            _2: false
          }
        }
      ]),
    Either.Right<Array<[string, boolean]>>([
      ['_0', true],
      ['_1', false],
      ['_2', false]
    ]),
    'Json.Decode.at(path).keyValue(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .keyValue(
        str => Either.Right(Number(str.replace('_', ''))),
        Decode.boolean
      )
      .decode([
        {
          __1__: {
            _0: true,
            _1: false,
            _2: false
          }
        }
      ]),
    Either.Right<Array<[number, boolean]>>([
      [0, true],
      [1, false],
      [2, false]
    ]),
    'Json.Decode.at(path).keyValue(convertKey, decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .dict(Decode.float)
      .decode([
        {
          __1__: {
            _0: 1.23,
            _1: 4.56,
            _2: 7.89
          }
        }
      ]),
    Either.Right({
      _0: 1.23,
      _1: 4.56,
      _2: 7.89
    }),
    'Json.Decode.at(path).dict(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .enums([
        ['true', true],
        ['false', false]
      ])
      .decode([
        {
          __1__: 'true'
        }
      ]),
    Either.Right(true),
    'Json.Decode.at(path).enums(variants)'
  )

  const _0 /* Decoder<boolean> */ = Decode.at([0, '__1__']).oneOf([
    Decode.boolean,
    Decode.int.map(x => x > 0)
  ])

  t.deepEqual(
    _0.decode([
      {
        __1__: false
      }
    ]),
    Either.Right(false),
    'Json.Decode.at(path).oneOf(decoders)'
  )
  t.deepEqual(
    _0.decode([
      {
        __1__: 10
      }
    ]),
    Either.Right(true),
    'Json.Decode.at(path).oneOf(decoders)'
  )

  const _1: Decode.Decoder<string> = Decode.at([0, '__1__']).lazy(() =>
    Decode.oneOf([_1, Decode.string])
  )

  t.deepEqual(
    _1.decode([
      {
        __1__: '_1'
      }
    ]),
    Either.Right('_1'),
    'Json.Decode.at(path).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode([
      {
        __1__: [
          {
            __1__: '_2'
          }
        ]
      }
    ]),
    Either.Right('_2'),
    'Json.Decode.at(path).lazy(callDecoder)'
  )
  t.deepEqual(
    _1.decode([
      {
        __1__: [
          {
            __1__: [
              {
                __1__: '_3'
              }
            ]
          }
        ]
      }
    ]),
    Either.Right('_3'),
    'Json.Decode.at(path).lazy(callDecoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .field('__2__')
      .of(Decode.string)
      .decode([
        {
          __1__: {
            __2__: 'str'
          }
        }
      ]),
    Either.Right('str'),
    'Json.Decode.at(path).field(name).of(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .index(2)
      .of(Decode.string)
      .decode([
        {
          __1__: [null, null, 'str']
        }
      ]),
    Either.Right('str'),
    'Json.Decode.at(path).index(position).of(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .at(['__2__', 3])
      .of(Decode.string)
      .decode([
        {
          __1__: {
            __2__: [null, null, null, 'str']
          }
        }
      ]),
    Either.Right('str'),
    'Json.Decode.at(path).at(path).of(decoder)'
  )

  t.deepEqual(
    Decode.at([0, '__1__'])
      .at([2, '__3__'])
      .of(Decode.string)
      .decode([
        {
          __1__: [
            null,
            null,
            {
              __3__: 'str'
            }
          ]
        }
      ]),
    Either.Right('str'),
    'Json.Decode.at(path).at(path).of(decoder)'
  )
})

test('Json.Decode.at(path).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.at([
    '_0',
    1,
    '_2',
    3
  ]).optional.of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_0'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _0: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure('Expecting an ARRAY', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', null))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {}
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', {}))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure(
          'Expecting an ARRAY with an ELEMENT at [1] but only see 1 entries',
          [0]
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, undefined]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure('Expecting an OBJECT', undefined)
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, null]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(1, Decode.Error.Failure('Expecting an OBJECT', null))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(1, Decode.Error.Failure('Expecting an OBJECT', []))
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, {}]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure(
            "Expecting an OBJECT with a FIELD named '_2'",
            {}
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: undefined
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an ARRAY', undefined)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: null
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an ARRAY', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: {}
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an ARRAY', {})
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure(
              'Expecting an ARRAY with an ELEMENT at [3] but only see 3 entries',
              [0, 1, 2]
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, undefined]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, null]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 3]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(
              3,
              Decode.Error.Failure('Expecting an OPTIONAL STRING', 3)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 'final']
        }
      ]
    }),
    Either.Right(Maybe.Just('final'))
  )
})

test('Json.Decode.at(path).optional.field(name).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.at(['_0', 1])
    .optional.field('_2')
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', null))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OBJECT', []))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(
      Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_0'", {})
    )
  )

  t.deepEqual(
    _0.decode({
      _0: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure('Expecting an ARRAY', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', null))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: {}
    }),
    Either.Left(
      Decode.Error.Field('_0', Decode.Error.Failure('Expecting an ARRAY', {}))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: []
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure(
          'Expecting an ARRAY with an ELEMENT at [1] but only see 0 entries',
          []
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [null, undefined]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [null, null]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [null, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [null, {}]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        null,
        {
          _2: undefined
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting a STRING', undefined)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        null,
        {
          _2: null
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting a STRING', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        null,
        {
          _2: 1
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting a STRING', 1)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        null,
        {
          _2: 'str'
        }
      ]
    }),
    Either.Right(Maybe.Just('str'))
  )
})

test('Json.Decode.at(path).optional.index(position).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.at([0, '_1'])
    .optional.index(2)
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(
    _0.decode([undefined]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OBJECT', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode([null]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting an OBJECT', null))
    )
  )

  t.deepEqual(
    _0.decode([[]]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting an OBJECT', []))
    )
  )

  t.deepEqual(
    _0.decode([{}]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: undefined
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: null
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: {}
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: []
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, undefined]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Failure('Expecting a STRING', undefined)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, null]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Failure('Expecting a STRING', null)
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, 1]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(2, Decode.Error.Failure('Expecting a STRING', 1))
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, 'str']
      }
    ]),
    Either.Right(Maybe.Just('str'))
  )
})

test('Json.Decode.at(position).optional.at(path).of(decoder)', t => {
  const _0 /* Decode<Maybe<string>> */ = Decode.at([0, '_1'])
    .optional.at([2, '_3'])
    .of(Decode.string)

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', null))
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an ARRAY', {}))
  )

  t.deepEqual(
    _0.decode([]),
    Either.Left(
      Decode.Error.Failure(
        'Expecting an ARRAY with an ELEMENT at [0] but only see 0 entries',
        []
      )
    )
  )

  t.deepEqual(
    _0.decode([undefined]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OBJECT', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode([null]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting an OBJECT', null))
    )
  )

  t.deepEqual(
    _0.decode([[]]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting an OBJECT', []))
    )
  )

  t.deepEqual(
    _0.decode([{}]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure("Expecting an OBJECT with a FIELD named '_1'", {})
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: undefined
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: null
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: {}
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: []
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, undefined]
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, null]
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, []]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [null, null, {}]
      }
    ]),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [
          null,
          null,
          {
            _3: undefined
          }
        ]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Field(
              '_3',
              Decode.Error.Failure('Expecting a STRING', undefined)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [
          null,
          null,
          {
            _3: null
          }
        ]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Field(
              '_3',
              Decode.Error.Failure('Expecting a STRING', null)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [
          null,
          null,
          {
            _3: 1
          }
        ]
      }
    ]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Field(
          '_1',
          Decode.Error.Index(
            2,
            Decode.Error.Field(
              '_3',
              Decode.Error.Failure('Expecting a STRING', 1)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode([
      {
        _1: [
          null,
          null,
          {
            _3: 'str'
          }
        ]
      }
    ]),
    Either.Right(Maybe.Just('str'))
  )
})

/**
 * O P T I O N A L
 */

test('Json.Decode.optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL STRING', 1))
  )

  t.deepEqual(_0.decode('str'), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.string', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional.string

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL STRING', 1))
  )

  t.deepEqual(_0.decode('str'), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.boolean', t => {
  const _0 /* Decoder<Maybe<boolean>> */ = Decode.optional.boolean

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL BOOLEAN', 1))
  )

  t.deepEqual(_0.decode(true), Either.Right(Maybe.Just(true)))
})

test('Json.Decode.optional.int', t => {
  const _0 /* Decoder<Maybe<number>> */ = Decode.optional.int

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(1.1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL INTEGER', 1.1))
  )

  t.deepEqual(_0.decode(1), Either.Right(Maybe.Just(1)))
})

test('Json.Decode.optional.float', t => {
  const _0 /* Decoder<Maybe<number>> */ = Decode.optional.float

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(false),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL FLOAT', false))
  )

  t.deepEqual(_0.decode(1.23), Either.Right(Maybe.Just(1.23)))
})

test('Json.Decode.optional.shape(object)', t => {
  const _0 /* Decoder<Maybe<{}>> */ = Decode.optional.shape({})

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode('str'), Either.Right(Maybe.Just({})))

  t.deepEqual(_0.decode(true), Either.Right(Maybe.Just({})))

  t.deepEqual(_0.decode(1), Either.Right(Maybe.Just({})))

  t.deepEqual(_0.decode(1.1), Either.Right(Maybe.Just({})))

  const _1 /* Decoder<Maybe<{
        _0_: string;
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.string
    }
  )
  t.deepEqual(_1.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_1.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _1.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL STRING', 1))
  )
  t.deepEqual(
    _1.decode('str'),
    Either.Right(
      Maybe.Just({
        _0_: 'str'
      })
    )
  )

  const _2 /* Decoder<Maybe<{
        _0_: Maybe<string>;
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.optional.string
    }
  )
  t.deepEqual(_2.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _2.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL STRING', 1))
  )
  t.deepEqual(
    _2.decode('str'),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Just('str')
      })
    )
  )

  const _3 /* Decoder<Maybe<{
        _0_: string;
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.field('__0__').of(Decode.string)
    }
  )
  t.deepEqual(
    _3.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(_3.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_3.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _3.decode({}),
    Either.Left(
      Decode.Error.Failure(
        "Expecting an OPTIONAL OBJECT with a FIELD named '__0__'",
        {}
      )
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: null
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', null)
      )
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )
  t.deepEqual(
    _3.decode({
      __0__: 'str'
    }),
    Either.Right(
      Maybe.Just({
        _0_: 'str'
      })
    )
  )

  const _4 /* Decoder<Maybe<{
        _0_: Maybe<string>
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.optional.field('__0__').of(Decode.string)
    }
  )
  t.deepEqual(
    _4.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(_4.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_4.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _4.decode({}),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: undefined
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: null
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting a STRING', null)
      )
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )
  t.deepEqual(
    _4.decode({
      __0__: 'str'
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Just('str')
      })
    )
  )

  const _5 /* Decoder<Maybe<{
        _0_: Maybe<string>
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.field('__0__').optional.of(Decode.string)
    }
  )
  t.deepEqual(_5.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_5.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _5.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(
    _5.decode({}),
    Either.Left(
      Decode.Error.Failure(
        "Expecting an OPTIONAL OBJECT with a FIELD named '__0__'",
        {}
      )
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: undefined
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: null
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )
  t.deepEqual(
    _5.decode({
      __0__: 'str'
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Just('str')
      })
    )
  )

  const _6 /* Decoder<Maybe<{
        _0_: Maybe<string>
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.optional.field('__0__').optional.of(Decode.string)
    }
  )
  t.deepEqual(_6.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_6.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _6.decode(1),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', 1))
  )
  t.deepEqual(
    _6.decode({}),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _6.decode({
      __0__: null
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _6.decode({
      __0__: undefined
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Nothing
      })
    )
  )
  t.deepEqual(
    _6.decode({
      __0__: 1
    }),
    Either.Left(
      Decode.Error.Field(
        '__0__',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )
  t.deepEqual(
    _6.decode({
      __0__: 'str'
    }),
    Either.Right(
      Maybe.Just({
        _0_: Maybe.Just('str')
      })
    )
  )

  const _7 /* Decoder<Maybe<{
        _0_: string;
        _1_: number;
    }>> */ = Decode.optional.shape(
    {
      _0_: Decode.field('__0__').string,
      _1_: Decode.field('__1__').int
    }
  )
  t.deepEqual(_7.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_7.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(
    _7.decode({}),
    Either.Left(
      Decode.Error.Failure(
        "Expecting an OPTIONAL OBJECT with a FIELD named '__0__'",
        {}
      )
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 0
    }),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 0))
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str'
    }),
    Either.Left(
      Decode.Error.Failure(
        "Expecting an OPTIONAL OBJECT with a FIELD named '__1__'",
        {
          __0__: 'str'
        }
      )
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str',
      __1__: 1.1
    }),
    Either.Left(
      Decode.Error.Field(
        '__1__',
        Decode.Error.Failure('Expecting an INTEGER', 1.1)
      )
    )
  )
  t.deepEqual(
    _7.decode({
      __0__: 'str',
      __1__: 1
    }),
    Either.Right(
      Maybe.Just({
        _0_: 'str',
        _1_: 1
      })
    )
  )
})

test('Json.Decode.optional.list(decoder)', t => {
  const _0 /* Decoder<Maybe<Array<number>>> */ = Decode.optional.list(
    Decode.int
  )

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(null),
    Either.Right(Maybe.Nothing),
    'Json.Decode.optional.list(decoder)'
  )

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {}))
  )

  t.deepEqual(_0.decode([]), Either.Right(Maybe.Just([])))

  t.deepEqual(
    _0.decode([1, 3, undefined]),
    Either.Left(
      Decode.Error.Index(
        2,
        Decode.Error.Failure('Expecting an INTEGER', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode([1, 3, null]),
    Either.Left(
      Decode.Error.Index(2, Decode.Error.Failure('Expecting an INTEGER', null))
    )
  )

  t.deepEqual(
    _0.decode([1, 3, '2']),
    Either.Left(
      Decode.Error.Index(2, Decode.Error.Failure('Expecting an INTEGER', '2'))
    )
  )

  t.deepEqual(_0.decode([3, 2, 1, 0]), Either.Right(Maybe.Just([3, 2, 1, 0])))
})

test('Json.Decode.optional.keyValue(decoder)', t => {
  const _0 /* Decoder<Maybe<Array<[ string, boolean ]>>> */ = Decode.optional.keyValue(
    Decode.boolean
  )

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Just([])))

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: undefined,
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: null,
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', null)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: 'false',
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', 'false')
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: false,
      _2: false
    }),
    Either.Right(
      Maybe.Just<Array<[string, boolean]>>([
        ['_0', true],
        ['_1', false],
        ['_2', false]
      ])
    )
  )
})

test('Json.Decode.optional.keyValue(convertKey, decoder)', t => {
  const _0 /* Decoder<Maybe<Array<[ number, boolean ]>>> */ = Decode.optional.keyValue(
    (key: string) => {
      const num = Number(key.replace('_', ''))

      return isNaN(num)
        ? Either.Left(`Key '${key}' could not be converted to number`)
        : Either.Right(num)
    },
    Decode.boolean
  )

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Just([])))

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: undefined,
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: null,
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', null)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: 'false',
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a BOOLEAN', 'false')
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _wrong: false,
      _2: false
    }),
    Either.Left(
      Decode.Error.Field(
        '_wrong',
        Decode.Error.Failure(
          "Key '_wrong' could not be converted to number",
          '_wrong'
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: true,
      _1: false,
      _2: false
    }),
    Either.Right(
      Maybe.Just<Array<[number, boolean]>>([
        [0, true],
        [1, false],
        [2, false]
      ])
    )
  )
})

test('Json.Decode.optional.dict(decoder)', t => {
  const _0 /* Decoder<Maybe<{[ key: string ]: number }>> */ = Decode.optional.dict(
    Decode.float
  )

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Just({})))

  t.deepEqual(
    _0.decode({
      _0: 1.23,
      _1: undefined,
      _2: 7.89
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a FLOAT', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: 1.23,
      _1: null,
      _2: 7.89
    }),
    Either.Left(
      Decode.Error.Field('_1', Decode.Error.Failure('Expecting a FLOAT', null))
    )
  )

  t.deepEqual(
    _0.decode({
      _0: 1.23,
      _1: 'false',
      _2: 7.89
    }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a FLOAT', 'false')
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: 1.23,
      _1: 4.56,
      _2: 7.89
    }),
    Either.Right(
      Maybe.Just({
        _0: 1.23,
        _1: 4.56,
        _2: 7.89
      })
    )
  )
})

test('Json.Decode.optional.oneOf(decoders)', t => {
  const _0 /* Decoder<Maybe<boolean>> */ = Decode.optional.oneOf([
    Decode.boolean,
    Decode.int.map(x => x > 0)
  ])

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode('str'),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting an OPTIONAL BOOLEAN', 'str'),
        Decode.Error.Failure('Expecting an OPTIONAL INTEGER', 'str')
      ])
    )
  )

  t.deepEqual(_0.decode(false), Either.Right(Maybe.Just(false)))

  t.deepEqual(_0.decode(10), Either.Right(Maybe.Just(true)))
})

test('Json.Decode.optional.enums(variants)', t => {
  t.deepEqual(
    Decode.optional.enums([]).decode(undefined),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    Decode.optional.enums([]).decode(null),
    Either.Right(Maybe.Nothing)
  )

  const _0 /* Decoder<Maybe<Date>> */ = Decode.optional.enums([
    ['foo', new Date(2000, 3, 10)]
  ])
  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode(123),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting an OPTIONAL `"foo"`', 123)
      ])
    )
  )

  t.deepEqual(
    _0.decode('bar'),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting an OPTIONAL `"foo"`', 'bar')
      ])
    )
  )

  t.deepEqual(_0.decode('foo'), Either.Right(Maybe.Just(new Date(2000, 3, 10))))

  const _1 /* Decoder<Maybe<number>> */ = Decode.optional.enums([
    ['Jan', 0],
    ['Feb', 1],
    ['Mar', 2]
  ])

  t.deepEqual(
    _1.decode('Jul'),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting an OPTIONAL `"Jan"`', 'Jul'),
        Decode.Error.Failure('Expecting an OPTIONAL `"Feb"`', 'Jul'),
        Decode.Error.Failure('Expecting an OPTIONAL `"Mar"`', 'Jul')
      ])
    )
  )

  t.deepEqual(_1.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_1.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(_1.decode('Jan'), Either.Right(Maybe.Just(0)))
  t.deepEqual(_1.decode('Feb'), Either.Right(Maybe.Just(1)))
  t.deepEqual(_1.decode('Mar'), Either.Right(Maybe.Just(2)))

  const _2 /* Decoder<string>> */ = Decode.optional.enums([
    [Infinity, 'Infinity'],
    ['str', 'string'],
    [true, 'boolean'],
    [3, 'number']
  ])

  t.deepEqual(
    _2.decode([]),
    Either.Left(
      Decode.Error.OneOf([
        Decode.Error.Failure('Expecting an OPTIONAL `Infinity`', []),
        Decode.Error.Failure('Expecting an OPTIONAL `"str"`', []),
        Decode.Error.Failure('Expecting an OPTIONAL `true`', []),
        Decode.Error.Failure('Expecting an OPTIONAL `3`', [])
      ])
    )
  )

  t.deepEqual(_2.decode(undefined), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(null), Either.Right(Maybe.Nothing))
  t.deepEqual(_2.decode(Infinity), Either.Right(Maybe.Just('Infinity')))
  t.deepEqual(_2.decode('str'), Either.Right(Maybe.Just('string')))
  t.deepEqual(_2.decode(true), Either.Right(Maybe.Just('boolean')))
  t.deepEqual(_2.decode(3), Either.Right(Maybe.Just('number')))
})

test('Json.Decode.optional.{impossibles}', t => {
  t.is(
    typeof (Decode.optional as { optional: null }).optional,
    'undefined',
    '`.optional.optional` is impossible'
  )

  t.is(
    typeof (Decode.optional as { value: null }).value,
    'undefined',
    '`.optional.value` is impossible'
  )

  t.is(
    typeof (Decode.optional as { lazy: null }).lazy,
    'undefined',
    '`.optional.lazy(callDecoder)` is impossible'
  )
})

test('Json.Decode.optional.field(name).of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .field('_1')
    .of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({ _1: undefined }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode({ _1: null }),
    Either.Left(
      Decode.Error.Field('_1', Decode.Error.Failure('Expecting a STRING', null))
    )
  )

  t.deepEqual(
    _0.decode({ _1: 1 }),
    Either.Left(
      Decode.Error.Field('_1', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(_0.decode({ _1: 'str' }), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.field(name).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .field('_1')
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode({ _1: undefined }), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode({ _1: null }), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({ _1: 1 }),
    Either.Left(
      Decode.Error.Field(
        '_1',
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )

  t.deepEqual(_0.decode({ _1: 'str' }), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.index(position).of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .index(0)
    .of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {}))
  )

  t.deepEqual(_0.decode([]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([undefined]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting a STRING', undefined)
      )
    )
  )

  t.deepEqual(
    _0.decode([null]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting a STRING', null))
    )
  )

  t.deepEqual(
    _0.decode([1]),
    Either.Left(
      Decode.Error.Index(0, Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(_0.decode(['str']), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.index(position).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .index(0)
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({}),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {}))
  )

  t.deepEqual(_0.decode([]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([undefined]), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode([null]), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([1]),
    Either.Left(
      Decode.Error.Index(
        0,
        Decode.Error.Failure('Expecting an OPTIONAL STRING', 1)
      )
    )
  )

  t.deepEqual(_0.decode(['str']), Either.Right(Maybe.Just('str')))
})

test('Json.Decode.optional.at(path).of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .at(['_0', 1, '_2', 3])
    .of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({
      _0: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: {}
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, undefined]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, null]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, {}]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: undefined
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: null
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: {}
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, undefined]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(
              3,
              Decode.Error.Failure('Expecting a STRING', undefined)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, null]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(
              3,
              Decode.Error.Failure('Expecting a STRING', null)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 3]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(3, Decode.Error.Failure('Expecting a STRING', 3))
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 'final']
        }
      ]
    }),
    Either.Right(Maybe.Just('final'))
  )
})

test('Json.Decode.optional.at(path).optional.of(decoder)', t => {
  const _0 /* Decoder<Maybe<string>> */ = Decode.optional
    .at(['_0', 1, '_2', 3])
    .optional.of(Decode.string)

  t.deepEqual(_0.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_0.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode([]),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL OBJECT', []))
  )

  t.deepEqual(
    _0.decode({
      _0: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(_0.decode({}), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _0.decode({
      _0: undefined
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: null
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: {}
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, undefined]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, null]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [0, []]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Failure('Expecting an OPTIONAL OBJECT', [])
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [0, {}]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: undefined
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: null
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: {}
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Failure('Expecting an OPTIONAL ARRAY', {})
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, undefined]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, null]
        }
      ]
    }),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 3]
        }
      ]
    }),
    Either.Left(
      Decode.Error.Field(
        '_0',
        Decode.Error.Index(
          1,
          Decode.Error.Field(
            '_2',
            Decode.Error.Index(
              3,
              Decode.Error.Failure('Expecting an OPTIONAL STRING', 3)
            )
          )
        )
      )
    )
  )

  t.deepEqual(
    _0.decode({
      _0: [
        0,
        {
          _2: [0, 1, 2, 'final']
        }
      ]
    }),
    Either.Right(Maybe.Just('final'))
  )
})

/**
 * D E C O D E R
 */

test('Json.Decode.Decoder.map(fn)', t => {
  const _0 /* Decoder<{
        positive: boolean;
    }> */ = Decode.int.map(
    x => ({ positive: x > 0 })
  )

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', null))
  )

  t.deepEqual(
    _0.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting an INTEGER', 'str'))
  )

  t.deepEqual(
    Decode.field('foo').of(_0).decode({
      foo: 'str'
    }),
    Either.Left(
      Decode.Error.Field(
        'foo',
        Decode.Error.Failure('Expecting an INTEGER', 'str')
      )
    )
  )

  t.deepEqual(
    _0.decode(10),
    Either.Right({
      positive: true
    })
  )

  const _1 /* Decoder<Maybe<{
        positive: boolean;
    }>> */ = Decode.optional.int.map(
    o => o.map(x => ({ positive: x > 0 }))
  )

  t.deepEqual(_1.decode(undefined), Either.Right(Maybe.Nothing))

  t.deepEqual(_1.decode(null), Either.Right(Maybe.Nothing))

  t.deepEqual(
    _1.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL INTEGER', 'str'))
  )

  t.deepEqual(
    Decode.field('foo').of(_1).decode({
      foo: 'str'
    }),
    Either.Left(
      Decode.Error.Field(
        'foo',
        Decode.Error.Failure('Expecting an OPTIONAL INTEGER', 'str')
      )
    )
  )

  t.deepEqual(
    _1.decode(10),
    Either.Right(
      Maybe.Just({
        positive: true
      })
    )
  )
})

test('Json.Decode.Decoder.chain(fn)', t => {
  const _0 /* Decoder<string> */ = Decode.float.chain(x =>
    x > 0 ? Decode.succeed(x.toFixed(2)) : Decode.fail('msg')
  )

  t.deepEqual(
    _0.decode(undefined),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', undefined))
  )

  t.deepEqual(
    _0.decode(null),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', null))
  )

  t.deepEqual(
    _0.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting a FLOAT', 'str'))
  )

  t.deepEqual(
    Decode.field('foo').of(_0).decode({
      foo: 'str'
    }),
    Either.Left(
      Decode.Error.Field(
        'foo',
        Decode.Error.Failure('Expecting a FLOAT', 'str')
      )
    )
  )

  t.deepEqual(
    _0.decode(-1.234),
    Either.Left(Decode.Error.Failure('msg', -1.234))
  )

  t.deepEqual(_0.decode(1.234), Either.Right('1.23'))

  const _1 /* Decoder<string> */ = Decode.optional.float.chain(o =>
    o
      .map(x => (x > 0 ? Decode.succeed(x.toFixed(2)) : Decode.fail('msg')))
      .getOrElse(Decode.succeed(''))
  )

  t.deepEqual(_1.decode(undefined), Either.Right(''))

  t.deepEqual(_1.decode(null), Either.Right(''))

  t.deepEqual(
    _1.decode('str'),
    Either.Left(Decode.Error.Failure('Expecting an OPTIONAL FLOAT', 'str'))
  )

  t.deepEqual(
    Decode.field('foo').of(_1).decode({
      foo: 'str'
    }),
    Either.Left(
      Decode.Error.Field(
        'foo',
        Decode.Error.Failure('Expecting an OPTIONAL FLOAT', 'str')
      )
    )
  )

  t.deepEqual(
    _1.decode(-1.234),
    Either.Left(Decode.Error.Failure('msg', -1.234))
  )

  t.deepEqual(_1.decode(1.234), Either.Right('1.23'))
})

test('Json.Decode.Decoder.decodeJSON()', t => {
  const decoder = Decode.shape({
    _0: Decode.field('__0__').string,
    _1: Decode.field('__1__').int
  })

  t.deepEqual(
    decoder.decodeJSON('undefined'),
    Either.Left(
      Decode.Error.Failure(
        'This is not valid JSON! Unexpected token u in JSON at position 0',
        'undefined'
      )
    )
  )

  t.deepEqual(
    decoder.decodeJSON('{"__0__":1}'),
    Either.Left(
      Decode.Error.Field('__0__', Decode.Error.Failure('Expecting a STRING', 1))
    )
  )

  t.deepEqual(
    decoder.decodeJSON('{"__0__":"str","__1__":123}'),
    Either.Right({
      _0: 'str',
      _1: 123
    })
  )
})

test('Json.Decode.fromEither(either)', t => {
  const toDecimal = (str: string): Either<string, number> => {
    const int = parseInt(str, 10)

    return isNaN(int) ? Either.Left('error') : Either.Right(int)
  }

  const decoder /* Decoder<number> */ = Decode.string
    .map(toDecimal)
    .chain(Decode.fromEither)

  t.deepEqual(
    decoder.decode('invalid'),
    Either.Left(Decode.Error.Failure('error', 'invalid'))
  )

  t.deepEqual(decoder.decode('1'), Either.Right(1))

  t.deepEqual(
    Decode.optional.of(decoder).decode(undefined),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode(null),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode('invalid'),
    Either.Left(Decode.Error.Failure('error', 'invalid'))
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode('1'),
    Either.Right(Maybe.Just(1))
  )
})

test('Json.Decode.fromMaybe(message, maybe)', t => {
  const toDecimal = (str: string): Maybe<number> => {
    const ing = parseInt(str, 10)

    return isNaN(ing) ? Maybe.Nothing : Maybe.Just(ing)
  }

  const decoder /* Decoder<number> */ = Decode.string.chain(str =>
    Decode.fromMaybe('error', toDecimal(str))
  )

  t.deepEqual(
    decoder.decode('invalid'),
    Either.Left(Decode.Error.Failure('error', 'invalid'))
  )

  t.deepEqual(decoder.decode('1'), Either.Right(1))

  t.deepEqual(
    Decode.optional.of(decoder).decode(undefined),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode(null),
    Either.Right(Maybe.Nothing)
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode('invalid'),
    Either.Left(Decode.Error.Failure('error', 'invalid'))
  )

  t.deepEqual(
    Decode.optional.of(decoder).decode('1'),
    Either.Right(Maybe.Just(1))
  )
})
