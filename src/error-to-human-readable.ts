import { DecodeJsonError, DecodeError } from '.'

const wrapFieldName = (name: string): string => {
  if (/^[a-z$_][0-9a-z$_]*$/i.test(name)) {
    return `.${name}`
  }

  return `['${name}']`
}

const spaces = (n: number): string => new Array(Math.max(0, n) + 1).join(' ')

const path = (context: Array<string>): string => `_${context.join('')}`

const stringifyJSON = (indent: number, source: unknown): string => {
  const space = spaces(indent)

  return [
    space,
    typeof source === 'undefined'
      ? 'undefined'
      : JSON.stringify(source, null, indent).replace(/\n/g, '\n' + space)
  ].join('')
}

const runtimeExceptionToHumanReadable = (
  runtimeError: Error,
  indent: number,
  context: Array<string>
): string => {
  return [
    'Unexpected runtime error',
    context.length === 0 ? '' : ` at ${path(context)}`,
    ':\n\n',
    spaces(indent),
    runtimeError.message
  ].join('')
}

const endValueToHumanReadable = (
  prefix: string,
  type: string,
  source: unknown,
  optional: boolean,
  indent: number,
  context: Array<string>
): string => {
  return [
    'Problem with ',
    context.length === 0 ? 'the given value' : `a value at ${path(context)}`,
    '.\nExpecting ',
    optional ? 'an OPTIONAL' : prefix,
    ' ',
    type,
    ' but actual value is:\n\n',
    stringifyJSON(indent, source)
  ].join('')
}

const toHumanReadable = (
  error: DecodeError,
  optional: boolean,
  indent: number,
  context: Array<string>
): string => {
  switch (error.type) {
    case 'OPTIONAL': {
      return toHumanReadable(error.error, true, indent, context)
    }

    case 'IN_FIELD': {
      return toHumanReadable(error.error, false, indent, [
        ...context,
        wrapFieldName(error.name)
      ])
    }

    case 'AT_INDEX': {
      return toHumanReadable(error.error, false, indent, [
        ...context,
        `[${error.position}]`
      ])
    }

    case 'ONE_OF': {
      throw new Error(String(optional))
    }

    case 'RUNTIME_EXCEPTION': {
      return runtimeExceptionToHumanReadable(error.error, indent, context)
    }

    case 'REQUIRED_FIELD': {
      throw new Error('')
    }

    case 'REQUIRED_INDEX': {
      throw new Error('')
    }

    case 'FAILURE': {
      throw new Error('')
    }

    case 'EXPECT_STRING': {
      return endValueToHumanReadable(
        'a',
        'STRING',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'EXPECT_BOOLEAN': {
      return endValueToHumanReadable(
        'a',
        'BOOLEAN',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'EXPECT_INT': {
      return endValueToHumanReadable(
        'an',
        'INTEGER',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'EXPECT_FLOAT': {
      return endValueToHumanReadable(
        'a',
        'FLOAT',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'EXPECT_OBJECT': {
      return endValueToHumanReadable(
        'an',
        'OBJECT',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'EXPECT_ARRAY': {
      return endValueToHumanReadable(
        'an',
        'ARRAY',
        error.source,
        optional,
        indent,
        context
      )
    }

    case 'ENUMS': {
      throw new Error('')
    }
  }
}

const errorToHumanReadable = (
  error: DecodeJsonError,
  { indent = 4 }: { indent?: number } = {}
): string => {
  if (error.type === 'INVALID_JSON') {
    return [
      'JSON parse error: ',
      error.error.message,
      '.\n\n',
      spaces(indent),
      error.source
    ].join('')
  }

  return toHumanReadable(error, false, indent, [])
}

export default errorToHumanReadable
