const isString = (input: unknown): input is string => {
  return typeof input === 'string'
}

const isBoolean = (input: unknown): input is boolean => {
  return typeof input === 'boolean'
}

const isNumber = (input: unknown): input is number => {
  return typeof input === 'number'
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

//

export type DecodeError =
  | { type: 'RUNTIME_EXCEPTION'; error: Error }
  | { type: 'ONE_OF'; errors: Array<DecodeError> }
  | { type: 'OPTIONAL'; error: DecodeError }
  | { type: 'IN_FIELD'; name: string; error: DecodeError }
  | { type: 'AT_INDEX'; position: number; error: DecodeError }
  | { type: 'REQUIRED_FIELD'; name: string; object: Record<string, unknown> }
  | { type: 'REQUIRED_INDEX'; position: number; array: Array<unknown> }
  | { type: 'FAILURE'; message: string; source: unknown }
  | { type: 'EXPECT_STRING'; source: unknown }
  | { type: 'EXPECT_BOOLEAN'; source: unknown }
  | { type: 'EXPECT_INT'; source: unknown }
  | { type: 'EXPECT_FLOAT'; source: unknown }
  | { type: 'EXPECT_OBJECT'; source: unknown }
  | { type: 'EXPECT_ARRAY'; source: unknown }
  | {
      type: 'ENUMS'
      variants: Array<string | number | boolean | null>
      source: unknown
    }

export type DecodeJsonError =
  | DecodeError
  | { type: 'INVALID_JSON'; error: SyntaxError; json: string }

const InvalidJson = (error: SyntaxError, json: string): DecodeJsonError => ({
  type: 'INVALID_JSON',
  error,
  json
})

const RuntimeException = (error: Error): DecodeError => ({
  type: 'RUNTIME_EXCEPTION',
  error
})

const OneOf = (errors: Array<DecodeError>): DecodeError => ({
  type: 'ONE_OF',
  errors
})

const Optional = (error: DecodeError): DecodeError => ({
  type: 'OPTIONAL',
  error
})

const InField = (name: string, error: DecodeError): DecodeError => ({
  type: 'IN_FIELD',
  name,
  error
})

const AtIndex = (position: number, error: DecodeError): DecodeError => ({
  type: 'AT_INDEX',
  position,
  error
})

const RequiredField = (
  name: string,
  object: Record<string, unknown>
): DecodeError => ({ type: 'REQUIRED_FIELD', name, object })

const RequiredIndex = (
  position: number,
  array: Array<unknown>
): DecodeError => ({ type: 'REQUIRED_INDEX', position, array })

const Failure = (message: string, source: unknown): DecodeError => ({
  type: 'FAILURE',
  message,
  source
})

const Enums = (
  variants: Array<string | number | boolean | null>,
  source: unknown
): DecodeError => ({ type: 'ENUMS', variants, source })

const ExpectString = (source: unknown): DecodeError => ({
  type: 'EXPECT_STRING',
  source
})

const ExpectBoolean = (source: unknown): DecodeError => ({
  type: 'EXPECT_BOOLEAN',
  source
})

const ExpectInt = (source: unknown): DecodeError => ({
  type: 'EXPECT_INT',
  source
})

const ExpectFloat = (source: unknown): DecodeError => ({
  type: 'EXPECT_FLOAT',
  source
})

const ExpectObject = (source: unknown): DecodeError => ({
  type: 'EXPECT_OBJECT',
  source
})

const ExpectArray = (source: unknown): DecodeError => ({
  type: 'EXPECT_ARRAY',
  source
})

export type Result<E, T> =
  | { error: E; value?: never }
  | { error?: never; value: T }

const Left = <E, T>(error: E): Result<E, T> => ({ error })
const Right = <E, T>(value: T): Result<E, T> => ({ value })

//

export interface Decoder<T> {
  map<R>(fn: (value: T) => R): Decoder<R>
  chain<R>(fn: (value: T) => Decoder<R>): Decoder<R>
  decode(input: unknown): Result<DecodeError, T>
  decodeJSON(json: string): Result<DecodeJsonError, T>
}

abstract class DecoderImpl<T> implements Decoder<T> {
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new MapDecoder(fn, this)
  }

  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new ChainDecoder(fn, this)
  }

  public decodeJSON(json: string): Result<DecodeJsonError, T> {
    try {
      return this.decode(JSON.parse(json))
    } catch (jsonError) {
      return Left(InvalidJson(jsonError, json))
    }
  }

  public decode(input: unknown): Result<DecodeError, T> {
    try {
      return this.run(input)
    } catch (unknownError) {
      return Left(RuntimeException(unknownError))
    }
  }

  protected abstract run(input: unknown): Result<DecodeError, T>
}

