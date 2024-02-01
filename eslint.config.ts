import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    ignores: [
      'node_modules',
      'dist',
      '.output',
      '.nitro',
      '.env',
      'pnpm-lock.yaml',
      'package.json',
    ],
  },
  {
    stylistic: false,
    ignores: ['tsconfig.json']
  },
  {
    rules: {
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off'
    }
  }
)
