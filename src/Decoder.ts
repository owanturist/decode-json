import { isString, isObject, isArray } from '../../Basics'
import Maybe, { Nothing, Just } from '../../Maybe'
import Either, { Left, Right } from '../../Either'
import Encode from '../Encode'
import Encoder from '../Encode/Encoder'
import Error from './Error'
import {
  value,
  string,
  boolean,
  int,
  float,
  shape,
  list,
  keyValue,
  dict,
  oneOf,
  enums,
  lazy,
  Path as IPath,
  OptionalPath as IOptionalPath,
  Optional as IOptional
} from './index'

const expecting = (type: string, source: unknown): Either<Error, never> =>
  Left(Error.Failure(`Expecting ${type}`, source))

export abstract class Decoder<T> {
  protected static decodeAs<T>(
    decoder: Decoder<T>,
    input: unknown,
    required: boolean
  ): Either<Error, T> {
    return decoder.decodeAs(input, required)
  }

  /**
   * Transform the `Decoder` with a given function.
   *
   * @param fn Transforming function.
   *
   * @example
   * Decode.string.map((str: string): number => str.length).decode('1234') // Right(4)
   */
  public map<R>(fn: (value: T) => R): Decoder<R> {
    return new Map(fn, this)
  }

  /**
   * Create decoders that depend on previous results.
   *
   * @param fn Chaining function.
   *
   * @example
   * Decode.string.chain((str: string): Decoder<Date> => {
   *     const date = new Date(str);
   *
   *     return isNaN(date.getTime()) ? Decode.fail('Expecting a DATE') : Decode.succeed(date);
   * }).decode('2010-01-02') // Right(new Date('2010-01-02'))
   */
  public chain<R>(fn: (value: T) => Decoder<R>): Decoder<R> {
    return new Chain(fn, this)
  }

  /**
   * Parse the given string into a JSON and then run the `Decoder` on it.
   * This will fail if the string is not well-formed JSON or if the Decoder fails for some reason.
   *
   * @param json JSON string.
   */
  public decodeJSON(json: string): Either<Error, T> {
    try {
      return this.decode(JSON.parse(json) as unknown)
    } catch (error) {
      const error_ = error as SyntaxError

      return Left(
        Error.Failure(`This is not valid JSON! ${error_.message}`, json)
      )
    }
  }

  /**
   * Run the `Decoder` on unknown JS value.
   *
   * @param input JS value.
   */
  public decode(input: unknown): Either<Error, T> {
    return this.decodeAs(input, true)
  }

  protected abstract decodeAs(
    input: unknown,
    required: boolean
  ): Either<Error, T>
}

export class Path implements IPath {
  public static at<T>(
    path: Array<string | number>,
    decoder: Decoder<T>
  ): Decoder<T> {
    let acc: Decoder<T> = decoder

    for (let index = path.length - 1; index >= 0; index--) {
      const fragment: string | number = path[index]

      acc = isString(fragment)
        ? Field.required(fragment, acc)
        : Index.required(fragment, acc)
    }

    return acc
  }

  public constructor(
    private readonly createDecoder: <T>(decoder: Decoder<T>) => Decoder<T>
  ) {}

  public of<T>(decoder: Decoder<T>): Decoder<T> {
    return this.createDecoder(decoder)
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

  public get value(): Decoder<Encode.Value> {
    return this.of(value)
  }

  public shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<T> {
    return this.of(shape(object))
  }

  public list<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return this.of(list(decoder))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Either<string, K>, Decoder<T>]
  ): Decoder<Array<[string, T]>> | Decoder<Array<[K, T]>> {
    if (args.length === 1) {
      return this.of(keyValue(args[0]))
    }

    return this.of(keyValue(args[0], args[1]))
  }

  public dict<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }> {
    return this.of(dict(decoder))
  }

  public oneOf<T>(decoders: Array<Decoder<T>>): Decoder<T> {
    return this.of(oneOf(decoders))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<T> {
    return this.of(enums(variants))
  }

  public lazy<T>(callDecoder: () => Decoder<T>): Decoder<T> {
    return this.of(lazy(callDecoder))
  }

  public field(name: string): IPath {
    return new Path(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.createDecoder(Field.required(name, decoder))
      }
    )
  }

  public index(position: number): IPath {
    return new Path(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.createDecoder(Index.required(position, decoder))
      }
    )
  }

  public at(path: Array<string | number>): IPath {
    return new Path(
      <T>(decoder: Decoder<T>): Decoder<T> => {
        return this.createDecoder(Path.at(path, decoder))
      }
    )
  }

  public get optional(): IOptional {
    return new Optional(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return this.createDecoder(decoder).map(Just)
      }
    )
  }
}

