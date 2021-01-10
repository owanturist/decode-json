const isString = (input: unknown): input is string => {
  return typeof input === 'string'
}

const isBoolean = (input: unknown): input is boolean => {
  return typeof input === 'boolean'
}

const isNumber = (input: unknown): input is number => {
  return typeof input === 'number' && !isNaN(input) && isFinite(input)
}

const isInteger = (input: unknown): input is number => {
  return isNumber(input) && /^(\+|-)?\d+$/.test(input.toString())
}

const isArray = (input: unknown): input is Array<unknown> => {
  return input instanceof Array
}

const isObject = (input: unknown): input is Record<string, unknown> => {
  return typeof input === 'object' && input !== null && !isArray(input)
}

const hasOwnProperty = (
  prop: string,
  obj: Record<string, unknown>
): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

// E R R O R

export type DecodeError =
  | { type: 'RUNTIME_EXCEPTION'; error: Error }
  | { type: 'ONE_OF'; errors: Array<DecodeError> }
  | { type: 'OPTIONAL'; error: DecodeError }
  | { type: 'IN_FIELD'; name: string; error: DecodeError }
  | { type: 'AT_INDEX'; position: number; error: DecodeError }
  | { type: 'REQUIRED_FIELD'; name: string; source: Record<string, unknown> }
  | { type: 'REQUIRED_INDEX'; position: number; source: Array<unknown> }
  | { type: 'FAILURE'; message: string; source: unknown }
  | { type: 'EXPECT_STRING'; source: unknown }
  | { type: 'EXPECT_BOOLEAN'; source: unknown }
  | { type: 'EXPECT_INT'; source: unknown }
  | { type: 'EXPECT_FLOAT'; source: unknown }
  | { type: 'EXPECT_OBJECT'; source: unknown }
  | { type: 'EXPECT_ARRAY'; source: unknown }
  | {
      type: 'EXPECT_EXACT'
      value: string | number | boolean | null
      source: unknown
    }

export type DecodeJsonError =
  | DecodeError
  | { type: 'INVALID_JSON'; error: SyntaxError; source: string }

const InvalidJsonError = (
  error: SyntaxError,
  json: string
): DecodeJsonError => ({
  type: 'INVALID_JSON',
  error,
  source: json
})

const RuntimeExceptionError = (error: Error): DecodeError => ({
  type: 'RUNTIME_EXCEPTION',
  error
})

const OneOfError = (errors: Array<DecodeError>): DecodeError => ({
  type: 'ONE_OF',
  errors
})

const OptionalError = (error: DecodeError): DecodeError => ({
  type: 'OPTIONAL',
  error
})

const InFieldError = (name: string, error: DecodeError): DecodeError => ({
  type: 'IN_FIELD',
  name,
  error
})

const AtIndexError = (position: number, error: DecodeError): DecodeError => ({
  type: 'AT_INDEX',
  position,
  error
})

const RequiredFieldError = (
  name: string,
  source: Record<string, unknown>
): DecodeError => ({ type: 'REQUIRED_FIELD', name, source })

const RequiredIndexError = (
  position: number,
  source: Array<unknown>
): DecodeError => ({ type: 'REQUIRED_INDEX', position, source })

const FailureError = (message: string, source: unknown): DecodeError => ({
  type: 'FAILURE',
  message,
  source
})

const ExpectExactError = (
  value: string | number | boolean | null,
  source: unknown
): DecodeError => ({ type: 'EXPECT_EXACT', value, source })

const ExpectStringError = (source: unknown): DecodeError => ({
  type: 'EXPECT_STRING',
  source
})

const ExpectBooleanError = (source: unknown): DecodeError => ({
  type: 'EXPECT_BOOLEAN',
  source
})

const ExpectIntError = (source: unknown): DecodeError => ({
  type: 'EXPECT_INT',
  source
})

const ExpectFloatError = (source: unknown): DecodeError => ({
  type: 'EXPECT_FLOAT',
  source
})

