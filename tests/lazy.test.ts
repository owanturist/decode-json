/* eslint-disable no-undefined */

import test from 'ava'

import Decode, { Decoder } from '../src/decode-json'
import {
  InField,
  RequiredField,
  ExpectInt,
  AtIndex,
  ExpectString
} from './error'

interface Message {
  content: string
  comments: Array<Message>
}

const messageDecoder: Decoder<Message> = Decode.shape({
  content: Decode.field('con').string,
  comments: Decode.field('com').lazy(() => Decode.list(messageDecoder))
})

test('Decode.lazy()', t => {
  // Decoder<Message>
  const _0 = messageDecoder

  t.deepEqual(
    _0.decode({
      con: 'hi',
      com: []
    }).value,
    {
      content: 'hi',
      comments: []
    }
  )

  t.deepEqual(
    _0.decode({
      con: 'oops',
      com: [
        {
          con: 'yes',
          com: [
            {
              con: 'here we go again',
              com: []
            }
          ]
        },
        {
          con: 'no',
          com: [
            {
              con: 'that is right',
              com: [
                {
                  con: 'agree',
                  com: []
                }
              ]
            }
          ]
        }
      ]
    }).value,
    {
      content: 'oops',
      comments: [
        {
          content: 'yes',
          comments: [
            {
              content: 'here we go again',
              comments: []
            }
          ]
        },
        {
          content: 'no',
          comments: [
            {
              content: 'that is right',
              comments: [
                {
                  content: 'agree',
                  comments: []
                }
              ]
            }
          ]
        }
      ]
    }
  )

  t.deepEqual(
    _0.decode({
      con: 'oops',
      com: [
        {
          con: 'yes',
          com: [
            {
              con: 'here we go again',
              com: []
            }
          ]
        },
        {
          con: 'no',
          com: [
            {
              con: 'that is right',
              com: [
                {
                  con: null,
                  com: []
                }
              ]
            }
          ]
        }
      ]
    }).error,
    InField(
      'com',
      AtIndex(
        1,
        InField(
          'com',
          AtIndex(
            0,
            InField('com', AtIndex(0, InField('con', ExpectString(null))))
          )
        )
      )
    )
  )
})

interface Node {
  key: number
  left: null | Node
  right: null | Node
}

const nodeDecoder: Decoder<Node> = Decode.shape({
  key: Decode.field('k').int,
  left: Decode.field('l').oneOf([
    Decode.exact(null),
    Decode.lazy(() => nodeDecoder)
  ]),
  right: Decode.field('r').oneOf([
    Decode.exact(null),
    Decode.lazy(() => nodeDecoder)
  ])
})

test('Decode.lazy() with nullable', t => {
  // Decoder<Node>
  const _0 = nodeDecoder

  t.deepEqual(_0.decode({ k: 0, l: null, r: null }).value, {
    key: 0,
    left: null,
    right: null
  })

  t.deepEqual(
    _0.decode({
      k: 0,
      l: {
        k: -1,
        l: null,
        r: null
      },
      r: null
    }).value,
    {
      key: 0,
      left: {
        key: -1,
        left: null,
        right: null
      },
      right: null
    }
  )

  t.deepEqual(
    _0.decode({
      k: 0,
      l: {
        k: -10,
        l: null,
        r: { k: -5, l: null, r: null }
      },
      r: {
        k: 9,
        l: {
          k: 1,
          l: null,
          r: null
        },
        r: null
      }
    }).value,
    {
      key: 0,
      left: {
        key: -10,
        left: null,
        right: {
          key: -5,
          left: null,
          right: null
        }
      },
      right: {
        key: 9,
        left: {
          key: 1,
          left: null,
          right: null
        },
        right: null
      }
    }
  )

  t.deepEqual(
    _0.decode({ k: 0, l: null }).error,
    RequiredField('r', { k: 0, l: null })
  )
  t.deepEqual(_0.decode({ k: false }).error, InField('k', ExpectInt(false)))
})
