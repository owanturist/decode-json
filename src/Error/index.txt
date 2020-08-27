import { Cata } from '../../../Basics'

import * as _ from './Error'

/**
 * A structured error describing exactly how the decoder failed.
 * You can use this to create more elaborate visualizations of a decoder problem.
 * For example, you could show the entire JSON object and show the part causing the failure in red.
 */
export type Error = {
  /**
   * Match the current `Error` to provided pattern.
   *
   * @param pattern Pattern matching.
   */
  cata<R>(pattern: Pattern<R>): R

  /**
   * Convert a decoding `Error` into a `string` that is nice for debugging.
   *
   * @param indent Counter of spaces for JSON.stringify of an `input`.
   */
  stringify(indent: number): string
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Error {
  /**
   * Pattern for matching `Error` variants.
   */
  export type Pattern<R> = Cata<{
    OneOf(errors: Array<Error>): R
    Field(name: string, error: Error): R
    Index(position: number, error: Error): R
    Failure(message: string, source: unknown): R
  }>

  /**
   * Collects a batch of `Error`s come from `Decode.oneOf` and `Decode.enums`.
   *
   * @param errors List of `Error`s
   */
  export const OneOf = (errors: Array<Error>): Error => new _.OneOf(errors)

  /**
   * Collects an `Error` comes from `Decode.field` and `Decode.at`
   *
   * @param name  Field name triggers the `error`
   * @param error Nested field `Error`
   */
  export const Field = (name: string, error: Error): Error =>
    new _.Field(name, error)

  /**
   * Collects an `Error` comes from `Decode.index` and `Decode.at`
   *
   * @param position Index position triggers the `error`
   * @param error    Nested field `Error`
   */
  export const Index = (position: number, error: Error): Error =>
    new _.Index(position, error)

  /**
   * Collects an `Error` comes from `Decode.field` and `Decode.at`
   *
   * @param message Description of the error.
   * @param source  JS source input failed while decoding.
   */
  export const Failure = (message: string, source: unknown): Error =>
    new _.Failure(message, source)
}

/**
 * @alias `Error.Pattern`
 */
export type Pattern<R> = Error.Pattern<R>

/**
 * @alias `Error.OneOf`
 */
export const OneOf = Error.OneOf

/**
 * @alias `Error.Field`
 */
export const Field = Error.Field

/**
 * @alias `Error.Index`
 */
export const Index = Error.Index

/**
 * @alias `Error.Failure`
 */
export const Failure = Error.Failure

export default Error
