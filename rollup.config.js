import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import minifyPrivatesTransformer from 'ts-transformer-minify-privates'
import { terser } from 'rollup-plugin-terser'

const input = {
  'decode-json': 'src/decode-json.ts',
  'error-to-human-readable': 'src/error-to-human-readable.ts'
}
const extensions = ['.ts']
const terserOptions = {
  mangle: {
    properties: {
      regex: /^__/
    }
  },
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true
  }
}
const renamePrivates = service => ({
  before: [minifyPrivatesTransformer(service.getProgram(), { prefix: '__' })],
  after: []
})

export default [
  // CommonJS
  {
    input,
    output: {
      dir: 'lib/',
      format: 'cjs',
      indent: false,
      entryFileNames: '[name].js',
      exports: 'default'
    },
    plugins: [
      nodeResolve({ extensions }),
      typescript({
        tsconfig: './tsconfig.prod.json',
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: 'types'
          }
        }
      })
    ]
  },

  // ES
  {
    input,
    output: {
      dir: 'es/',
      format: 'es',
      indent: false,
      entryFileNames: '[name].js'
    },
    plugins: [
      nodeResolve({ extensions }),
      typescript({ tsconfig: './tsconfig.prod.json' })
    ]
  },

  // ES for Browsers
  {
    input,
    output: {
      dir: 'es/',
      format: 'es',
      indent: false,
      entryFileNames: '[name].mjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve({ extensions }),

      typescript({
        tsconfig: './tsconfig.prod.json',
        transformers: [renamePrivates]
      }),

      terser({
        module: true,
        ...terserOptions
      })
    ]
  },

  // UMD Development
  ...[
    {
      name: 'Decode',
      input: 'src/decode-json.ts'
    },
    {
      name: 'errorToHumanReadable',
      input: 'src/error-to-human-readable.ts'
    }
  ].map(entry => ({
    input: entry.input,
    output: {
      dir: 'dist/',
      format: 'umd',
      indent: false,
      name: entry.name,
      entryFileNames: '[name].js'
    },
    plugins: [
      nodeResolve({ extensions }),

      typescript({
        tsconfig: './tsconfig.prod.json'
      })
    ]
  })),

  // UMD Production
  ...[
    {
      name: 'Decode',
      input: 'src/decode-json.ts'
    },
    {
      name: 'errorToHumanReadable',
      input: 'src/error-to-human-readable.ts'
    }
  ].map(entry => ({
    input: entry.input,
    output: {
      dir: 'dist/',
      format: 'umd',
      indent: false,
      name: entry.name,
      sourcemap: true,
      entryFileNames: '[name].min.js'
    },
    plugins: [
      nodeResolve({ extensions }),

      typescript({
        tsconfig: './tsconfig.prod.json',
        transformers: [renamePrivates]
      }),

      terser(terserOptions)
    ]
  }))
]
