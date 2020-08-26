import test from 'ava'

import { foo } from '../src'

test('Example', t => {
  t.deepEqual(foo, {
    bar: 1
  })
})
