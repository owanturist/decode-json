import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, Failure } from '../error'

const err = Failure('At {path}', null)

test('standalone', t => {
  t.is(errorToHumanReadable(AtIndex(1, err)), 'At _[1]')
  t.is(errorToHumanReadable(AtIndex(-1, err)), 'At _[-1]')
})

test('OPTIONAL', t => {
  t.is(errorToHumanReadable(Optional(AtIndex(0, err))), 'At _[0]')
})

test('IN_FIELD', t => {
  t.is(errorToHumanReadable(InField('foo', AtIndex(10, err))), 'At _.foo[10]')
  t.is(
    errorToHumanReadable(InField('bar', InField('foo', AtIndex(10, err)))),
    'At _.bar.foo[10]'
  )
  t.is(
    errorToHumanReadable(InField('bar', AtIndex(5, AtIndex(10, err)))),
    'At _.bar[5][10]'
  )
})

test('AT_INDEX', t => {
  t.is(errorToHumanReadable(AtIndex(5, AtIndex(10, err))), 'At _[5][10]')
  t.is(
    errorToHumanReadable(AtIndex(1, AtIndex(5, AtIndex(10, err)))),
    'At _[1][5][10]'
  )
  t.is(
    errorToHumanReadable(AtIndex(1, InField('bar', AtIndex(10, err)))),
    'At _[1].bar[10]'
  )
})
