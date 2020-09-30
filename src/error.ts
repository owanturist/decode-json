export type DecodeError =
  | { type: 'PARSE_JSON_ERROR'; error: SyntaxError; json: string }
  | { type: 'UNKNOWN_ERROR'; error: Error }
  | { type: 'ONE_OF'; errors: Array<DecodeError> }
  | { type: 'OPTIONAL'; error: DecodeError }
  | { type: 'IN_FIELD'; name: string; error: DecodeError }
  | { type: 'AT_INDEX'; position: number; error: DecodeError }
  | { type: 'REQUIRED_FIELD'; name: string; object: Record<string, unknown> }
  | { type: 'REQUIRED_INDEX'; position: number; array: Array<unknown> }
  | { type: 'FAILURE'; message: string; source: unknown }
  | { type: 'JSON_VALUE'; value: JsonValue; source: unknown }

export const ParseJsonError = (
  error: SyntaxError,
  json: string
): DecodeError => ({
  type: 'PARSE_JSON_ERROR',
  error,
  json
})

export const UnknownError = (error: Error): DecodeError => ({
  type: 'UNKNOWN_ERROR',
  error
})

const flatOneOf = (errors: Array<DecodeError>): Array<DecodeError> => {
  const acc: Array<DecodeError> = []

  for (const error of errors) {
    if (error.type === 'ONE_OF') {
      acc.push(...flatOneOf(error.errors))
    } else {
      acc.push(error)
    }
  }

  return acc
}

export const OneOf = (errors: Array<DecodeError>): DecodeError => {
  const flat = flatOneOf(errors)

  if (errors.length === 1) {
    return errors[0]
  }

  return {
    type: 'ONE_OF',
    errors: flat
  }
}

export const Optional = (error: DecodeError): DecodeError => ({
  type: 'OPTIONAL',
  error
})

export const InField = (name: string, error: DecodeError): DecodeError => ({
  type: 'IN_FIELD',
  name,
  error
})

export const AtIndex = (position: number, error: DecodeError): DecodeError => ({
  type: 'AT_INDEX',
  position,
  error
})

export const RequiredField = (
  name: string,
  object: Record<string, unknown>
): DecodeError => ({
  type: 'REQUIRED_FIELD',
  name,
  object
})

export const RequiredIndex = (
  position: number,
  array: Array<unknown>
): DecodeError => ({
  type: 'REQUIRED_INDEX',
  position,
  array
})

export const Failure = (message: string, source: unknown): DecodeError => ({
  type: 'FAILURE',
  message,
  source
})

export const JsonValue = (value: JsonValue, source: unknown): DecodeError => ({
  type: 'JSON_VALUE',
  value,
  source
})

export type JsonValue =
  | 'STRING'
  | 'BOOLEAN'
  | 'INT'
  | 'FLOAT'
  | 'OBJECT'
  | 'ARRAY'
