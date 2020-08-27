import { isString, isInt, isFloat, isBoolean } from '../../Basics'
import Maybe, { Just } from '../../Maybe'
import Either, { Right } from '../../Either'
import Encode from '../Encode'

import _Error from './Error'
import * as _ from './Decoder'

type RequiredKeyValue = {
  /**
   * @param decoder Decoder of the object element.
   */
  <T>(decoder: _.Decoder<T>): _.Decoder<Array<[string, T]>>

  /**
   * @param convertKey Converts field name from string to `K`.
   * @param decoder Decoder of the object element.
   */
  <K, T>(
    convertKey: (key: string) => Either<string, K>,
    decoder: _.Decoder<T>
  ): _.Decoder<Array<[K, T]>>
}

type OptionalKeyValue = {
  /**
   * @param decoder Decoder of the object element.
   */
  <T>(decoder: _.Decoder<T>): _.Decoder<Maybe<Array<[string, T]>>>

  /**
   * @param convertKey Converts field name from string to `K`.
   * @param decoder Decoder of the object element.
   */
  <K, T>(
    convertKey: (key: string) => Either<string, K>,
    decoder: _.Decoder<T>
  ): _.Decoder<Maybe<Array<[K, T]>>>
}

type RequiredDict = <T>(
  decoder: _.Decoder<T>
) => _.Decoder<{ [key: string]: T }>

type OptionalDict = <T>(
  decoder: _.Decoder<T>
) => _.Decoder<Maybe<{ [key: string]: T }>>

type RequiredList = <T>(decoder: _.Decoder<T>) => _.Decoder<Array<T>>

type OptionaldList = <T>(decoder: _.Decoder<T>) => _.Decoder<Maybe<Array<T>>>

type RequiredShape = <T extends Record<string, unknown>>(
  object: { [K in keyof T]: _.Decoder<T[K]> }
) => _.Decoder<T>

type OptionalShape = <T extends Record<string, unknown>>(
  object: { [K in keyof T]: _.Decoder<T[K]> }
) => _.Decoder<Maybe<T>>

type RequiredOf = <T>(decoder: _.Decoder<T>) => _.Decoder<T>

type OptionalOf = <T>(decoder: _.Decoder<T>) => _.Decoder<Maybe<T>>

type RequiredOneOf = <T>(decoders: Array<_.Decoder<T>>) => _.Decoder<T>

type OptionalOneOf = <T>(decoders: Array<_.Decoder<T>>) => _.Decoder<Maybe<T>>

type RequiredEnums = <T>(
  variants: Array<[string | number | boolean | null, T]>
) => _.Decoder<T>

type OptionalEnums = <T>(
  variants: Array<[string | number | boolean | null, T]>
) => _.Decoder<Maybe<T>>

type RequiredLazy = <T>(callDecoder: () => _.Decoder<T>) => _.Decoder<T>

type OptionalLazy = <T>(callDecoder: () => _.Decoder<T>) => _.Decoder<Maybe<T>>

type Common = {
  string: unknown
  boolean: unknown
  int: unknown
  float: unknown

  keyValue: unknown
  shape: unknown
  list: unknown
  dict: unknown

  of: unknown
  oneOf: unknown
  enums: unknown

  field(key: string): unknown
  index(position: number): unknown
  at(path: Array<string | number>): unknown
}