const ExpectObjectError = (source: unknown): DecodeError => ({
  type: 'EXPECT_OBJECT',
  source
})

const ExpectArrayError = (source: unknown): DecodeError => ({
  type: 'EXPECT_ARRAY',
  source
})

// R E S U L T

export type DecodeResult<E, T> =
  | { error: E; value?: never }
  | { error?: never; value: T }

const Left = <E, T>(error: E): DecodeResult<E, T> => ({ error })
const Right = <E, T>(value: T): DecodeResult<E, T> => ({ value })

// D E C O D E R
export interface Decoder<T> {
  map<R>(fn: (value: T) => R): Decoder<R>
  chain<R>(fn: (value: T) => Decoder<R>): Decoder<R>
  decode(input: unknown): DecodeResult<DecodeError, T>
  decodeJSON(json: string): DecodeResult<DecodeJsonError, T>
}

abstract class DecoderImpl<T> implements Decoder<T> {
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new MapDecoder(fn, this)
  }

  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new ChainDecoder(fn, this)
  }

  public decodeJSON(json: string): DecodeResult<DecodeJsonError, T> {
    try {
      return this.decode(JSON.parse(json))
    } catch (jsonError) {
      return Left(InvalidJsonError(jsonError, json))
    }
  }

  public decode(input: unknown): DecodeResult<DecodeError, T> {
    try {
      return this.run(input)
    } catch (unknownError) {
      return Left(RuntimeExceptionError(unknownError))
    }
  }

  protected abstract run(input: unknown): DecodeResult<DecodeError, T>
}

class MapDecoder<T, R> extends DecoderImpl<R> {
  public constructor(
    private readonly fn: (value: T) => R,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, R> {
    const result = this.decoder.decode(input)

    if (result.error != null) {
      return result
    }

    return Right(this.fn(result.value))
  }
}

class ChainDecoder<T, R> extends DecoderImpl<R> {
  public constructor(
    private readonly fn: (value: T) => Decoder<R>,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, R> {
    const result = this.decoder.decode(input)

    if (result.error != null) {
      return result
    }

    return this.fn(result.value).decode(input)
  }
}

class PrimitiveDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly createError: (source: unknown) => DecodeError,
    private readonly check: (input: unknown) => input is T
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    if (this.check(input)) {
      return Right(input)
    }

    return Left(this.createError(input))
  }
}

class UnknownDecoder extends DecoderImpl<unknown> {
  // eslint-disable-next-line class-methods-use-this
  protected run(input: unknown): DecodeResult<DecodeError, unknown> {
    return Right(input)
  }
}

class ExactDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly expect: string | number | boolean | null,
    private readonly value: T
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    if (input === this.expect) {
      return Right(this.value)
    }

    return Left(ExpectExactError(this.expect, input))
  }
}

class FailDecoder extends DecoderImpl<never> {
  public constructor(private readonly message: string) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, never> {
    return Left(FailureError(this.message, input))
  }
}

class SucceedDecoder<T> extends DecoderImpl<T> {
  public constructor(private readonly value: T) {
    super()
  }

  protected run(): DecodeResult<DecodeError, T> {
    return Right(this.value)
  }
}

class NullableDecoder<T> extends DecoderImpl<null | T> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, null | T> {
    if (input == null) {
      return Right(null)
    }

    const result = this.decoder.decode(input)

    if (result.error != null) {
      return Left(OptionalError(result.error))
    }

    return result
  }
}

