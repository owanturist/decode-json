import test from 'ava'

import Decode from '../src'
import { RequiredField } from './error'

test('Decoder.chain()', t => {
  // Decoder<string>
  const _0 = Decode.field('active').boolean.chain(active => {
    return active
      ? Decode.field('start_date').string
      : Decode.field('last_activity').string
  })

  t.is(
    _0.decode({ active: false, last_activity: '30 sec ago' }).value,
    '30 sec ago'
  )
  t.is(
    _0.decode({ active: true, start_date: '1 Sep 2020' }).value,
    '1 Sep 2020'
  )

  t.deepEqual(
    _0.decode({ active: true, last_activity: '30 sec ago' }).error,
    RequiredField('start_date', { active: true, last_activity: '30 sec ago' })
  )
})
