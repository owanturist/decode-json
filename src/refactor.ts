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

export type Err =
  | { type: ERROR_ONE_OF; errors: Array<Err> }
  | { type: ERROR_FIELD; name: string; error: Err }
  | { type: ERROR_INDEX; position: number; error: Err }
  | { type: ERROR_FAILURE; message: string; source: unknown }

export type ERROR_ONE_OF = 'ERROR_ONE_OF'
export const ERROR_ONE_OF: ERROR_ONE_OF = 'ERROR_ONE_OF'
export const OneOfErr = (errors: Array<Err>): Err => ({
  type: ERROR_ONE_OF,
  errors
})

export type ERROR_FIELD = 'ERROR_FIELD'
export const ERROR_FIELD: ERROR_FIELD = 'ERROR_FIELD'
export const FieldErr = (name: string, error: Err): Err => ({
  type: ERROR_FIELD,
  name,
  error
})

export type ERROR_INDEX = 'ERROR_INDEX'
export const ERROR_INDEX: ERROR_INDEX = 'ERROR_INDEX'
export const IndexErr = (position: number, error: Err): Err => ({
  type: ERROR_INDEX,
  position,
  error
})

export type ERROR_FAILURE = 'ERROR_FAILURE'
export const ERROR_FAILURE: ERROR_FAILURE = 'ERROR_FAILURE'
export const FailureErr = (message: string, source: unknown): Err => ({
  type: ERROR_FAILURE,
  message,
  source
})

const expecting = (
  optional: boolean,
  type: string,
  source: unknown
): Result<Err, never> => {
  return Left(
    FailureErr(
      optional
        ? `Expecting an OPTIONAL ${type.replace(/^an?\s+/, '')}`
        : `Expecting ${type}`,
      source
    )
  )
}

export abstract class Decoder<T> {
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new Map(fn, this)
  }

  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new Chain(fn, this)
  }

  public decodeJSON(json: string): Result<Err, T> {
    try {
      return this.decode(JSON.parse(json) as unknown)
    } catch (error) {
      const error_ = error as SyntaxError

      return Left(FailureErr(`This is not valid JSON! ${error_.message}`, json))
    }
  }

  public abstract decode(input: unknown): Result<Err, T>
}