class KeyValueDecoder<K, T> extends DecoderImpl<Array<[K, T]>> {
  public constructor(
    private readonly convertKey: (key: string) => DecodeResult<string, K>,
    private readonly itemDecoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, Array<[K, T]>> {
    if (!isObject(input)) {
      return Left(ExpectObjectError(input))
    }

    const acc: Array<[K, T]> = []

    for (const key of Object.keys(input)) {
      const keyResult = this.convertKey(key)

      if (keyResult.error != null) {
        return Left(FailureError(keyResult.error, key))
      }

      const itemResult = this.itemDecoder.decode(input[key])

      if (itemResult.error != null) {
        return Left(InFieldError(key, itemResult.error))
      }

      acc.push([keyResult.value, itemResult.value])
    }

    return Right(acc)
  }
}

class RecordDecoder<T> extends DecoderImpl<Record<string, T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, Record<string, T>> {
    if (!isObject(input)) {
      return Left(ExpectObjectError(input))
    }

    const acc: Record<string, T> = {}

    for (const key of Object.keys(input)) {
      const itemResult = this.itemDecoder.decode(input[key])

      if (itemResult.error != null) {
        return Left(InFieldError(key, itemResult.error))
      }

      acc[key] = itemResult.value
    }

    return Right(acc)
  }
}

class ShapeDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly schema: { [K in keyof T]: Decoder<T[K]> }
  ) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    const acc = {} as T

    for (const key of Object.keys(this.schema)) {
      const keyResult = this.schema[key as keyof T].decode(input)

      if (keyResult.error != null) {
        return keyResult
      }

      acc[key as keyof T] = keyResult.value
    }

    return Right(acc)
  }
}

class ListDecoder<T> extends DecoderImpl<Array<T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, Array<T>> {
    if (!isArray(input)) {
      return Left(ExpectArrayError(input))
    }

    const N = input.length
    const acc: Array<T> = new Array(N)

    for (let i = 0; i < input.length; i++) {
      const itemResult = this.itemDecoder.decode(input[i])

      if (itemResult.error != null) {
        return Left(AtIndexError(i, itemResult.error))
      }

      acc[i] = itemResult.value
    }

    return Right(acc)
  }
}

class OneOfDecoder<T> extends DecoderImpl<T> {
  public constructor(private readonly options: Array<Decoder<T>>) {
    super()
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    const errors: Array<DecodeError> = []

    for (const option of this.options) {
      const optionResult = option.decode(input)

      if (optionResult.error == null) {
        return optionResult
      }

      errors.push(optionResult.error)
    }

    return Left(OneOfError(errors))
  }
}

class RequiredFieldDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly name: string,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected fieldNotDefined(
    input: Record<string, unknown>
  ): DecodeResult<DecodeError, T> {
    return Left(RequiredFieldError(this.name, input))
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    if (!isObject(input)) {
      return Left(ExpectObjectError(input))
    }

    if (!hasOwnProperty(this.name, input)) {
      return this.fieldNotDefined(input)
    }

    const result = this.decoder.decode(input[this.name])

    if (result.error != null) {
      return Left(InFieldError(this.name, result.error))
    }

    return result
  }
}

class OptionalFieldDecoder<T> extends RequiredFieldDecoder<null | T> {
  // eslint-disable-next-line class-methods-use-this
  protected fieldNotDefined(): DecodeResult<DecodeError, null | T> {
    return Right(null)
  }
}

class RequiredIndexDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly position: number,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected outOfRange(input: Array<unknown>): DecodeResult<DecodeError, T> {
    return Left(RequiredIndexError(this.position, input))
  }

  protected run(input: unknown): DecodeResult<DecodeError, T> {
    if (!isArray(input)) {
      return Left(ExpectArrayError(input))
    }

    if (this.position < 0 || this.position >= input.length) {
      return this.outOfRange(input)
    }

    const result = this.decoder.decode(input[this.position])

    if (result.error != null) {
      return Left(AtIndexError(this.position, result.error))
    }

    return result
  }
}

class OptionalIndexDecoder<T> extends RequiredIndexDecoder<null | T> {
  // eslint-disable-next-line class-methods-use-this
  protected outOfRange(): DecodeResult<DecodeError, null | T> {
    return Right(null)
  }
}

