import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    ignores: [
      'node_modules',
      '.output',
      '.nitro',
      '.env',
      'pnpm-lock.yaml',
      'package.json',
    ],
  },
  {
    rules: {
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
    },
  },
)