export class OptionalPath implements IOptionalPath {
  public static at<T>(
    path: Array<string | number>,
    decoder: Decoder<T>
  ): Decoder<Maybe<T>> {
    let acc: Decoder<Maybe<T>> = decoder.map(Just)

    for (let index = path.length - 1; index >= 0; index--) {
      const fragment: string | number = path[index]

      acc = isString(fragment)
        ? Field.optional(fragment, acc).map(Maybe.join)
        : Index.optional(fragment, acc).map(Maybe.join)
    }

    return acc
  }

  public constructor(
    private readonly createDecoder: <T>(
      decoder: Decoder<T>
    ) => Decoder<Maybe<T>>
  ) {}

  public of<T>(decoder: Decoder<T>): Decoder<Maybe<T>> {
    return this.createDecoder(decoder)
  }

  public get string(): Decoder<Maybe<string>> {
    return this.of(string)
  }

  public get boolean(): Decoder<Maybe<boolean>> {
    return this.of(boolean)
  }

  public get int(): Decoder<Maybe<number>> {
    return this.of(int)
  }

  public get float(): Decoder<Maybe<number>> {
    return this.of(float)
  }

  public get value(): Decoder<Maybe<Encode.Value>> {
    return this.of(value)
  }

  public shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<Maybe<T>> {
    return this.of(shape(object))
  }

  public list<T>(decoder: Decoder<T>): Decoder<Maybe<Array<T>>> {
    return this.of(list(decoder))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Either<string, K>, Decoder<T>]
  ): Decoder<Maybe<Array<[string, T]>>> | Decoder<Maybe<Array<[K, T]>>> {
    if (args.length === 1) {
      return this.of(keyValue(args[0]))
    }

    return this.of(keyValue(args[0], args[1]))
  }

  public dict<T>(decoder: Decoder<T>): Decoder<Maybe<{ [key: string]: T }>> {
    return this.of(dict(decoder))
  }

  public oneOf<T>(decoders: Array<Decoder<T>>): Decoder<Maybe<T>> {
    return this.of(oneOf(decoders))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<Maybe<T>> {
    return this.of(enums(variants))
  }

  public lazy<T>(callDecoder: () => Decoder<T>): Decoder<Maybe<T>> {
    return this.of(lazy(callDecoder))
  }

  // eslint-disable-next-line class-methods-use-this
  public field(name: string): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return Field.optional(name, decoder)
      }
    )
  }

  // eslint-disable-next-line class-methods-use-this
  public index(position: number): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return Index.optional(position, decoder)
      }
    )
  }

  // eslint-disable-next-line class-methods-use-this
  public at(path: Array<string | number>): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return OptionalPath.at(path, decoder)
      }
    )
  }

  public get optional(): IOptional {
    return new Optional(this.createDecoder)
  }
}

export class Optional implements IOptional {
  public constructor(
    private readonly createDecoder: <T>(
      decoder: Decoder<T>
    ) => Decoder<Maybe<T>>
  ) {}

  public of<T>(decoder: Decoder<T>): Decoder<Maybe<T>> {
    return this.createDecoder(new Nullable(decoder)).map(Maybe.join)
  }

  public get string(): Decoder<Maybe<string>> {
    return this.of(string)
  }

  public get boolean(): Decoder<Maybe<boolean>> {
    return this.of(boolean)
  }

  public get int(): Decoder<Maybe<number>> {
    return this.of(int)
  }

  public get float(): Decoder<Maybe<number>> {
    return this.of(float)
  }

  public shape<T extends Record<string, unknown>>(
    object: { [K in keyof T]: Decoder<T[K]> }
  ): Decoder<Maybe<T>> {
    return this.of(shape(object))
  }