export interface DecodeOptional {
  string: Decoder<null | string>
  boolean: Decoder<null | boolean>
  int: Decoder<null | number>
  float: Decoder<null | number>

  list: MakeList<false>
  record: MakeRecord<false>
  keyValue: MakeKeyValue<false>

  field: MakeField<false>
  index: MakeIndex<false>
}

class Optional implements DecodeOptional {
  public constructor(
    private readonly createDecoder: <T>(
      decoder: Decoder<null | T>
    ) => Decoder<null | T>
  ) {}

  private of<T>(decoder: Decoder<T>): Decoder<null | T> {
    return this.createDecoder(new NullableDecoder(decoder))
  }

  public get string(): Decoder<null | string> {
    return this.of(string)
  }

  public get boolean(): Decoder<null | boolean> {
    return this.of(boolean)
  }

  public get int(): Decoder<null | number> {
    return this.of(int)
  }

  public get float(): Decoder<null | number> {
    return this.of(float)
  }

  public list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>> {
    return this.of(list(itemDecoder))
  }

  public record<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, T>> {
    return this.of(record(itemDecoder))
  }

  public keyValue<K, T>(
    ...args:
      | [Decoder<T>]
      | [(key: string) => DecodeResult<string, K>, Decoder<T>]
  ): Decoder<null | Array<[K | string, T]>> {
    return this.of(keyValueHelp(args))
  }

  public field(name: string): OptionalDecodePath {
    return pathHelp<false>(decoder => {
      return this.of(new OptionalFieldDecoder(name, decoder))
    })
  }

  public index(position: number): OptionalDecodePath {
    return pathHelp<false>(decoder => {
      return this.of(new OptionalIndexDecoder(position, decoder))
    })
  }
}

interface DecodePath<X extends boolean> {
  optional: DecodeOptional

  unknown: Decoder<unknown>
  string: Decoder<X extends true ? string : null | string>
  boolean: Decoder<X extends true ? boolean : null | boolean>
  int: Decoder<X extends true ? number : null | number>
  float: Decoder<X extends true ? number : null | number>

  list: MakeList<X>
  record: MakeRecord<X>
  keyValue: MakeKeyValue<X>

  tuple: MakeTuple<X>
  shape: MakeShape<X>

  exact: MakeExact<X>
  oneOf: MakeOneOf<X>

  lazy: MakeLazy<X>

  field: MakeField<X>
  index: MakeIndex<X>

  of<T>(decoder: Decoder<T>): Decoder<X extends true ? T : null | T>
}

export type RequiredDecodePath = DecodePath<true>

export type OptionalDecodePath = DecodePath<false>

class PathDecoder<X extends boolean> implements DecodePath<X> {
  public constructor(
    protected readonly createDecoder: <T>(
      decoder: Decoder<T>
    ) => Decoder<X extends true ? T : null | T>
  ) {}

  public of<T>(decoder: Decoder<T>): Decoder<X extends true ? T : null | T> {
    return this.createDecoder(decoder)
  }

  public get optional(): DecodeOptional {
    return new Optional(this.createDecoder)
  }

  public get unknown(): Decoder<unknown> {
    return this.of(unknown)
  }

  public get string(): Decoder<X extends true ? string : null | string> {
    return this.of(string)
  }

  public get boolean(): Decoder<X extends true ? boolean : null | boolean> {
    return this.of(boolean)
  }

  public get int(): Decoder<X extends true ? number : null | number> {
    return this.of(int)
  }

  public get float(): Decoder<X extends true ? number : null | number> {
    return this.of(float)
  }

  public exact<T>(
    ...args:
      | [string | number | boolean | null]
      | [string | number | boolean | null, T]
  ): Decoder<string | number | boolean | null | T> {
    return this.of(exactHelp(args))
  }

  public lazy<T>(
    lazyDecoder: () => Decoder<T>
  ): Decoder<X extends true ? T : null | T> {
    return this.of(lazy(lazyDecoder))
  }

