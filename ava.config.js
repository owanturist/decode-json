export default {
  typescript: {
    rewritePaths: {
      'src/': 'build/'
    }
  },

  require: ['ts-node/register'],

  files: ['tests/**/*.test.ts'],

  verbose: true
}
