import test from 'ava'

import Decode from '../src/decode-json'

test('Decoder.map()', t => {
  interface Person {
    id: string
    name: string
    age: number
  }

  interface Company {
    name: string
    private: boolean
  }

  const _0 = Decode.shape({
    person: Decode.shape({
      id: Decode.field('uuid').string,
      name: Decode.field('first_name').string,
      age: Decode.field('years_old').int
    }),
    company: Decode.shape({
      name: Decode.field('company').string,
      private: Decode.field('priv').boolean
    })
  }).map<[Person, Company]>(({ person, company }) => [person, company])

  t.deepEqual(
    _0.decode({
      uuid: 'xi1',
      first_name: 'Cris',
      years_old: 27,
      company: 'M&M',
      priv: false
    }).value,
    [
      {
        id: 'xi1',
        name: 'Cris',
        age: 27
      },
      {
        name: 'M&M',
        private: false
      }
    ]
  )
})