  public list<T>(
    itemDecoder: Decoder<T>
  ): Decoder<X extends true ? Array<T> : null | Array<T>> {
    return this.of(list(itemDecoder))
  }

  public tuple<T extends Array<unknown>>(
    ...schema: [Array<Decoder<unknown>>] | Array<Decoder<unknown>>
  ): Decoder<X extends true ? T : null | T> {
    return this.of(tupleHelp(schema))
  }

  public record<T>(
    itemDecoder: Decoder<T>
  ): Decoder<X extends true ? Record<string, T> : null | Record<string, T>> {
    return this.of(record(itemDecoder))
  }

  public shape<T extends Record<string, unknown>>(
    schema: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<X extends true ? T : null | T> {
    return this.of(shape(schema))
  }

  public keyValue<K, T>(
    ...args:
      | [Decoder<T>]
      | [(key: string) => DecodeResult<string, K>, Decoder<T>]
  ): Decoder<
    X extends true ? Array<[K | string, T]> : null | Array<[K | string, T]>
  > {
    return this.of(keyValueHelp(args))
  }

  public oneOf<T>(
    ...args: [Array<Decoder<T>>] | Array<Decoder<T>>
  ): Decoder<X extends true ? T : null | T> {
    return this.of(oneOfHelp(args))
  }

  public field(
    name: string
  ): X extends true ? RequiredDecodePath : OptionalDecodePath {
    return pathHelp(decoder => {
      return this.of(new RequiredFieldDecoder(name, decoder))
    })
  }

  public index(
    position: number
  ): X extends true ? RequiredDecodePath : OptionalDecodePath {
    return pathHelp(decoder => {
      return this.of(new RequiredIndexDecoder(position, decoder))
    })
  }
}

// -------------------------
// -- P U B L I C   A P I --
// -------------------------

const optional: DecodeOptional = new Optional(decoder => decoder)

const unknown: Decoder<unknown> = new UnknownDecoder()

const string: Decoder<string> = new PrimitiveDecoder(
  ExpectStringError,
  isString
)

const boolean: Decoder<boolean> = new PrimitiveDecoder(
  ExpectBooleanError,
  isBoolean
)

const int: Decoder<number> = new PrimitiveDecoder(ExpectIntError, isInteger)

const float: Decoder<number> = new PrimitiveDecoder(ExpectFloatError, isNumber)

function fail<T = never>(message: string): Decoder<T> {
  return new FailDecoder(message)
}

function succeed<T>(value: T): Decoder<T> {
  return new SucceedDecoder(value)
}

// E X A C T

interface MakeExact<X extends boolean> {
  <T extends string | number | boolean | null>(value: T): Decoder<
    X extends true ? T : null | T
  >
  <T>(expect: string | number | boolean | null, value: T): Decoder<
    X extends true ? T : null | T
  >
}

const exactHelp = <T>(
  args:
    | [string | number | boolean | null]
    | [string | number | boolean | null, T]
): Decoder<string | number | boolean | null | T> => {
  if (args.length === 1) {
    return new ExactDecoder(args[0], args[0])
  }

  return new ExactDecoder(args[0], args[1])
}

const exact: MakeExact<true> = <T>(
  ...args:
    | [string | number | boolean | null]
    | [string | number | boolean | null, T]
) => exactHelp(args)

// R E C O R D

type MakeRecord<X extends boolean> = <T>(
  itemDecoder: Decoder<T>
) => Decoder<X extends true ? Record<string, T> : null | Record<string, T>>

const record: MakeRecord<true> = itemDecoder => new RecordDecoder(itemDecoder)

// S H A P E

type MakeShape<X extends boolean> = <T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Decoder<T[K]> }
) => Decoder<X extends true ? T : null | T>

const shape: MakeShape<true> = schema => new ShapeDecoder(schema)

// T U P L E

type TupleSchema<X extends boolean, T extends Array<unknown>> = T extends [
  infer A,
  ...infer R
]
  ? [Decoder<X extends true ? A : null | A>, ...TupleSchema<X, R>]
  : []

