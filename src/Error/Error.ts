import { Error as IError, Pattern } from './index'

const wrapFieldName = (name: string): string => {
  if (/^[a-z$_][0-9a-z$_]*$/i.test(name)) {
    return `.${name}`
  }

  return `['${name}']`
}

const stringify = (
  error: IError,
  indent: number,
  context: Array<string>
): string =>
  error.cata({
    OneOf(errors: Array<IError>): string {
      if (errors.length === 0) {
        return (
          'Ran into a Json.Decode.oneOf with no possibilities' +
          (context.length === 0 ? '!' : ' at _' + context.join(''))
        )
      }

      if (errors.length === 1) {
        return stringify(errors[0], indent, context)
      }

      const starter =
        context.length === 0
          ? 'Json.Decode.oneOf'
          : 'The Json.Decode.oneOf at _' + context.join('')

      const lines = [`${starter} failed in the following ${errors.length} ways`]

      for (let index = 0; index < errors.length; ++index) {
        lines.push(`\n(${index + 1}) ` + errors[index].stringify(indent))
      }

      return lines.join('\n\n')
    },

    Field(name: string, errorFromField: IError): string {
      return stringify(errorFromField, indent, [
        ...context,
        wrapFieldName(name)
      ])
    },

    Index(position: number, errorFromIndex: IError): string {
      return stringify(errorFromIndex, indent, [...context, `[${position}]`])
    },

    Failure(message: string, source: unknown): string {
      return [
        context.length === 0
          ? 'Problem with the given value'
          : 'Problem with the value at _' + context.join(''),

        ':\n\n    ',

        typeof source === 'undefined'
          ? 'undefined'
          : JSON.stringify(source, null, indent).replace(/\n/g, '\n    '),

        `\n\n${message}`
      ].join('')
    }
  })

abstract class Error implements IError {
  public abstract cata<R>(pattern: Pattern<R>): R

  public stringify(indent: number): string {
    return stringify(this, indent, [])
  }
}

export class OneOf extends Error {
  public constructor(private readonly errors: Array<IError>) {
    super()
  }

  public cata<R>(pattern: Pattern<R>): R {
    if (typeof pattern.OneOf === 'function') {
      return pattern.OneOf(this.errors)
    }

    return (pattern._ as () => R)()
  }
}

export class Field extends Error {
  public constructor(
    private readonly name: string,
    private readonly error: IError
  ) {
    super()
  }

  public cata<R>(pattern: Pattern<R>): R {
    if (typeof pattern.Field === 'function') {
      return pattern.Field(this.name, this.error)
    }

    return (pattern._ as () => R)()
  }
}

export class Index extends Error {
  public constructor(
    private readonly position: number,
    private readonly error: IError
  ) {
    super()
  }

  public cata<R>(pattern: Pattern<R>): R {
    if (typeof pattern.Index === 'function') {
      return pattern.Index(this.position, this.error)
    }

    return (pattern._ as () => R)()
  }
}

export class Failure extends Error {
  public constructor(
    private readonly message: string,
    private readonly source: unknown
  ) {
    super()
  }

  public cata<R>(pattern: Pattern<R>): R {
    if (typeof pattern.Failure === 'function') {
      return pattern.Failure(this.message, this.source)
    }

    return (pattern._ as () => R)()
  }
}