  public list<T>(decoder: Decoder<T>): Decoder<Maybe<Array<T>>> {
    return this.of(list(decoder))
  }

  public keyValue<K, T>(
    ...args: [Decoder<T>] | [(key: string) => Either<string, K>, Decoder<T>]
  ): Decoder<Maybe<Array<[string, T]>>> | Decoder<Maybe<Array<[K, T]>>> {
    if (args.length === 1) {
      return this.of(keyValue(args[0]))
    }

    return this.of(keyValue(args[0], args[1]))
  }

  public dict<T>(decoder: Decoder<T>): Decoder<Maybe<{ [key: string]: T }>> {
    return this.of(dict(decoder))
  }

  public oneOf<T>(decoders: Array<Decoder<T>>): Decoder<Maybe<T>> {
    return this.of(oneOf(decoders))
  }

  public enums<T>(
    variants: Array<[string | number | boolean | null, T]>
  ): Decoder<Maybe<T>> {
    return this.of(enums(variants))
  }

  public field(name: string): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return this.createDecoder(Field.optional(name, decoder)).map(Maybe.join)
      }
    )
  }

  public index(position: number): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return this.createDecoder(Index.optional(position, decoder)).map(
          Maybe.join
        )
      }
    )
  }

  public at(path: Array<string | number>): IOptionalPath {
    return new OptionalPath(
      <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => {
        return this.createDecoder(OptionalPath.at(path, decoder)).map(
          Maybe.join
        )
      }
    )
  }
}

class Map<T, R> extends Decoder<R> {
  public constructor(
    private readonly fn: (value: T) => R,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, R> {
    return Decoder.decodeAs(this.decoder, input, required).map(this.fn)
  }
}

class Chain<T, R> extends Decoder<R> {
  public constructor(
    private readonly fn: (value: T) => Decoder<R>,
    protected readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, R> {
    return Decoder.decodeAs(this.decoder, input, required).chain(
      (val: T): Either<Error, R> => {
        return this.fn(val).decode(input)
      }
    )
  }
}

export class Primitive<T> extends Decoder<T> {
  public constructor(
    private readonly prefix: string,
    private readonly type: string,
    private readonly check: (input: unknown) => input is T
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, T> {
    return this.check(input)
      ? Right(input)
      : expecting(
          `${required ? this.prefix : 'an OPTIONAL'} ${this.type}`,
          input
        )
  }
}

export class Fail extends Decoder<never> {
  public constructor(private readonly message: string) {
    super()
  }

  protected decodeAs(input: unknown): Either<Error, never> {
    return Left(Error.Failure(this.message, input))
  }
}

export class Succeed<T> extends Decoder<T> {
  public constructor(private readonly val: T) {
    super()
  }