interface MakeTuple<X extends boolean> {
  <T1, T2>(schema: [Decoder<T1>, Decoder<T2>]): Decoder<
    X extends true ? [T1, T2] : null | [T1, T2]
  >
  <T1, T2>(_1: Decoder<T1>, _2: Decoder<T2>): Decoder<
    X extends true ? [T1, T2] : null | [T1, T2]
  >

  <T1, T2, T3>(schema: [Decoder<T1>, Decoder<T2>, Decoder<T3>]): Decoder<
    X extends true ? [T1, T2, T3] : null | [T1, T2, T3]
  >
  <T1, T2, T3>(_1: Decoder<T1>, _2: Decoder<T2>, _3: Decoder<T3>): Decoder<
    X extends true ? [T1, T2, T3] : null | [T1, T2, T3]
  >

  <T1, T2, T3, T4>(
    schema: [Decoder<T1>, Decoder<T2>, Decoder<T3>, Decoder<T4>]
  ): Decoder<X extends true ? [T1, T2, T3, T4] : null | [T1, T2, T3, T4]>
  <T1, T2, T3, T4>(
    _1: Decoder<T1>,
    _2: Decoder<T2>,
    _3: Decoder<T3>,
    _4: Decoder<T4>
  ): Decoder<X extends true ? [T1, T2, T3, T4] : null | [T1, T2, T3, T4]>

  <T1, T2, T3, T4, T5>(
    schema: [Decoder<T1>, Decoder<T2>, Decoder<T3>, Decoder<T4>, Decoder<T5>]
  ): Decoder<
    X extends true ? [T1, T2, T3, T4, T5] : null | [T1, T2, T3, T4, T5]
  >
  <T1, T2, T3, T4, T5>(
    _1: Decoder<T1>,
    _2: Decoder<T2>,
    _3: Decoder<T3>,
    _4: Decoder<T4>,
    _5: Decoder<T5>
  ): Decoder<
    X extends true ? [T1, T2, T3, T4, T5] : null | [T1, T2, T3, T4, T5]
  >

  <T1, T2, T3, T4, T5, T6>(
    schema: [
      Decoder<T1>,
      Decoder<T2>,
      Decoder<T3>,
      Decoder<T4>,
      Decoder<T5>,
      Decoder<T6>
    ]
  ): Decoder<
    X extends true ? [T1, T2, T3, T4, T5, T6] : null | [T1, T2, T3, T4, T5, T6]
  >
  <T1, T2, T3, T4, T5, T6>(
    _1: Decoder<T1>,
    _2: Decoder<T2>,
    _3: Decoder<T3>,
    _4: Decoder<T4>,
    _5: Decoder<T5>,
    _6: Decoder<T6>
  ): Decoder<
    X extends true ? [T1, T2, T3, T4, T5, T6] : null | [T1, T2, T3, T4, T5, T6]
  >

  <T extends Array<unknown>>(schema: TupleSchema<X, T>): Decoder<
    X extends true ? T : null | T
  >
  <T extends Array<unknown>>(...schema: TupleSchema<X, T>): Decoder<
    X extends true ? T : null | T
  >
}

const tupleHelp = <T extends Array<unknown>>(
  schema: [Array<Decoder<unknown>>] | Array<Decoder<unknown>>
): Decoder<T> => {
  const decoders =
    schema.length === 1 && isArray(schema[0])
      ? schema[0]
      : (schema as Array<Decoder<unknown>>)

  const obj: Record<number, Decoder<unknown>> = {}
  const N = decoders.length

  for (let i = 0; i < N; i++) {
    obj[i] = decoders[i]
  }

  return shape(obj).map(rec => {
    const arr = new Array(N) as T

    for (let i = 0; i < N; i++) {
      arr[i] = rec[i]
    }

    return arr
  })
}