class MapDecoder<T, R> extends DecoderImpl<R> {
  public constructor(
    private readonly fn: (value: T) => R,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, R> {
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

  protected run(input: unknown): Result<DecodeError, R> {
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

  protected run(input: unknown): Result<DecodeError, T> {
    if (this.check(input)) {
      return Right(input)
    }

    return Left(this.createError(input))
  }
}

class UnknownDecoder extends DecoderImpl<unknown> {
  // eslint-disable-next-line class-methods-use-this
  protected run(input: unknown): Result<DecodeError, unknown> {
    return Right(input)
  }
}

class FailDecoder extends DecoderImpl<never> {
  public constructor(private readonly message: string) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, never> {
    return Left(Failure(this.message, input))
  }
}

class SucceedDecoder<T> extends DecoderImpl<T> {
  public constructor(private readonly value: T) {
    super()
  }

  protected run(): Result<DecodeError, T> {
    return Right(this.value)
  }
}

class NullableDecoder<T> extends DecoderImpl<null | T> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, null | T> {
    if (input == null) {
      return Right(null)
    }

    const result = this.decoder.decode(input)

    if (result.error != null) {
      return Left(Optional(result.error))
    }

    return result
  }
}

class KeyValueDecoder<K, T> extends DecoderImpl<Array<[K, T]>> {
  public constructor(
    private readonly convertKey: (key: string) => Result<string, K>,
    private readonly itemDecoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Array<[K, T]>> {
    if (!isObject(input)) {
      return Left(ExpectObject(input))
    }

    const acc: Array<[K, T]> = []

    for (const key in input) {
      if (hasOwnProperty(key, input)) {
        const keyResult = this.convertKey(key)

        if (keyResult.error != null) {
          return Left(InField(key, Failure(keyResult.error, key)))
        }

        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(InField(key, itemResult.error))
        }

        acc.push([keyResult.value, itemResult.value])
      }
    }

    return Right(acc)
  }
}

class RecordDecoder<T> extends DecoderImpl<Record<string, T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Record<string, T>> {
    if (!isObject(input)) {
      return Left(ExpectObject(input))
    }

    const acc: Record<string, T> = {}

    for (const key in input) {
      if (hasOwnProperty(key, input)) {
        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(InField(key, itemResult.error))
        }

        acc[key] = itemResult.value
      }
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

  protected run(input: unknown): Result<DecodeError, T> {
    const acc = {} as T

    for (const key in this.schema) {
      if (hasOwnProperty(key, this.schema)) {
        const keyResult = this.schema[key].decode(input)

        if (keyResult.error != null) {
          return keyResult
        }

        acc[key] = keyResult.value
      }
    }

    return Right(acc)
  }
}

class ListDecoder<T> extends DecoderImpl<Array<T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Array<T>> {
    if (!isArray(input)) {
      return Left(ExpectArray(input))
    }

    const N = input.length
    const acc: Array<T> = new Array(N)

    for (let i = 0; i < input.length; i++) {
      const itemResult = this.itemDecoder.decode(input[i])

      if (itemResult.error != null) {
        return Left(AtIndex(i, itemResult.error))
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

  protected run(input: unknown): Result<DecodeError, T> {
    const errors: Array<DecodeError> = []

    for (const option of this.options) {
      const optionResult = option.decode(input)

      if (optionResult.error == null) {
        return optionResult
      }

      errors.push(optionResult.error)
    }

    return Left(OneOf(errors))
  }
}

class EnumsDecoder<T> extends DecoderImpl<T> {
  public constructor(
    private readonly variants: Array<[string | number | boolean | null, T]>
  ) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, T> {
    for (const [variant, value] of this.variants) {
      if (variant === input) {
        return Right(value)
      }
    }

    return Left(
      Enums(
        this.variants.map(([variant]) => variant),
        input
      )
    )
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
  ): Result<DecodeError, T> {
    return Left(RequiredField(this.name, input))
  }

  protected run(input: unknown): Result<DecodeError, T> {
    if (!isObject(input)) {
      return Left(ExpectObject(input))
    }

    if (!hasOwnProperty(this.name, input)) {
      return this.fieldNotDefined(input)
    }

    const result = this.decoder.decode(input[this.name])

    if (result.error != null) {
      return Left(InField(this.name, result.error))
    }

    return result
  }
}

class OptionalFieldDecoder<T> extends RequiredFieldDecoder<null | T> {
  // eslint-disable-next-line class-methods-use-this
  protected fieldNotDefined(): Result<DecodeError, null | T> {
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

  protected outOfRange(input: Array<unknown>): Result<DecodeError, T> {
    return Left(RequiredIndex(this.position, input))
  }

  protected run(input: unknown): Result<DecodeError, T> {
    if (!isArray(input)) {
      return Left(ExpectArray(input))
    }

    if (this.position < 0 || this.position >= input.length) {
      return this.outOfRange(input)
    }

    const result = this.decoder.decode(input[this.position])

    if (result.error != null) {
      return Left(AtIndex(this.position, result.error))
    }

    return result
  }
}

class OptionalIndexDecoder<T> extends RequiredIndexDecoder<null | T> {
  // eslint-disable-next-line class-methods-use-this
  protected outOfRange(): Result<DecodeError, null | T> {
    return Right(null)
  }
}

export type Optional = Omit<OptionalPath, 'optional' | 'unknown' | 'shape'>

export interface OptionalPath {
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<null | string>
  boolean: Decoder<null | boolean>
  int: Decoder<null | number>
  float: Decoder<null | number>

  of<T>(decoder: Decoder<T>): Decoder<null | T>
  lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<null | T>

  list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>>
  record<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, T>>
  shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<null | T>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<null | Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<null | Array<[K, T]>>

  oneOf<T>(options: Array<Decoder<T>>): Decoder<null | T>
  enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<null | T>

  field(name: string): OptionalPath
  index(position: number): OptionalPath
}

class OptionalImpl implements Optional {
  public constructor(
    private readonly createDecoder: <T>(
      decoder: Decoder<null | T>
    ) => Decoder<null | T>
  ) {}

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

  public of<T>(decoder: Decoder<T>): Decoder<null | T> {
    return this.createDecoder(new NullableDecoder(decoder))
  }

  public lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<null | T> {
    return this.of(lazy(lazyDecoder))
  }

  public list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>> {
    return this.of(list(itemDecoder))
  }

  public record<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, T>> {
    return this.of(record(itemDecoder))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
  ): Decoder<null | Array<[K | string, T]>> {
    return this.of(keyValueHelp(...args))
  }

  public oneOf<T>(options: Array<Decoder<T>>): Decoder<null | T> {
    return this.of(oneOf(options))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<null | T> {
    return this.of(enums(variants))
  }

  public field(name: string): OptionalPath {
    return new PathImpl(
      <T>(decoder: Decoder<null | T>): Decoder<null | T> => {
        return this.of(new OptionalFieldDecoder(name, decoder))
      }
    )
  }

  public index(position: number): OptionalPath {
    return new PathImpl(
      <T>(decoder: Decoder<null | T>): Decoder<null | T> => {
        return this.of(new OptionalIndexDecoder(position, decoder))
      }
    )
  }
}

export interface RequiredPath {
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<string>
  boolean: Decoder<boolean>
  int: Decoder<number>
  float: Decoder<number>

  of<T>(decoder: Decoder<T>): Decoder<T>
  lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<T>

  list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>>
  record<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>>
  shape<T extends Record<string, unknown>>(
    schema: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<Array<[K, T]>>

  oneOf<T>(options: Array<Decoder<T>>): Decoder<T>
  enums<T>(variants: Array<[string | number | boolean | null, T]>): Decoder<T>

  field(name: string): RequiredPath
  index(position: number): RequiredPath
}

interface CreateDecoder {
  <T>(decoder: Decoder<T>): Decoder<T>
  <T>(decoder: Decoder<null | T>): Decoder<null | T>
}

class PathImpl implements RequiredPath {
  public constructor(protected readonly createDecoder: CreateDecoder) {}

  public get optional(): Optional {
    return new OptionalImpl(this.createDecoder)
  }

  public get unknown(): Decoder<unknown> {
    return this.of(unknown)
  }

  public get string(): Decoder<string> {
    return this.of(string)
  }

  public get boolean(): Decoder<boolean> {
    return this.of(boolean)
  }

  public get int(): Decoder<number> {
    return this.of(int)
  }

  public get float(): Decoder<number> {
    return this.of(float)
  }

  public of<T>(decoder: Decoder<T>): Decoder<T> {
    return this.createDecoder(decoder)
  }

  public lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<T> {
    return this.of(lazy(lazyDecoder))
  }

  public list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
    return this.of(list(itemDecoder))
  }

  public record<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
    return this.of(record(itemDecoder))
  }

  public shape<T extends Record<string, unknown>>(
    schema: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T> {
    return this.of(shape(schema))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
  ): Decoder<Array<[K | string, T]>> {
    return this.of(keyValueHelp(...args))
  }

  public oneOf<T>(options: Array<Decoder<T>>): Decoder<T> {
    return this.of(oneOf(options))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<T> {
    return this.of(enums(variants))
  }

  public field(name: string): RequiredPath {
    return new PathImpl(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.of(new RequiredFieldDecoder(name, decoder))
      }
    )
  }

  public index(position: number): RequiredPath {
    return new PathImpl(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.of(new RequiredIndexDecoder(position, decoder))
      }
    )
  }
}

// E X P O R T

const optional: Optional = new OptionalImpl(decoder => decoder)

const unknown: Decoder<unknown> = new UnknownDecoder()

const string: Decoder<string> = new PrimitiveDecoder(ExpectString, isString)

const boolean: Decoder<boolean> = new PrimitiveDecoder(ExpectBoolean, isBoolean)

const int: Decoder<number> = new PrimitiveDecoder(ExpectInt, isInteger)

const float: Decoder<number> = new PrimitiveDecoder(ExpectFloat, isNumber)

function fail(message: string): Decoder<never> {
  return new FailDecoder(message)
}

function succeed<T>(value: T): Decoder<T> {
  return new SucceedDecoder(value)
}

function record<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
  return new RecordDecoder(itemDecoder)
}

function shape<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Decoder<T[K]> }
): Decoder<T> {
  return new ShapeDecoder(schema)
}

function list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
  return new ListDecoder(itemDecoder)
}

const keyValueHelp = <K, T>(
  ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
): Decoder<Array<[K | string, T]>> => {
  const [convertKey, itemDecoder] = args.length === 1 ? [Right, args[0]] : args

  return new KeyValueDecoder<K | string, T>(convertKey, itemDecoder)
}

function keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
function keyValue<K, T>(
  convertKey: (key: string) => Result<string, K>,
  itemDecoder: Decoder<T>
): Decoder<Array<[K, T]>>
function keyValue<K, T>(
  ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
): Decoder<Array<[K | string, T]>> {
  return keyValueHelp(...args)
}

function oneOf<T>(options: Array<Decoder<T>>): Decoder<T> {
  return new OneOfDecoder(options)
}

function enums<T>(
  variants: Array<[string | number | boolean | null, T]>
): Decoder<T> {
  return new EnumsDecoder(variants)
}

function field(name: string): RequiredPath {
  return new PathImpl(
    <T>(decoder: Decoder<T>): Decoder<T> =>
      new RequiredFieldDecoder(name, decoder)
  )
}

function index(position: number): RequiredPath {
  return new PathImpl(
    <T>(decoder: Decoder<T>): Decoder<T> =>
      new RequiredIndexDecoder(position, decoder)
  )
}

function lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<T> {
  return succeed(null).chain(lazyDecoder)
}

export default {
  optional,

  unknown,
  string,
  boolean,
  int,
  float,

  fail,
  succeed,

  record,
  shape,
  list,
  keyValue,

  oneOf,
  enums,

  field,
  index,

  lazy
}