  protected decodeAs(): Either<Error, T> {
    return Right(this.val)
  }
}

export class Shape<T> extends Decoder<T> {
  public constructor(
    private readonly object: { [K in keyof T]: Decoder<T[K]> }
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, T> {
    let acc: Either<Error, T> = Right({} as T)

    for (const key in this.object) {
      if (Object.prototype.hasOwnProperty.call(this.object, key)) {
        acc = acc.chain(
          (obj: T): Either<Error, T> => {
            return Decoder.decodeAs(this.object[key], input, required).map(
              (val: T[Extract<keyof T, string>]): T => {
                obj[key] = val

                return obj
              }
            )
          }
        )
      }
    }

    return acc
  }
}

export class OneOf<T> extends Decoder<T> {
  public constructor(private readonly decoders: Array<Decoder<T>>) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, T> {
    let result: Either<Array<Error>, T> = Left([])

    for (const decoder of this.decoders) {
      result = result.fold((acc: Array<Error>): Either<Array<Error>, T> => {
        return Decoder.decodeAs(decoder, input, required).mapLeft(
          (error: Error): Array<Error> => {
            acc.push(error)

            return acc
          }
        )
      }, Right)
    }

    return result.mapLeft(Error.OneOf)
  }
}

export class Enums<T> extends Decoder<T> {
  public constructor(
    private readonly variants: Array<[string | number | boolean | null, T]>
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, T> {
    const errors: Array<Error> = []

    for (const [expected, val] of this.variants) {
      if (expected === input) {
        return Right(val)
      }

      const exp = typeof expected === 'string' ? `"${expected}"` : expected

      errors.push(
        Error.Failure(
          `Expecting${required ? ' ' : ' an OPTIONAL '}\`${String(exp)}\``,
          input
        )
      )
    }

    return Left(Error.OneOf(errors))
  }
}

export class List<T> extends Decoder<Array<T>> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected decodeAs(
    input: unknown,
    required: boolean
  ): Either<Error, Array<T>> {
    if (!isArray(input)) {
      return expecting(`an${required ? ' ' : ' OPTIONAL '}ARRAY`, input)
    }

    let result: Either<Error, Array<T>> = Right([])

    for (let index = 0; index < input.length; index++) {
      result = result.chain(
        (acc: Array<T>): Either<Error, Array<T>> => {
          return this.decoder.decode(input[index]).mapBoth(
            (error: Error): Error => Error.Index(index, error),
            (val: T): Array<T> => {
              acc.push(val)

              return acc
            }
          )
        }
      )
    }

    return result
  }
}

export class KeyValue<K, T> extends Decoder<Array<[K, T]>> {
  public constructor(
    private readonly convertKey: (key: string) => Either<string, K>,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected decodeAs(
    input: unknown,
    required: boolean
  ): Either<Error, Array<[K, T]>> {
    if (!isObject(input)) {
      return expecting(`an${required ? ' ' : ' OPTIONAL '}OBJECT`, input)
    }

    let result: Either<Error, Array<[K, T]>> = Right([])

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result = result.chain(
          (acc: Array<[K, T]>): Either<Error, Array<[K, T]>> => {
            return Either.shape({
              key: this.convertKey(key).mapLeft(
                (message: string): Error => Error.Failure(message, key)
              ),
              value: this.decoder.decode(input[key])
            }).mapBoth(
              (error: Error): Error => Error.Field(key, error),
              (pair: { key: K; value: T }): Array<[K, T]> => {
                acc.push([pair.key, pair.value])

                return acc
              }
            )
          }
        )
      }
    }

    return result
  }
}

class Nullable<T> extends Decoder<Maybe<T>> {
  public constructor(private readonly decoder: Decoder<T>) {
    super()
  }

  protected decodeAs(input: unknown): Either<Error, Maybe<T>> {
    return input == null
      ? Right(Nothing)
      : Decoder.decodeAs(this.decoder, input, false).map(Just)
  }
}

export abstract class Field<T, R> extends Decoder<R> {
  public static required<T>(name: string, decoder: Decoder<T>): Decoder<T> {
    return new RequiredField(name, decoder)
  }

  public static optional<T>(
    name: string,
    decoder: Decoder<T>
  ): Decoder<Maybe<T>> {
    return new OptionalField(name, decoder)
  }

  protected static readonly TYPE = 'OBJECT'