const tuple: MakeTuple<true> = <T extends Array<unknown>>(
  ...schema: [Array<Decoder<unknown>>] | Array<Decoder<unknown>>
): Decoder<T> => tupleHelp(schema)

// L I S T

type MakeList<X extends boolean> = <T>(
  itemDecoder: Decoder<T>
) => Decoder<X extends true ? Array<T> : null | Array<T>>

const list: MakeList<true> = itemDecoder => new ListDecoder(itemDecoder)

// K E Y   V A L U E

interface MakeKeyValue<X extends boolean> {
  <T>(itemDecoder: Decoder<T>): Decoder<
    X extends true ? Array<[string, T]> : null | Array<[string, T]>
  >
  <K, T>(
    convertKey: (key: string) => DecodeResult<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<X extends true ? Array<[K, T]> : null | Array<[K, T]>>
}

const keyValueHelp = <K, T>(
  args: [Decoder<T>] | [(key: string) => DecodeResult<string, K>, Decoder<T>]
): Decoder<Array<[K | string, T]>> => {
  const [convertKey, itemDecoder] = args.length === 1 ? [Right, args[0]] : args

  return new KeyValueDecoder<K | string, T>(convertKey, itemDecoder)
}

const keyValue: MakeKeyValue<true> = <K, T>(
  ...args: [Decoder<T>] | [(key: string) => DecodeResult<string, K>, Decoder<T>]
) => {
  return keyValueHelp(args)
}

// O N E   O F

interface MakeOneOf<X extends boolean> {
  <T>(options: Array<Decoder<T>>): Decoder<X extends true ? T : null | T>
  <T>(
    first: Decoder<T>,
    second: Decoder<T>,
    ...options: Array<Decoder<T>>
  ): Decoder<X extends true ? T : null | T>
}

const oneOfHelp = <T>(
  args: [Array<Decoder<T>>] | Array<Decoder<T>>
): Decoder<T> => {
  if (args.length === 1 && isArray(args[0])) {
    return new OneOfDecoder(args[0])
  }

  return new OneOfDecoder(args as Array<Decoder<T>>)
}

const oneOf: MakeOneOf<true> = <T>(
  ...args: [Array<Decoder<T>>] | Array<Decoder<T>>
) => oneOfHelp(args)

// L A Z Y

type MakeLazy<X extends boolean> = <T>(
  lazyDecoder: () => Decoder<T>
) => Decoder<X extends true ? T : null | T>

const lazy: MakeLazy<true> = lazyDecoder => succeed(null).chain(lazyDecoder)

// F I E L D   A N D   I N D E X

const pathHelp = <X extends boolean>(
  createDecoder: <T>(
    decoder: Decoder<T>
  ) => Decoder<X extends true ? T : null | T>
): X extends true ? RequiredDecodePath : OptionalDecodePath => {
  const pathDecoder = new PathDecoder(
    <T>(decoder: Decoder<T>): Decoder<X extends true ? T : null | T> => {
      return createDecoder(decoder)
    }
  )

  return (pathDecoder as unknown) as X extends true
    ? RequiredDecodePath
    : OptionalDecodePath
}

type MakeField<X extends boolean> = (
  fieldName: string
) => X extends true ? RequiredDecodePath : OptionalDecodePath

const field: MakeField<true> = name => {
  return pathHelp<true>(decoder => new RequiredFieldDecoder(name, decoder))
}

type MakeIndex<X extends boolean> = (
  elementPosition: number
) => X extends true ? RequiredDecodePath : OptionalDecodePath

const index: MakeIndex<true> = position => {
  return pathHelp<true>(decoder => new RequiredIndexDecoder(position, decoder))
}

const Decode = {
  optional,
  field,
  index,

  unknown,
  string,
  boolean,
  int,
  float,
  exact,

  record,
  list,
  keyValue,

  shape,
  tuple,

  oneOf,
  lazy,

  fail,
  succeed
}

export default Decode