class Map<T, R> extends Decoder<R> {
  public constructor(
    private readonly fn: (value: T) => R,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  public decode(input: unknown): Result<Err, R> {
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

  public decode(input: unknown): Result<Err, R> {
    const result = this.decoder.decode(input)

    if (result.error != null) {
      return result
    }

    return this.fn(result.value).decode(input)
  }
}

class Primitive<T> extends Decoder<T> {
  public constructor(
    private readonly type: string,
    private readonly check: (input: unknown) => input is T
  ) {
    super()
  }

  public decode(input: unknown): Result<Err, T> {
    if (this.check(input)) {
      return Right(input)
    }

    return expecting(false, this.type, input)
  }
}

class Fail extends Decoder<never> {
  public constructor(private readonly message: string) {
    super()
  }

  public decode(input: unknown): Result<Err, never> {
    return Left(FailureErr(this.message, input))
  }
}

class Succeed<T> extends Decoder<T> {
  public constructor(private readonly value: T) {
    super()
  }

  public decode(): Result<Err, T> {
    return Right(this.value)
  }
}

class KeyValue<K, T> extends Decoder<Array<[K, T]>> {
  public constructor(
    private readonly convertKey: (key: string) => Result<string, K>,
    private readonly itemDecoder: Decoder<T>
  ) {
    super()
  }

  public decode(input: unknown): Result<Err, Array<[K, T]>> {
    if (!isObject(input)) {
      return expecting(false, 'an OBJECT', input)
    }

    const acc: Array<[K, T]> = []

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const keyResult = this.convertKey(key)

        if (keyResult.error != null) {
          return Left(FieldErr(key, FailureErr(keyResult.error, key)))
        }

        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(FieldErr(key, itemResult.error))
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

  public decode(input: unknown): Result<Err, Record<string, T>> {
    if (!isObject(input)) {
      return expecting(false, 'an OBJECT', input)
    }

    const acc: Record<string, T> = {}

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const itemResult = this.itemDecoder.decode(input[key])

        if (itemResult.error != null) {
          return Left(FieldErr(key, itemResult.error))
        }

        acc[key] = itemResult.value
      }
    }

    return Right(acc)
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

  field(key: string): unknown
  index(position: number): unknown
  at(path: Array<string | number>): unknown

  lazy(createDecoder: () => Decoder<unknown>): Decoder<unknown>
}

interface PathFabric<C extends PathSchema> {
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

export type OptionalPath = PathFabric<{
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<null | string>
  boolean: Decoder<null | boolean>
  int: Decoder<null | number>
  float: Decoder<null | number>

  dict<T>(itemDecoder: Decoder<T>): Decoder<null | Record<string, Decoder<T>>>
  shape<T extends Record<string, Decoder<unknown>>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<null | T>
  list<T>(itemDecoder: Decoder<T>): Decoder<null | Array<T>>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<Array<[K, T]>>

  of<T>(decoder: Decoder<T>): Decoder<null | T>
  oneOf<T>(decoders: Array<Decoder<T>>): Decoder<null | T>
  enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<null | T>

  field(key: string): OptionalPath
  index(position: number): OptionalPath
  at(path: Array<string | number>): OptionalPath

  lazy<T>(createDecoder: () => Decoder<T>): Decoder<null | T>
}>

export type RequiredPath = PathFabric<{
  optional: Optional

  unknown: Decoder<unknown>
  string: Decoder<string>
  boolean: Decoder<boolean>
  int: Decoder<number>
  float: Decoder<number>

  dict<T>(itemDecoder: Decoder<T>): Decoder<Record<string, Decoder<T>>>
  shape<T extends Record<string, Decoder<unknown>>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T>
  list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>>

  keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
  keyValue<K, T>(
    convertKey: (key: string) => Result<string, K>,
    itemDecoder: Decoder<T>
  ): Decoder<Array<[K, T]>>

  of<T>(decoder: Decoder<T>): Decoder<T>
  oneOf<T>(decoders: Array<Decoder<T>>): Decoder<T>
  enums<T>(variants: Array<[string | number | boolean | null, T]>): Decoder<T>

  field(key: string): RequiredPath
  index(position: number): RequiredPath
  at(path: Array<string | number>): RequiredPath

  lazy<T>(createDecoder: () => Decoder<T>): Decoder<T>
}>

// E X P O R T

const optional: Optional = null as never

const unknown: Decoder<unknown> = null as never

const string: Decoder<string> = new Primitive('a STRING', isString)

const boolean: Decoder<boolean> = new Primitive('a BOOLEAN', isBoolean)

const int: Decoder<number> = new Primitive('an INTEGER', isInteger)

const float: Decoder<number> = new Primitive('a FLOAT', isNumber)

function fail(message: string): Decoder<never> {
  return new Fail(message)
}

function succeed<T>(value: T): Decoder<T> {
  return new Succeed(value)
}

function dict<T>(itemDecoder: Decoder<T>): Decoder<Record<string, T>> {
  return new Dict(itemDecoder)
}

function shape<T extends Record<string, Decoder<unknown>>>(
  object: { [K in keyof T]: Decoder<T[K]> }
): Decoder<T> {
  throw new Error(String(object))
}

function list<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
  throw new Error(String(itemDecoder))
}

function keyValue<T>(itemDecoder: Decoder<T>): Decoder<Array<[string, T]>>
function keyValue<K, T>(
  convertKey: (key: string) => Result<string, K>,
  itemDecoder: Decoder<T>
): Decoder<Array<[K, T]>>
function keyValue<K, T>(
  ...args: [Decoder<T>] | [(key: string) => Result<string, K>, Decoder<T>]
): Decoder<Array<[K | string, T]>> {
  const [convertKey, itemDecoder] = args.length === 1 ? [Right, args[0]] : args

  return new KeyValue<K | string, T>(convertKey, itemDecoder)
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

function field(key: string): RequiredPath {
  throw new Error(key)
}

function index(position: number): RequiredPath {
  throw new Error(String(position))
}

function at(path: Array<string | number>): RequiredPath {
  throw new Error(String(path))
}

function lazy<T>(createDecoder: () => Decoder<T>): Decoder<T> {
  throw new Error(String(createDecoder))
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