  protected constructor(
    private readonly name: string,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, R> {
    if (input == null) {
      return this.decodeNullable(input, required)
    }

    if (!isObject(input)) {
      return this.decodeNotObject(input, required)
    }

    if (!(this.name in input)) {
      return this.decodeMissedField(this.name, input, required)
    }

    return this.decoder.decode(input[this.name]).mapBoth(
      (error: Error): Error => Error.Field(this.name, error),
      (val: T): R => this.mapSuccess(val)
    )
  }

  protected abstract decodeNullable(
    input: unknown,
    required: boolean
  ): Either<Error, R>

  protected abstract decodeNotObject(
    input: unknown,
    required: boolean
  ): Either<Error, R>

  protected abstract decodeMissedField(
    name: string,
    input: Record<string, unknown>,
    required: boolean
  ): Either<Error, R>

  protected abstract mapSuccess(value: T): R
}

class RequiredField<T> extends Field<T, T> {
  public constructor(name: string, decoder: Decoder<T>) {
    super(name, decoder)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNullable(
    input: unknown,
    required: boolean
  ): Either<Error, T> {
    return expecting(`an${required ? ' ' : ' OPTIONAL '}${Field.TYPE}`, input)
  }

  protected decodeNotObject(
    input: unknown,
    required: boolean
  ): Either<Error, T> {
    return this.decodeNullable(input, required)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeMissedField(
    name: string,
    input: Record<string, unknown>,
    required: boolean
  ): Either<Error, T> {
    return expecting(
      `an${required ? ' ' : ' OPTIONAL '}${
        Field.TYPE
      } with a FIELD named '${name}'`,
      input
    )
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapSuccess(val: T): T {
    return val
  }
}

class OptionalField<T> extends Field<T, Maybe<T>> {
  public constructor(name: string, decoder: Decoder<T>) {
    super(name, decoder)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNullable(): Either<Error, Maybe<T>> {
    return Right(Nothing)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNotObject(input: unknown): Either<Error, Maybe<T>> {
    return expecting(`an OPTIONAL ${Field.TYPE}`, input)
  }

  protected decodeMissedField(): Either<Error, Maybe<T>> {
    return this.decodeNullable()
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapSuccess(val: T): Maybe<T> {
    return Just(val)
  }
}

export abstract class Index<T, R> extends Decoder<R> {
  public static required<T>(position: number, decoder: Decoder<T>): Decoder<T> {
    return new RequiredIndex(position, decoder)
  }

  public static optional<T>(
    position: number,
    decoder: Decoder<T>
  ): Decoder<Maybe<T>> {
    return new OptionalIndex(position, decoder)
  }

  protected static readonly TYPE = 'ARRAY'

  protected constructor(
    private readonly position: number,
    private readonly decoder: Decoder<T>
  ) {
    super()
  }

  protected decodeAs(input: unknown, required: boolean): Either<Error, R> {
    if (input == null) {
      return this.decodeNullable(input, required)
    }

    if (!isArray(input)) {
      return this.decodeNotArray(input, required)
    }

    const position =
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      this.position < 0 ? input.length + this.position : this.position

    if (position < 0 || position >= input.length) {
      return this.decodeMissedIndex(position, input, required)
    }

    return this.decoder.decode(input[position]).mapBoth(
      (error: Error): Error => Error.Index(this.position, error),
      (val: T): R => this.mapSuccess(val)
    )
  }

  protected abstract decodeNullable(
    input: unknown,
    required: boolean
  ): Either<Error, R>

  protected abstract decodeNotArray(
    input: unknown,
    required: boolean
  ): Either<Error, R>

  protected abstract decodeMissedIndex(
    position: number,
    input: Array<unknown>,
    required: boolean
  ): Either<Error, R>

  protected abstract mapSuccess(value: T): R
}

class RequiredIndex<T> extends Index<T, T> {
  public constructor(position: number, decoder: Decoder<T>) {
    super(position, decoder)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNullable(
    input: unknown,
    required: boolean
  ): Either<Error, T> {
    return expecting(`an${required ? ' ' : ' OPTIONAL '}${Index.TYPE}`, input)
  }

  protected decodeNotArray(
    input: unknown,
    required: boolean
  ): Either<Error, T> {
    return this.decodeNullable(input, required)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeMissedIndex(
    position: number,
    input: Array<unknown>,
    required: boolean
  ): Either<Error, T> {
    return expecting(
      `an${required ? ' ' : ' OPTIONAL '}ARRAY` +
        ` with an ELEMENT at [${position}] but only see ${input.length} entries`,
      input
    )
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapSuccess(val: T): T {
    return val
  }
}

class OptionalIndex<T> extends Index<T, Maybe<T>> {
  public constructor(position: number, decoder: Decoder<T>) {
    super(position, decoder)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNullable(): Either<Error, Maybe<T>> {
    return Right(Nothing)
  }

  // eslint-disable-next-line class-methods-use-this
  protected decodeNotArray(input: unknown): Either<Error, Maybe<T>> {
    return expecting(`an OPTIONAL ${Index.TYPE}`, input)
  }

  protected decodeMissedIndex(): Either<Error, Maybe<T>> {
    return this.decodeNullable()
  }

  // eslint-disable-next-line class-methods-use-this
  protected mapSuccess(val: T): Maybe<T> {
    return Just(val)
  }
}

export class Value extends Decoder<Encode.Value> {
  // eslint-disable-next-line class-methods-use-this
  protected decodeAs(input: unknown): Either<Error, Encode.Value> {
    return Right(new Encoder(input))
  }
}