type WithOptional = {
  optional: Decode.Optional

  value: unknown
  lazy: unknown
} & Common

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Decode {
  export type Error = _Error

  export const Error = _Error

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Error {
    export type Pattern<R> = _Error.Pattern<R>
  }

  export type Value = Encode.Value

  /**
   * A Containers that knows how to decode JSON and unknown JS values.
   */
  export abstract class Decoder<T> extends _.Decoder<T> {}

  export type Optional = {
    /**
     * Decode a JSON into an optional `string`.
     *
     * @example
     * optional.string.decodeJSON('null')              // Right(Nothing)
     * optional.string.decodeJSON('true')              // Left(...)
     * optional.string.decodeJSON('42')                // Left(...)
     * optional.string.decodeJSON('3.14')              // Left(...)
     * optional.string.decodeJSON('"hello"')           // Right(Just('hello'))
     * optional.string.decodeJSON('{ "hello": 42 }')   // Left(..)
     */
    string: _.Decoder<Maybe<string>>

    /**
     * Decode a JSON into an optional `boolean`.
     *
     * @example
     * optional.boolean.decodeJSON('null')             // Right(Nothing)
     * optional.boolean.decodeJSON('true')             // Right(Just(true))
     * optional.boolean.decodeJSON('42')               // Left(..)
     * optional.boolean.decodeJSON('3.14')             // Left(..)
     * optional.boolean.decodeJSON('"hello"')          // Left(..)
     * optional.boolean.decodeJSON('{ "hello": 42 }')  // Left(..)
     */
    boolean: _.Decoder<Maybe<boolean>>

    /**
     * Decode a JSON into an optional `int` (`number` in fact).
     *
     * @example
     * optional.int.decodeJSON('null')              // Right(Nothing)
     * optional.int.decodeJSON('true')              // Left(..)
     * optional.int.decodeJSON('42')                // Right(Just(42))
     * optional.int.decodeJSON('3.14')              // Left(..)
     * optional.int.decodeJSON('"hello"')           // Left(..)
     * optional.int.decodeJSON('{ "hello": 42 }')   // Left(..)
     */
    int: _.Decoder<Maybe<number>>

    /**
     * Decode a JSON into an optional `float` (`number` in fact).
     *
     * @example
     * optional.float.decodeJSON('null')             // Right(Nothing)
     * optional.float.decodeJSON('true')             // Left(..)
     * optional.float.decodeJSON('42')               // Right(Just(42))
     * optional.float.decodeJSON('3.14')             // Right(Just(3.41))
     * optional.float.decodeJSON('"hello"')          // Left(..)
     * optional.float.decodeJSON('{ "hello": 42 }')  // Left(..)
     */
    float: _.Decoder<Maybe<number>>

    /**
     * Take an object of `Decoder`s and return a `Decoder` with an optional object of values.
     * Decoding fails if at least one of the fields fails.
     *
     * @example
     * const decoder = optional.shape({
     *     x: field('_x_').float,
     *     y: field('_y_').float,
     * })
     *
     * decoder.decodeJSON('null')
     * // Right(Nothing)
     *
     * decoder.decodeJSON('{ "_x_": 12.34, "_y_": 56.78 }')
     * // Right(Just({ x: 12.34, y: 56.78 }))
     */
    shape: OptionalShape

    /**
     * Decode a JSON into an optional `Array`.
     *
     * @example
     * optional.list(int).decodeJSON('null')
     * // Right(Nothing)
     * optional.list(boolean).decodeJSON('[ true, false ]')
     * // Right(Just([ true, false ]))
     */
    list: OptionaldList

    /**
     * Decode a JSON into an optional `Array` of pairs.
     *
     * @example
     * optional.keyValue(number).decodeJSON('null')
     * // Right(Nothing)
     * optional.keyValue(number).decodeJSON('{ "key_1": 2, "key_2": 1 }')
     * // Right(Just([[ 'key_1', 2 ], [ 'key_2', 1 ]]))
     */
    keyValue: OptionalKeyValue

    /**
     * Decode a JSON into an optional object.
     *
     * @example
     * optional.dict(number).decodeJSON('null')
     * // Right(Nothing)
     * optional.dict(number).decodeJSON('{ "key_1": 2, "key_2": 1 }')
     * // Right(Just({ key_1: 2, key_2: 1 }))
     */
    dict: OptionalDict

    /**
     * Nest a decoder.
     *
     * @example
     * optional.of(string) === optional.string
     */
    of: OptionalOf

    /**
     * Try a bunch of different decoders.
     * This can be useful if the JSON value may come in a couple different formats.
     * For example, say you want to read an array of int, but some of them are strings.
     *
     * @example
     * list(
     *     optional.oneOf([
     *         int,
     *         string.chain(str => fromMaybe('Expecting an INTEGER', Basics.toInt(str)))
     *     ])
     * ).decodeJSON('[ null, 1, "2", 3, "4" ]')
     * // Right([ Nothing, Just(1), Just(2), Just(3), Just(4) ])
     */
    oneOf: OptionalOneOf

    /**
     * Creates optional enum decoder based on variants.
     *
     * @example
     * const currencyDecoder = optional.enums([
     *     [ 'USD', new USD(0) ],
     *     [ 'EUR', new EUR(0) ],
     *     [ 'RUB', new RUB(0) ],
     * ])
     *
     * currencyDecoder.decodeJSON('null')  // Right(Nothing)
     * currencyDecoder.decodeJSON('"RUB"') // Right(Just(new RUB(0)))
     */
    enums: OptionalEnums

    /**
     * Decode a JSON object, requiring a particular optional field.
     *
     * @param name Name of the field.
     *
     * @example
     * optional.field('name').string.decodeJSON('null')               // Right(Nothing)
     * optional.field('name').string.decodeJSON('{}')                 // Right(Nothing)
     * optional.field('name').string.decodeJSON('{ "name": null }')   // Left(..)
     * optional.field('name').string.decodeJSON('{ "name": 1 }')      // Left(..)
     * optional.field('name').string.decodeJSON('{ "name": "tom" }')  // Right(Just('tom'))
     */
    field(name: string): OptionalPath

    /**
     * Decode a JSON array, requiring a particular optional index.
     *
     * @param position Exact index of the decoding value.
     *
     * @example
     * const json = '[ "alise", null, "chuck" ]';
     *
     * optional.index(0).string.decodeJSON(json)   // Right(Just('alise'))
     * optional.index(1).string.decodeJSON(json)   // Left(..)
     * optional.index(2).string.decodeJSON(json)   // Right(Just('chuck'))
     * optional.index(-1).string.decodeJSON(json)  // Right(Just('chuck'))
     * optional.index(3).string.decodeJSON(json)   // Right(Nothing)
     */
    index(position: number): OptionalPath

    /**
     * Decode a nested JSON object, requiring certain optional fields and indexes.
     *
     * @param path
     *
     * @example
     * const json = '{ "person": { "name": "tom", "age": 42, "accounts": [ "tom_42" ] } }';
     *
     * optional.at([ 'count' ]).int.decodeJSON(json)                     // Right(Nothing)
     * optional.at([ 'person', 'height' ]).float.decodeJSON(json)        // Right(Nothing)
     * optional.at([ 'person', 'name' ]).string.decodeJSON(json)         // Right(Just('tom'))
     * optional.at([ 'person', 'age' ]).int.decodeJSON(json)             // Right(Just(42))
     * optional.at([ 'person', 'accounts', 0 ]).string.decodeJSON(json)  // Right(Just('tom_42"'))
     * optional.at([ 'person', 'accounts', 1 ]).string.decodeJSON(json)  // Right(Nothing)
     *
     * // This is really just a shorthand for saying things like:
     *
     * optional.field('count').int
     * optional.field('person').optional.field('height').float
     * optional.field('person').optional.field('name').string
     * optional.field('person').optional.field('age').int
     * optional.field('person').optional.field('accounts').optional.index(0).string
     * optional.field('person').optional.field('accounts').optional.index(1).string
     */
    at(path: Array<string | number>): OptionalPath
  } & Common

  export type Path = {
    /**
     * Lets create an optional `Decoder`.
     *
     * @example
     * field('name').optional.string.decodeJSON('{ "name": null }')   // Right(Nothing)
     * field('name').optional.string.decodeJSON('{ "name": "tom" }')  // Right(Just('tom'))
     *
     * index(0).optional.string.decodeJSON('[]')          // Right(Nothing)
     * index(0).optional.string.decodeJSON('[ "cats" ]')  // Right(Just('cats'))
     */
    optional: Optional

    /**
     * Decode a JSON into a `string`.
     *
     * @example
     * field('name').string.decodeJSON('{ "name": 1 }')      // Left(..)
     * field('name').string.decodeJSON('{ "name": "tom" }')  // Right('tom')
     *
     * index(0).string.decodeJSON('[]')          // Left(..)
     * index(0).string.decodeJSON('[ "cats" ]')  // Right('cats')
     */
    string: _.Decoder<string>

    /**
     * Decode a JSON into a `boolean`.
     *
     * @example
     * field('disabled').boolean.decodeJSON('{ "disabled": 1 }')     // Left(..)
     * field('disabled').boolean.decodeJSON('{ "disabled": true }')  // Right(true)
     *
     * index(0).boolean.decodeJSON('[]')         // Left(..)
     * index(0).boolean.decodeJSON('[ false ]')  // Right(false)
     */
    boolean: _.Decoder<boolean>

    /**
     * Decode a JSON into a `int` (`number` in fact).
     *
     * @example
     * field('age').int.decodeJSON('{ "age": true }')  // Left(..)
     * field('age').int.decodeJSON('{ "age": 42 }')    // Right(42)
     *
     * index(0).int.decodeJSON('[]')      // Left(..)
     * index(0).int.decodeJSON('[ 18 ]')  // Right(18)
     */
    int: _.Decoder<number>

    /**
     * Decode a JSON into a `float` (`number` in fact).
     *
     * @example
     * field('weight').float.decodeJSON('{ "weight": true }')    // Left(..)
     * field('weight').float.decodeJSON('{ "weight": 123.45 }')  // Right(123.45)
     *
     * index(0).float.decodeJSON('[]')        // Left(..)
     * index(0).float.decodeJSON('[ 18.1 ]')  // Right(18.1)
     */
    float: _.Decoder<number>

    /**
     * Do not do anything with a JSON value, just bring it into an `Encode.Value`.
     * This can be useful if you have particularly complex data that you would like to deal with later.
     * Or if you are going to send it out somewhere and do not care about its structure.
     */
    value: _.Decoder<Encode.Value>

    /**
     * Take an object of `Decoder`s and return a `Decoder` with a object of values.
     * Decoding fails if at least one of the fields fails.
     *
     * @example
     * field('center').shape({
     *     x: field('_x_').float,
     *     y: field('_y_').float,
     * }).decodeJSON('{ "center": { "_x_": 12.34, "_y_": 56.78 }}')
     * // Right({ x: 12.34, y: 56.78 })
     *
     * index(0).shape({
     *     x: field('_x_').float,
     *     y: field('_y_').float,
     * }).decodeJSON('[{ "_x_": 12.34, "_y_": 56.78 }]')
     * // Right({ x: 12.34, y: 56.78 })
     */
    shape: RequiredShape

    /**
     * Decode a JSON into an `Array`.
     *
     * @example
     * field('sequence').list(int).decodeJSON('{ "sequence": [ 1, 2, 3 ]}')
     * // Right([ 1, 2, 3 ])
     *
     * index(0).list(boolean).decodeJSON('[[ true, false ]]')
     * // Right([ true, false ])
     */
    list: RequiredList

    /**
     * Decode a JSON into an `Array` of pairs.
     *
     * @example
     * field('keys').keyValue(number).decodeJSON('{ "keys": { "key_1": 2, "key_2": 1 }}')
     * // Right([[ 'key_1', 2 ], [ 'key_2', 1 ]])
     *
     * index(0).keyValue(intFromString, boolean).decodeJSON('[{ "1": true, "2": false }]')
     * // Right([[ 1, true ], [ 2, false ]])
     */
    keyValue: RequiredKeyValue

    /**
     * Decode a JSON into an object.
     *
     * @example
     * field('keys').dict(number).decodeJSON('{ "keys": { "key_1": 2, "key_2": 1 }}')
     * // Right({ key_1: 2, key_2: 1 })
     *
     * index(0).dict(number).decodeJSON('[{ "key_1": 2, "key_2": 1 }]')
     * // Right({ key_1: 2, key_2: 1 })
     */
    dict: RequiredDict

    /**
     * Nest a decoder.
     *
     * @example
     * field('name').of(string) === field('name').string
     * index(0).of(int) === index(0).int
     */
    of: RequiredOf

    /**
     * Try a bunch of different decoders.
     * This can be useful if the JSON value may come in a couple different formats.
     * For example, say you want to read an array of int, but some of them are strings.
     *
     * @example
     * list(
     *     field('count').oneOf([
     *         int,
     *         string.chain(str => fromMaybe('Expecting an INTEGER', Basics.toInt(str)))
     *     ])
     * ).decodeJSON('[{ "count": 0 }, { "count": "1" }, { "count": "2" }, { "count": 3 }]')
     * // Right([ 0, 1, 2, 3 ])
     */
    oneOf: RequiredOneOf

    /**
     * Creates enum decoder based on variants.
     *
     * @example
     * field('currency').enums([
     *     [ 'USD', new USD(0) ],
     *     [ 'EUR', new EUR(0) ],
     *     [ 'RUB', new RUB(0) ],
     * ]).decodeJSON('{ "currency": "RUB" }')
     * // Right(new RUB(0))
     */
    enums: RequiredEnums

    /**
     * Sometimes you have a JSON with recursive structure,like nested comments.
     * You can use `lazy` to make sure your decoder unrolls lazily.
     *
     * @example
     * interface Comment {
     *     message: string;
     *     comments: Array<Comment>;
     * }
     *
     * const commentDecoder: Decoder<Comment> = shape({
     *     message: field('message').string,
     *     comments: field('message').lazy(() => list(commentDecoder))
     * });
     */
    lazy: RequiredLazy

    /**
     * Decode a JSON object, requiring a particular field.
     *
     * @param name Name of the field.
     *
     * @example
     * field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": 3 }}')          // Right(3)
     * field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": 3, "y": 4 }}')  // Right(3)
     * field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": true }}')       // Left(..)
     * field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": null }}')       // Left(..)
     * field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "y": 4 }}')          // Left(..)
     */
    field(name: string): Path

    /**
     * Decode a JSON array, requiring a particular index.
     *
     * @param position Exact index of the decoding value.
     *
     * @example
     * const json = '[{ "children": [ "alise", "bob", "chuck" ]}]';
     *
     * at(0, 'children').index(0).string.decodeJSON(json)   // Right('alise')
     * at(0, 'children').index(1).string.decodeJSON(json)   // Right('bob')
     * at(0, 'children').index(2).string.decodeJSON(json)   // Right('chuck')
     * at(0, 'children').index(-1).string.decodeJSON(json)  // Right('chuck')
     * at(0, 'children').index(3).string.decodeJSON(json)   // Left(..)
     */
    index(position: number): Path

    /**
     * Decode a nested JSON object, requiring certain fields and indexes.
     *
     * @param path Sequence of field names and index positions.
     *
     * @example
     * const json = '[{ "person": { "name": "tom", "age": 42, "accounts": [ "tom_42" ]}}]';
     *
     * index(0).at([ 'person', 'name' ]).string.decodeJSON(json)         // Right('tom')
     * index(0).at([ 'person', 'age' ]).int.decodeJSON(json)             // Right(42)
     * index(0).at([ 'person', 'accounts', 0 ]).string.decodeJSON(json)  // Right('tom_42"')
     *
     * // This is really just a shorthand for saying things like:
     *
     * index(0).field('person').field('name').string
     * index(0).field('person').field('age').int
     * index(0).field('person').field('accounts').index(0).string
     */
    at(path: Array<string | number>): Path
  } & WithOptional

  export type OptionalPath = {
    /**
     * Lets create nested optional `Decoder`.
     *
     * @example
     * optional.field('name').optional.string.decodeJSON('null')               // Right(Nothing)
     * optional.field('name').optional.string.decodeJSON('{}')                 // Right(Nothing)
     * optional.field('name').optional.string.decodeJSON('{ "name": null }')   // Right(Nothing)
     * optional.field('name').optional.string.decodeJSON('{ "name": 1 }')      // Left(..)
     * optional.field('name').optional.string.decodeJSON('{ "name": "tom" }')  // Right(Just('tom'))
     *
     * optional.index(0).optional.string.decodeJSON('null')        // Right(Nothing)
     * optional.index(0).optional.string.decodeJSON('[]')          // Right(Nothing)
     * optional.index(0).optional.string.decodeJSON('[ null ]')    // Right(Nothing)
     * optional.index(0).optional.string.decodeJSON('[ 1 ]')       // Left(..)
     * optional.index(0).optional.string.decodeJSON('[ "cats" ]')  // Right(Just('cats'))
     */
    optional: Optional

    /**
     * Decode a JSON into a `string`.
     *
     * @example
     * optional.field('name').string.decodeJSON('{}')                 // Right(Nothing)
     * optional.field('name').string.decodeJSON('{ name: null }')     // Left(..)
     * optional.field('name').string.decodeJSON('{ "name": 1 }')      // Left(..)
     * optional.field('name').string.decodeJSON('{ "name": "tom" }')  // Right(Just('tom'))
     *
     * optional.index(0).string.decodeJSON('[]')          // Right(Nothing)
     * optional.index(0).string.decodeJSON('[ null ]')    // Left(..)
     * optional.index(0).string.decodeJSON('[ "cats" ]')  // Right(Just('cats'))
     */
    string: _.Decoder<Maybe<string>>

    /**
     * Decode a JSON into a `boolean`.
     *
     * @example
     * optional.field('disabled').boolean.decodeJSON('{}')                    // Right(Nothing)
     * optional.field('disabled').boolean.decodeJSON('{ "disabled": null }')  // Left(..)
     * optional.field('disabled').boolean.decodeJSON('{ "disabled": 1 }')     // Left(..)
     * optional.field('disabled').boolean.decodeJSON('{ "disabled": true }')  // Right(Just(true))
     *
     * optional.index(0).boolean.decodeJSON('[]')         // Right(Nothing)
     * optional.index(0).boolean.decodeJSON('[ null ]')   // Left(..)
     * optional.index(0).boolean.decodeJSON('[ false ]')  // Right(Just(false))
     */
    boolean: _.Decoder<Maybe<boolean>>

    /**
     * Decode a JSON into a `int` (`number` in fact).
     *
     * @example
     * optional.field('age').int.decodeJSON('{}')               // Right(Nothing)
     * optional.field('age').int.decodeJSON('{ "age": null }')  // Left(..)
     * optional.field('age').int.decodeJSON('{ "age": true }')  // Left(..)
     * optional.field('age').int.decodeJSON('{ "age": 42 }')    // Right(Just(42))
     *
     * optional.index(0).int.decodeJSON('[]')        // Right(Nothing)
     * optional.index(0).int.decodeJSON('[ null ]')  // Left(..)
     * optional.index(0).int.decodeJSON('[ 18 ]')    // Right(Just(18))
     */
    int: _.Decoder<Maybe<number>>

    /**
     * Decode a JSON into a `float` (`number` in fact).
     *
     * @example
     * optional.field('weight').float.decodeJSON('{}')                    // Right(Nothing)
     * optional.field('weight').float.decodeJSON('{ "weight": null }')    // Left(..)
     * optional.field('weight').float.decodeJSON('{ "weight": true }')    // Left(..)
     * optional.field('weight').float.decodeJSON('{ "weight": 123.45 }')  // Right(Just(123.45))
     *
     * optional.index(0).float.decodeJSON('[]')        // Right(Nothing)
     * optional.index(0).float.decodeJSON('[ null ]')  // Left(..)
     * optional.index(0).float.decodeJSON('[ 18.1 ]')  // Right(Just(18.1))
     */
    float: _.Decoder<Maybe<number>>

    /**
     * Do not do anything with a JSON value, just bring it into an `Encode.Value`.
     * This can be useful if you have particularly complex data that you would like to deal with later.
     * Or if you are going to send it out somewhere and do not care about its structure.
     */
    value: _.Decoder<Maybe<Encode.Value>>

    /**
     * Take an object of `Decoder`s and return a `Decoder` with a object of values.
     * Decoding fails if at least one of the fields fails.
     *
     * @example
     * optional.field('center').shape({
     *     x: field('_x_').float,
     *     y: field('_y_').float,
     * }).decodeJSON('{ "center": { "_x_": 12.34, "_y_": 56.78 }}')
     * // Right(Just({ x: 12.34, y: 56.78 }))
     *
     * optional.index(0).shape({
     *     x: field('_x_').float,
     *     y: field('_y_').float,
     * }).decodeJSON('[]')
     * // Right(Nothing)
     */
    shape: OptionalShape

    /**
     * Decode a JSON into an `Array`.
     *
     * @example
     * optional.field('sequence').list(int).decodeJSON('{ "sequence": [ 1, 2, 3 ]}')
     * // Right(Just([ 1, 2, 3 ]))
     *
     * optional.index(0).list(boolean).decodeJSON('[]')
     * // Right(Nothing)
     */
    list: OptionaldList

    /**
     * Decode a JSON into an `Array` of pairs.
     *
     * @example
     * optional.field('keys').keyValue(number).decodeJSON('{ "keys": { "key_1": 2, "key_2": 1 }}')
     * // Right(Just([[ 'key_1', 2 ], [ 'key_2', 1 ]]))
     *
     * optional.index(0).keyValue(intFromString, boolean).decodeJSON('[')
     * // Right(Nothing)
     */
    keyValue: OptionalKeyValue

    /**
     * Decode a JSON into an object.
     *
     * @example
     * optional.field('keys').dict(number).decodeJSON('{ "keys": { "key_1": 2, "key_2": 1 }}')
     * // Right(Just({ key_1: 2, key_2: 1 }))
     *
     * optional.index(0).dict(number).decodeJSON('[]')
     * // Right(Nothing)
     */
    dict: OptionalDict

    /**
     * Nest a decoder.
     *
     * @example
     * optional.field('name').of(string) === optional.field('name').string
     * optional.index(0).of(int) === optional.index(0).int
     */
    of: OptionalOf

    /**
     * Try a bunch of different decoders.
     * This can be useful if the JSON value may come in a couple different formats.
     * For example, say you want to read an array of int, but some of them are strings.
     *
     * @example
     * list(
     *     optional.field('count').oneOf([
     *         int,
     *         string.chain(str => fromMaybe('Expecting an INTEGER', Basics.toInt(str)))
     *     ])
     * ).decodeJSON('[{ "count": 0 }, { "count": "1" }, { "count": "2" }, { "count": 3 }, {}]')
     * // Right([ Just(0), Just(1), Just(2), Just(3), Nothing ])
     */
    oneOf: OptionalOneOf

    /**
     * Creates enum decoder based on variants.
     *
     * @example
     * optional.field('currency').enums([
     *     [ 'USD', new USD(0) ],
     *     [ 'EUR', new EUR(0) ],
     *     [ 'RUB', new RUB(0) ],
     * ]).decodeJSON('{ "currency": "RUB" }')
     * // Right(Just(new RUB(0)))
     *
     * optional.index(0).enums([
     *     [ 'USD', new USD(0) ],
     *     [ 'EUR', new EUR(0) ],
     *     [ 'RUB', new RUB(0) ],
     * ]).decodeJSON('[]')
     * // Right(Nothing)
     */
    enums: OptionalEnums

    /**
     * Sometimes you have a JSON with recursive structure,like nested comments.
     * You can use `lazy` to make sure your decoder unrolls lazily.
     *
     * @example
     * interface Comment {
     *     message: string;
     *     comments: Maybe<Array<Comment>>;
     * }
     *
     * const commentDecoder: Decoder<Comment> = shape({
     *     message: field('message').string,
     *     comments: optional.field('message').lazy(() => list(commentDecoder))
     * });
     */
    lazy: OptionalLazy

    /**
     * Decode a JSON object, requiring a particular field.
     *
     * @param name Name of the field.
     *
     * @example
     * optional.field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": 3 }}')
     * // Right(Just(3))
     * optional.field('coordinates').field('x').int.decodeJSON('{}')
     * // Right(Nothing)
     * optional.field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "x": null }}')
     * // Left(..)
     * optional.field('coordinates').field('x').int.decodeJSON('{ "coordinates": { "y": 4 }}')
     * // Left(..)
     */
    field(name: string): OptionalPath

    /**
     * Decode a JSON array, requiring a particular index.
     *
     * @param position Exact index of the decoding value.
     *
     * @example
     * const json = '[{ "children": [ "alise", "bob", "chuck" ]}]';
     *
     * optional.at(0, 'children').index(0).string.decodeJSON('[]')
     * // Right(Nothing)
     * optional.at(0, 'children').index(0).string.decodeJSON('[{}]')
     * // Right(Nothing)
     * optional.at(0, 'children').index(0).string.decodeJSON('[{ "children": [] }]')
     * // Left(..)
     * optional.at(0, 'children').index(3).string.decodeJSON('[{ "children": [ null ]}]')
     * // Left(..)
     * optional.at(0, 'children').index(0).string.decodeJSON('[{ "children": [ "chuck" ]}]')
     * // Right(Just('chuck'))
     */
    index(position: number): OptionalPath

    /**
     * Decode a nested JSON object, requiring certain fields and indexes.
     *
     * @param path Sequence of field names and index positions.
     *
     * @example
     * const json = '[{ "person": { "name": "tom", "age": 42, "accounts": [ "tom_42" ]}}]';
     *
     * optional.index(0).at([ 'person', 'name' ]).string.decodeJSON('[]')         // Right(Nothing)
     * optional.index(0).at([ 'person', 'name' ]).string.decodeJSON(json)         // Right(Just('tom'))
     * optional.index(0).at([ 'person', 'age' ]).int.decodeJSON(json)             // Right(Just(42))
     * optional.index(0).at([ 'person', 'accounts', 0 ]).string.decodeJSON(json)  // Right(Just('tom_42"'))
     *
     * // This is really just a shorthand for saying things like:
     *
     * optional.index(0).field('person').field('name').string
     * optional.index(0).field('person').field('age').int
     * optional.index(0).field('person').field('accounts').index(0).string
     */
    at(path: Array<string | number>): OptionalPath
  } & WithOptional

  /**
   * Do not do anything with a JSON value, just bring it into an `Encode.Value`.
   * This can be useful if you have particularly complex data that you would like to deal with later.
   * Or if you are going to send it out somewhere and do not care about its structure.
   */
  export const value = new _.Value()

  /**
   * Decode a JSON into a `string`.
   *
   * @example
   * string.decodeJSON('true')              // Left(...)
   * string.decodeJSON('42')                // Left(...)
   * string.decodeJSON('3.14')              // Left(...)
   * string.decodeJSON('"hello"')           // Right('hello')
   * string.decodeJSON('{ "hello": 42 }')   // Left(..)
   */
  export const string: Decoder<string> = new _.Primitive(
    'a',
    'STRING',
    isString
  )

  /**
   * Decode a JSON into a `boolean`.
   *
   * @example
   * boolean.decodeJSON('true')             // Right(true)
   * boolean.decodeJSON('42')               // Left(..)
   * boolean.decodeJSON('3.14')             // Left(..)
   * boolean.decodeJSON('"hello"')          // Left(..)
   * boolean.decodeJSON('{ "hello": 42 }')  // Left(..)
   */
  export const boolean: Decoder<boolean> = new _.Primitive(
    'a',
    'BOOLEAN',
    isBoolean
  )

  /**
   * Decode a JSON into an `int` (`number` in fact).
   *
   * @example
   * int.decodeJSON('true')              // Left(..)
   * int.decodeJSON('42')                // Right(42)
   * int.decodeJSON('3.14')              // Left(..)
   * int.decodeJSON('"hello"')           // Left(..)
   * int.decodeJSON('{ "hello": 42 }')   // Left(..)
   */
  export const int: Decoder<number> = new _.Primitive('an', 'INTEGER', isInt)

  /**
   * Decode a JSON into a `float` (`number` in fact).
   *
   * @example
   * float.decodeJSON('true')             // Left(..)
   * float.decodeJSON('42')               // Right(42)
   * float.decodeJSON('3.14')             // Right(3.41)
   * float.decodeJSON('"hello"')          // Left(..)
   * float.decodeJSON('{ "hello": 42 }')  // Left(..)
   */
  export const float: Decoder<number> = new _.Primitive('a', 'FLOAT', isFloat)

  /**
   * Ignore the JSON value and make the decoder fail.
   * This is handy when used with `oneOf` or `chain` where you want to give a custom error message in some case.
   *
   * @param message Custom error message
   *
   * @example
   * string.chain((str: string): Decoder<Date> => {
   *     const date = new Date(str);
   *
   *     return isNaN(date.getTime()) ? Decode.fail('Expecting a DATE') : Decode.succeed(date);
   * }).decode('2010-01-02')
   * // Right(new Date('2010-01-02'))
   */
  export const fail = (message: string): Decoder<never> => new _.Fail(message)

  /**
   * Ignore the JSON value and produce a certain value.
   * This is handy when used with `oneOf` or `chain`.
   *
   * @param value The certain value.
   *
   * @example
   * string.chain((str: string): Decoder<Date> => {
   *     const date = new Date(str);
   *
   *     return isNaN(date.getTime()) ? Decode.fail('Expecting a DATE') : Decode.succeed(date);
   * }).decode('2010-01-02')
   * // Right(new Date('2010-01-02'))
   */
  export const succeed = <T>(val: T): Decoder<T> => new _.Succeed(val)

  /**
   * Take an object of `Decoder`s and return a `Decoder` with an object of values.
   * Decoding fails if at least one of the fields fails.
   *
   * @example
   * shape({
   *     x: field('_x_').float,
   *     y: field('_y_').float,
   * }).decodeJSON('{ "_x_": 12.34, "_y_": 56.78 }')
   * // Right({ x: 12.34, y: 56.78 })
   */
  export const shape: RequiredShape = object => new _.Shape(object)

  /**
   * Decode a JSON into an `Array`.
   *
   * @example
   * list(int).decodeJSON('[ 1, 2, 3 ]')
   * // Right([ 1, 2, 3 ])
   *
   * list(boolean).decodeJSON('[ true, false ]')
   * // Right([ true, false ])
   */
  export const list: RequiredList = decoder => new _.List(decoder)

  /**
   * Decode a JSON into an `Array` of pairs.
   *
   * @example
   * keyValue(number).decodeJSON('{ "key_1": 2, "key_2": 1 }')
   * // Right([[ 'key_1', 2 ], [ 'key_2', 1 ]])
   *
   * keyValue(intFromString, boolean).decodeJSON('{ "1": true, "2": false }')
   * // Right([[ 1, true ], [ 2, false ]])
   */
  export const keyValue: RequiredKeyValue = <T, K>(
    ...args: [Decoder<T>] | [(key: string) => Either<string, K>, Decoder<T>]
  ) => {
    if (args.length === 1) {
      return new _.KeyValue(Right, args[0])
    }

    return new _.KeyValue(args[0], args[1])
  }

  /**
   * Decode a JSON into an object.
   *
   * @param decoder Decoder of the object value.
   *
   * @example
   * dict(number).decodeJSON('{ "key_1": 2, "key_2": 1 }')
   * // Right({ key_1: 2, key_2: 1 })
   */
  export const dict = <T>(
    decoder: Decoder<T>
  ): Decoder<{ [key: string]: T }> => {
    return keyValue(decoder).map((pairs: Array<[string, T]>): {
      [key: string]: T
    } => {
      const acc: { [key: string]: T } = {}

      for (const [key, val] of pairs) {
        acc[key] = val
      }

      return acc
    })
  }

  /**
   * Try a bunch of different decoders.
   * This can be useful if the JSON value may come in a couple different formats.
   * For example, say you want to read an array of int, but some of them are strings.
   *
   * Why would someone generate input like this?
   * Questions like this are not good for your health.
   * The point is that you can use `oneOf` to handle situations like this!
   *
   * You could also use `oneOf` to help version your data.
   * Try the latest format, then a few older ones that you still support.
   * You could use `chain` to be even more particular if you wanted.
   *
   * @example
   * list(
   *     oneOf([
   *         int,
   *         string.chain(str => fromMaybe('Expecting an INTEGER', Basics.toInt(str)))
   *     ])
   * ).decodeJSON('[ 0, 1, "2", 3, "4" ]')
   * // Right([ 0, 1, 2, 3, 4 ])
   */
  export const oneOf: RequiredOneOf = decoders => new _.OneOf(decoders)

  /**
   * Creates enum decoder based on variants.
   *
   * @example
   * enums([
   *     [ 'USD', new USD(0) ],
   *     [ 'EUR', new EUR(0) ],
   *     [ 'RUB', new RUB(0) ],
   * ]).decodeJSON('"RUB"')
   * // Right(new RUB(0))
   */
  export const enums: RequiredEnums = variants => new _.Enums(variants)

  /**
   * Sometimes you have a JSON with recursive structure,like nested comments.
   * You can use `lazy` to make sure your decoder unrolls lazily.
   *
   * @example
   * interface Comment {
   *     message: string;
   *     comments: Array<Comment>;
   * }
   *
   * const commentDecoder: Decoder<Comment> = shape({
   *     message: field('message').string,
   *     comments: field('message').list(lazy(() => commentDecoder))
   * });
   */
  export const lazy: RequiredLazy = callDecoder =>
    succeed(null).chain(callDecoder)

  /**
   * Decode a JSON object, requiring a particular field.
   *
   * @param name Name of the field.
   *
   * @example
   * field('x').int.decodeJSON('{ "x": 3 }')          // Right(3)
   * field('x').int.decodeJSON('{ "x": 3, "y": 4 }')  // Right(3)
   * field('x').int.decodeJSON('{ "x": true }')       // Left(..)
   * field('x').int.decodeJSON('{ "x": null }')       // Left(..)
   * field('x').int.decodeJSON('{ "y": 4 }')          // Left(..)
   */
  export const field = (name: string): Path =>
    new _.Path(
      <T>(decoder: Decoder<T>): Decoder<T> => _.Field.required(name, decoder)
    )

  /**
   * Decode a JSON array, requiring a particular index.
   *
   * @param position Exact index of the decoding value.
   *
   * @example
   * const json = '[ "alise", "bob", "chuck" ]';
   *
   * index(0).string.decodeJSON(json)   // Right('alise')
   * index(1).string.decodeJSON(json)   // Right('bob')
   * index(2).string.decodeJSON(json)   // Right('chuck')
   * index(-1).string.decodeJSON(json)  // Right('chuck')
   * index(3).string.decodeJSON(json)   // Left(..)
   */

  export const index = (position: number): Path =>
    new _.Path(
      <T>(decoder: Decoder<T>): Decoder<T> =>
        _.Index.required(position, decoder)
    )

  /**
   * Decode a nested JSON object, requiring certain fields and indexes.
   *
   * @param path Sequence of field names and index positions.
   *
   * @example
   * const json = '{ "person": { "name": "tom", "age": 42, "accounts": [ "tom_42" ] } }';
   *
   * at([ 'person', 'name' ]).string.decodeJSON(json)         // Right('tom')
   * at([ 'person', 'age' ]).int.decodeJSON(json)             // Right(42)
   * at([ 'person', 'accounts', 0 ]).string.decodeJSON(json)  // Right('tom_42"')
   *
   * // This is really just a shorthand for saying things like:
   *
   * field('person').field('name').string
   * field('person').field('age').int
   * field('person').field('accounts').index(0).string
   */
  export const at = (path: Array<string | number>): Path =>
    new _.Path(<T>(decoder: Decoder<T>): Decoder<T> => _.Path.at(path, decoder))

  /**
   * Lets create an optional `Decoder`.
   *
   * @example
   * optional.string.decodeJSON('null')        // Right(Nothing)
   * optional.string.decodeJSON('"anything"')  // Right(Just('anything))
   */
  export const optional: Optional = new _.Optional(
    <T>(decoder: Decoder<T>): Decoder<Maybe<T>> => decoder.map(Just)
  )

  /**
   * Transform an either into a `Decoder`.
   * Sometimes it can be useful to use functions that primarily operate on `Either` in decoders.
   *
   * @param either Container to transform.
   *
   * @example
   * const validateNumber = (num: number): Either<string, number> => {
   *     return num > 0 ? Either.Right(num) : Either.Left('Expecting a POSITIVE NUMBER');
   * };
   *
   * number.map(validateNumber).chain(fromEither).decodeJSON('1')   // Right(1)
   * number.map(validateNumber).chain(fromEither).decodeJSON('-1')  // Left(..)
   */
  export const fromEither = <T>(either: Either<string, T>): Decoder<T> =>
    either.fold(fail, succeed)

  /**
   * Transform a maybe into a `Decoder`.
   * Sometimes it can be useful to use functions that primarily operate on `Maybe` in decoders.
   *
   * @param either Container to transform.
   *
   * @example
   * const nonBlankString = (str: string): Maybe<string> => {
   *     return str.trim() === '' ? Maybe.Nothing : Maybe.Just(str.trim());
   * };
   *
   * const decoder: Decoder<string> = string.chain(str => {
   *     return fromMaybe('Expecting a NON EMPTY STRING', nonBlankString(str));
   * });
   *
   * decoder.decodeJSON('" some string "')  // Right('some string')
   * decoder.decodeJSON('" "')              // Left(..)
   */
  export const fromMaybe = <T>(
    message: string,
    maybe: Maybe<T>
  ): Decoder<T> => {
    return maybe.toEither(message).tap(fromEither)
  }
}

