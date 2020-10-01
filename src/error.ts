import type { DecodeJsonError, DecodeError } from '.'

export const InvalidJson = (
  error: SyntaxError,
  json: string
): DecodeJsonError => ({ type: 'INVALID_JSON', error, json })

export const RuntimeException = (error: Error): DecodeError => ({
  type: 'RUNTIME_EXCEPTION',
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
): DecodeError => ({ type: 'REQUIRED_FIELD', name, object })

export const RequiredIndex = (
  position: number,
  array: Array<unknown>
): DecodeError => ({ type: 'REQUIRED_INDEX', position, array })

export const Failure = (message: string, source: unknown): DecodeError => ({
  type: 'FAILURE',
  message,
  source
})

export const Enums = (
  variants: Array<string | number | boolean | null>,
  source: unknown
): DecodeError => ({ type: 'ENUMS', variants, source })

export const ExpectString = (source: unknown): DecodeError => ({
  type: 'EXPECT_STRING',
  source
})

export const ExpectBoolean = (source: unknown): DecodeError => ({
  type: 'EXPECT_BOOLEAN',
  source
})

export const ExpectInt = (source: unknown): DecodeError => ({
  type: 'EXPECT_INT',
  source
})

export const ExpectFloat = (source: unknown): DecodeError => ({
  type: 'EXPECT_FLOAT',
  source
})

export const ExpectObject = (source: unknown): DecodeError => ({
  type: 'EXPECT_OBJECT',
  source
})

export const ExpectArray = (source: unknown): DecodeError => ({
  type: 'EXPECT_ARRAY',
  source
})
