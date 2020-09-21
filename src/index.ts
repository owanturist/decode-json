import * as Err from './error'

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

const isObject = (
  input: unknown
): input is Record<string | number | symbol, unknown> => {
  return typeof input === 'object' && input !== null && !isArray(input)
}

//

export type Result<E, T> =
  | { error: E; value?: null }
  | { error?: null; value: T }

export const Left = <E, T>(error: E): Result<E, T> => ({ error })
export const Right = <E, T>(value: T): Result<E, T> => ({ value })

export abstract class Decoder<T> {
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new Map(fn, this)
  }

  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new Chain(fn, this)
  }

  public decodeJSON(json: string): Result<Err.DecodeError, T> {
    try {
      return this.decode(JSON.parse(json))
    } catch (jsonError) {
      return Left(Err.ParseJsonError(jsonError, json))
    }
  }

  public decode(input: unknown): Result<Err.DecodeError, T> {
    try {
      return this.run(input)
    } catch (unknownError) {
      return Left(Err.UnknownError(unknownError))
    }
  }

  protected abstract run(input: unknown): Result<Err.DecodeError, T>
}

class Map<T, R> extends Decoder<R> {
  public constructor(
    private readonly fn: (value: T) => R,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected run(input: unknown): Result<Err.DecodeError, R> {
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

  protected run(input: unknown): Result<Err.DecodeError, R> {
    const result = this.decoder.decode(input)

    if (result.error != null) {
      return result
    }

    return this.fn(result.value).decode(input)
  }
}

class Primitive<T> extends Decoder<T> {
  public constructor(
    private readonly type: Err.JsonValue,
    private readonly check: (input: unknown) => input is T
  ) {
    super()
  }

  protected run(input: unknown): Result<Err.DecodeError, T> {
    if (this.check(input)) {
      return Right(input)
    }

    return Left(Err.JsonValue(this.type, input))
  }
}

class Fail extends Decoder<never> {
  public constructor(private readonly message: string) {
    super()
  }

  protected run(input: unknown): Result<Err.DecodeError, never> {
    return Left(Err.Failure(this.message, input))
  }
}

class Succeed<T> extends Decoder<T> {
  public constructor(private readonly value: T) {
    super()
  }

  protected run(): Result<Err.DecodeError, T> {
    return Right(this.value)
  }
}

class Nullable<T> extends Decoder<null | T> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<Err.DecodeError, null | T> {
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

  protected run(input: unknown): Result<Err.DecodeError, Array<[K, T]>> {
    if (!isObject(input)) {
      return Left(Err.JsonValue('OBJECT', input))
    }

    const acc: Array<[K, T]> = []

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
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

class Dict<T> extends Decoder<Record<string, T>> {
  public constructor(private readonly itemDecoder: Decoder<T>) {
    super()
  }

  protected run(input: unknown): Result<Err.DecodeError, Record<string, T>> {
    if (!isObject(input)) {
      return Left(Err.JsonValue('OBJECT', input))
    }

    const acc: Record<string, T> = {}

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
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

class RequiredField<T> extends Decoder<T> {
  public constructor(
    private readonly name: string,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected fallbackAbsent(
    input: Record<string | number | symbol, unknown>
  ): Result<Err.DecodeError, T> {
    return Left(Err.RequiredField(this.name, input))
  }

  protected run(input: unknown): Result<Err.DecodeError, T> {
    if (!isObject(input)) {
      return Left(Err.JsonValue('OBJECT', input))
    }

    if (!Object.prototype.hasOwnProperty.call(input, this.name)) {
      return this.fallbackAbsent(input)
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
  protected fallbackAbsent(): Result<Err.DecodeError, null | T> {
    return Right(null)
  }
}

interface PathSchema {
  optional: unknown

  unknown: unknown
  string: unknown
  boolean: unknown
  int: unknown
  float: unknown

  dict: unknown
  shape: unknown
  list: unknown
  keyValue: unknown

  of: unknown
  oneOf: unknown
  enums: unknown

  field(name: string): unknown
  index(position: number): unknown
  at(path: Array<string | number>): unknown

  lazy(createDecoder: () => Decoder<unknown>): Decoder<unknown>
}

interface PathInterface<C extends PathSchema> {
  optional: C['optional']

  unknown: C['unknown']
  string: C['string']
  boolean: C['boolean']
  int: C['int']
  float: C['float']

  dict: C['dict']
  shape: C['shape']
  list: C['list']
  keyValue: C['keyValue']

  of: C['of']
  oneOf: C['oneOf']
  enums: C['enums']

  field: C['field']
  index: C['index']
  at: C['at']

  lazy: C['lazy']
}

export type Optional = Omit<OptionalPath, 'optional' | 'unknown' | 'lazy'>

export type OptionalPath = PathInterface<{
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<null | string>
  boolean: Decoder<null | boolean>
  int: Decoder<null | number>
  float: Decoder<null | number>

  of<T>(decoder: Decoder<T>): Decoder<null | T>
  lazy<T>(createDecoder: () => Decoder<T>): Decoder<null | T>

  list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>>
  dict<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, T>>
  shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<null | T>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<null | Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<null | Array<[K, T]>>

  oneOf<T>(decoders: Array<Decoder<T>>): Decoder<null | T>
  enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<null | T>

  field(name: string): OptionalPath
  index(position: number): OptionalPath
  at(path: Array<string | number>): OptionalPath
}>

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

  public list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>> {
    return this.of(list(itemDecoder))
  }

  public dict<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, T>> {
    return this.of(dict(itemDecoder))
  }

  public shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<null | T> {
    return this.of(shape(object))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
  ): Decoder<null | Array<[K | string, T]>> {
    return this.of(keyValueHelp(...args))
  }

  public oneOf<T>(decoders: Array<Decoder<T>>): Decoder<null | T> {
    return this.of(oneOf(decoders))
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
    throw new Error(String(this) + String(position))
  }

  public at(path: Array<string | number>): OptionalPath {
    throw new Error(String(this) + String(path))
  }
}

export type RequiredPath = PathInterface<{
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<string>
  boolean: Decoder<boolean>
  int: Decoder<number>
  float: Decoder<number>

  of<T>(decoder: Decoder<T>): Decoder<T>
  lazy<T>(createDecoder: () => Decoder<T>): Decoder<T>

  list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>>
  dict<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>>
  shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<Array<[K, T]>>

  oneOf<T>(decoders: Array<Decoder<T>>): Decoder<T>
  enums<T>(variants: Array<[string | number | boolean | null, T]>): Decoder<T>

  field(name: string): RequiredPath
  index(position: number): RequiredPath
  at(path: Array<string | number>): RequiredPath
}>

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

  public dict<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
    return this.of(dict(itemDecoder))
  }

  public shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T> {
    return this.of(shape(object))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
  ): Decoder<Array<[K | string, T]>> {
    return this.of(keyValueHelp(...args))
  }

  public oneOf<T>(decoders: Array<Decoder<T>>): Decoder<T> {
    return this.of(oneOf(decoders))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<T> {
    return this.of(enums(variants))
  }

  public field(name: string): RequiredPath {
    return new PathImpl(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.createDecoder(new RequiredField(name, decoder))
      }
    )
  }

  public index(position: number): RequiredPath {
    throw new Error(String(this) + String(position))
  }

  public at(path: Array<string | number>): RequiredPath {
    throw new Error(String(this) + String(path))
  }
}

// E X P O R T

const optional: Optional = new OptionalImpl(decoder => decoder)

const unknown: Decoder<unknown> = null as never

const string: Decoder<string> = new Primitive('STRING', isString)

const boolean: Decoder<boolean> = new Primitive('BOOLEAN', isBoolean)

const int: Decoder<number> = new Primitive('INT', isInteger)

const float: Decoder<number> = new Primitive('FLOAT', isNumber)

function fail(message: string): Decoder<never> {
  return new Fail(message)
}

function succeed<T>(value: T): Decoder<T> {
  return new Succeed(value)
}

function dict<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
  return new Dict(itemDecoder)
}

function shape<T extends Record<string, unknown>>(
  object: { [K in keyof T]: Decoder<T[K]> }
): Decoder<T> {
  throw new Error(String(object))
}

function list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
  throw new Error(String(itemDecoder))
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

function of<T>(decoder: Decoder<T>): Decoder<T> {
  throw new Error(String(decoder))
}

function oneOf<T>(decoders: Array<Decoder<T>>): Decoder<T> {
  throw new Error(String(decoders))
}

function enums<T>(
  variants: Array<[string | number | boolean | null, T]>
): Decoder<T> {
  throw new Error(String(variants))
}

function field(name: string): RequiredPath {
  return new PathImpl(
    <T>(decoder: Decoder<T>): Decoder<T> => new RequiredField(name, decoder)
  )
}

function index(position: number): RequiredPath {
  throw new Error(String(position))
}

function at(path: Array<string | number>): RequiredPath {
  throw new Error(String(path))
}

function lazy<T>(lazyDecoder: () => Decoder<T>): Decoder<T> {
  throw new Error(String(lazyDecoder))
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

  dict,
  shape,
  list,
  keyValue,

  of,
  oneOf,
  enums,

  field,
  index,
  at,

  lazy
}