export { Error } from './Error'

export { Decoder } from './Decoder'

/**
 * @alis `Decode.Path`
 */
export type Path = Decode.Path

/**
 * @alis `Decode.OptionalPath`
 */
export type OptionalPath = Decode.OptionalPath

/**
 * @alis `Decode.Optional`
 */
export type Optional = Decode.Optional

/**
 * @alis `Decode.value`
 */
export const value = Decode.value

/**
 * @alis `Decode.string`
 */
export const string = Decode.string

/**
 * @alis `Decode.boolean`
 */
export const boolean = Decode.boolean

/**
 * @alis `Decode.int`
 */
export const int = Decode.int

/**
 * @alis `Decode.float`
 */
export const float = Decode.float

/**
 * @alis `Decode.fail`
 */
export const fail = Decode.fail

/**
 * @alis `Decode.succeed`
 */
export const succeed = Decode.succeed

/**
 * @alis `Decode.shape`
 */
export const shape = Decode.shape

/**
 * @alis `Decode.list`
 */
export const list = Decode.list

/**
 * @alis `Decode.keyValue`
 */
export const keyValue = Decode.keyValue

/**
 * @alis `Decode.dict`
 */
export const dict = Decode.dict

/**
 * @alis `Decode.oneOf`
 */
export const oneOf = Decode.oneOf

/**
 * @alis `Decode.enums`
 */
export const enums = Decode.enums

/**
 * @alis `Decode.lazy`
 */
export const lazy = Decode.lazy

/**
 * @alis `Decode.field`
 */
export const field = Decode.field

/**
 * @alis `Decode.index`
 */
export const index = Decode.index

/**
 * @alis `Decode.at`
 */
export const at = Decode.at

/**
 * @alis `Decode.optional`
 */
export const optional = Decode.optional

/**
 * @alis `Decode.fromEither`
 */
export const fromEither = Decode.fromEither

/**
 * @alis `Decode.fromMaybe`
 */
export const fromMaybe = Decode.fromMaybe

export default Decode
