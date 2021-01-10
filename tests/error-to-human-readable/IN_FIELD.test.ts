import test from 'ava'

import errorToHumanReadable from '../../src/error-to-human-readable'
import { Optional, InField, AtIndex, Failure } from '../error'

const err = Failure('At {path}', null)

test('standalone', t => {
  t.is(errorToHumanReadable(InField('bar', err)), 'At _.bar')
  t.is(errorToHumanReadable(InField('foo', err)), 'At _.foo')
  t.is(errorToHumanReadable(InField('_0', err)), 'At _._0')
  t.is(errorToHumanReadable(InField('3', err)), `At _['3']`)
  t.is(errorToHumanReadable(InField('#3', err)), `At _['#3']`)
})

test('OPTIONAL', t => {
  t.is(errorToHumanReadable(Optional(InField('foo', err))), 'At _.foo')
})

test('IN_FIELD', t => {
  t.is(
    errorToHumanReadable(InField('foo', InField('bar', err))),
    'At _.foo.bar'
  )
  t.is(
    errorToHumanReadable(InField('bar', InField('foo', InField('baz', err)))),
    'At _.bar.foo.baz'
  )
  t.is(
    errorToHumanReadable(InField('bar', AtIndex(5, InField('foo', err)))),
    'At _.bar[5].foo'
  )
})

test('AT_INDEX', t => {
  t.is(errorToHumanReadable(AtIndex(5, InField('foo', err))), 'At _[5].foo')
  t.is(
    errorToHumanReadable(AtIndex(1, AtIndex(5, InField('foo', err)))),
    'At _[1][5].foo'
  )
  t.is(
    errorToHumanReadable(AtIndex(1, InField('bar', InField('foo', err)))),
    'At _[1].bar.foo'
  )
})
