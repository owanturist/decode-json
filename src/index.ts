import * as Err from './error'

//

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

export type Result<E, T> =
  | { error: E; value?: never }
  | { error?: never; value: T }

export const Left = <E, T>(error: E): Result<E, T> => ({ error })
export const Right = <E, T>(value: T): Result<E, T> => ({ value })

//

export abstract class Decoder<T> {
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new Map(fn, this)
  }

  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new Chain(fn, this)
  }

  public decodeJSON(json: string): Result<DecodeJsonError, T> {
    try {
      return this.decode(JSON.parse(json))
    } catch (jsonError) {
      return Left(Err.InvalidJson(jsonError, json))
    }
  }

  public decode(input: unknown): Result<DecodeError, T> {
    try {
      return this.run(input)
    } catch (unknownError) {
      return Left(Err.RuntimeException(unknownError))
    }
  }

  protected abstract run(input: unknown): Result<DecodeError, T>
}

class Map<T, R> extends Decoder<R> {
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

class Chain<T, R> extends Decoder<R> {
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

class Primitive<T> extends Decoder<T> {
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

class Unknown extends Decoder<unknown> {
  // eslint-disable-next-line class-methods-use-this
  protected run(input: unknown): Result<DecodeError, unknown> {
    return Right(input)
  }
}

class Fail extends Decoder<never> {
  public constructor(private readonly message: string) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, never> {
    return Left(Err.Failure(this.message, input))
  }
}

class Succeed<T> extends Decoder<T> {
  public constructor(private readonly value: T) {
    super()
  }

  protected run(): Result<DecodeError, T> {
    return Right(this.value)
  }
}

class Nullable<T> extends Decoder<null | T> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, null | T> {
    if (input == null) {
      return Right(null)
    }

    const result = this.decoder.decode(input)

    if (result.error != null) {
      return Left(Err.Optional(result.error))
    }

    return result
  }
}

class KeyValue<K, T> extends Decoder<Array<[K, T]>> {
  public constructor(
    private readonly convertKey: (key: string) => Result<string, K>,
    private readonly itemDecoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Array<[K, T]>> {
    if (!isObject(input)) {
      return Left(Err.ExpectObject(input))
    }

    const acc: Array<[K, T]> = []

    for (const key in input) {
      if (hasOwnProperty(key, input)) {
        const keyResult = this.convertKey(key)

        if (keyResult.error != null) {
          return Left(Err.InField(key, Err.Failure(keyResult.error, key)))
        }

        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(Err.InField(key, itemResult.error))
        }

        acc.push([keyResult.value, itemResult.value])
      }
    }

    return Right(acc)
  }
}

class Rec<T> extends Decoder<Record<string, T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Record<string, T>> {
    if (!isObject(input)) {
      return Left(Err.ExpectObject(input))
    }

    const acc: Record<string, T> = {}

    for (const key in input) {
      if (hasOwnProperty(key, input)) {
        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(Err.InField(key, itemResult.error))
        }

        acc[key] = itemResult.value
      }
    }

    return Right(acc)
  }
}

class Shape<T> extends Decoder<T> {
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

class List<T> extends Decoder<Array<T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<DecodeError, Array<T>> {
    if (!isArray(input)) {
      return Left(Err.ExpectArray(input))
    }

    const N = input.length
    const acc: Array<T> = new Array(N)

    for (let i = 0; i < input.length; i++) {
      const itemResult = this.itemDecoder.decode(input[i])

      if (itemResult.error != null) {
        return Left(Err.AtIndex(i, itemResult.error))
      }

      acc[i] = itemResult.value
    }

    return Right(acc)
  }
}

class OneOf<T> extends Decoder<T> {
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

    return Left(Err.OneOf(errors))
  }
}

class Enums<T> extends Decoder<T> {
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
      Err.Enums(
        this.variants.map(([variant]) => variant),
        input
      )
    )
  }
}

class RequiredField<T> extends Decoder<T> {
  public constructor(
    private readonly name: string,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected fieldNotDefined(
    input: Record<string, unknown>
  ): Result<DecodeError, T> {
    return Left(Err.RequiredField(this.name, input))
  }

  protected run(input: unknown): Result<DecodeError, T> {
    if (!isObject(input)) {
      return Left(Err.ExpectObject(input))
    }

    if (!hasOwnProperty(this.name, input)) {
      return this.fieldNotDefined(input)
    }

    const result = this.decoder.decode(input[this.name])

    if (result.error != null) {
      return Left(Err.InField(this.name, result.error))
    }

    return result
  }
}

class OptionalField<T> extends RequiredField<null | T> {
  // eslint-disable-next-line class-methods-use-this
  protected fieldNotDefined(): Result<DecodeError, null | T> {
    return Right(null)
  }
}

class RequiredIndex<T> extends Decoder<T> {
  public constructor(
    private readonly position: number,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected outOfRange(input: Array<unknown>): Result<DecodeError, T> {
    return Left(Err.RequiredIndex(this.position, input))
  }

  protected run(input: unknown): Result<DecodeError, T> {
    if (!isArray(input)) {
      return Left(Err.ExpectArray(input))
    }

    if (this.position < 0 || this.position >= input.length) {
      return this.outOfRange(input)
    }

    const result = this.decoder.decode(input[this.position])

    if (result.error != null) {
      return Left(Err.AtIndex(this.position, result.error))
    }

    return result
  }
}

class OptionalIndex<T> extends RequiredIndex<null | T> {
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
    return this.createDecoder(new Nullable(decoder))
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
        return this.of(new OptionalField(name, decoder))
      }
    )
  }

  public index(position: number): OptionalPath {
    return new PathImpl(
      <T>(decoder: Decoder<null | T>): Decoder<null | T> => {
        return this.of(new OptionalIndex(position, decoder))
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
        return this.of(new RequiredField(name, decoder))
      }
    )
  }

  public index(position: number): RequiredPath {
    return new PathImpl(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.of(new RequiredIndex(position, decoder))
      }
    )
  }
}

// E X P O R T

const optional: Optional = new OptionalImpl(decoder => decoder)

const unknown: Decoder<unknown> = new Unknown()

const string: Decoder<string> = new Primitive(Err.ExpectString, isString)

const boolean: Decoder<boolean> = new Primitive(Err.ExpectBoolean, isBoolean)

const int: Decoder<number> = new Primitive(Err.ExpectInt, isInteger)

const float: Decoder<number> = new Primitive(Err.ExpectFloat, isNumber)

function fail(message: string): Decoder<never> {
  return new Fail(message)
}

function succeed<T>(value: T): Decoder<T> {
  return new Succeed(value)
}

function record<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
  return new Rec(itemDecoder)
}

function shape<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Decoder<T[K]> }
): Decoder<T> {
  return new Shape(schema)
}

function list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
  return new List(itemDecoder)
}

const keyValueHelp = <K, T>(
  ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
): Decoder<Array<[K | string, T]>> => {
  const [convertKey, itemDecoder] = args.length === 1 ? [Right, args[0]] : args

  return new KeyValue<K | string, T>(convertKey, itemDecoder)
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
  return new OneOf(options)
}

function enums<T>(
  variants: Array<[string | number | boolean | null, T]>
): Decoder<T> {
  return new Enums(variants)
}

function field(name: string): RequiredPath {
  return new PathImpl(
    <T>(decoder: Decoder<T>): Decoder<T> => new RequiredField(name, decoder)
  )
}

function index(position: number): RequiredPath {
  return new PathImpl(
    <T>(decoder: Decoder<T>): Decoder<T> => new RequiredIndex(position, decoder)
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
