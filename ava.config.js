export default {
  typescript: {
    rewritePaths: {
      'src/': 'es/'
    }
  },

  require: ['ts-node/register'],

  files: ['tests/**/*.test.ts'],

  verbose: true
}
