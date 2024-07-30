import globals from 'globals'
import neostandard from 'neostandard'
import sonarjs from 'eslint-plugin-sonarjs'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  {
    ignores: [
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/*.min.js',
      '**/build',
      '**/node_modules',
      '**/dist',
    ],
  },
  ...neostandard(),
  jsdoc.configs['flat/recommended-typescript-flavor'],
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {

      'jsdoc/valid-types': 0,
      'jsdoc/require-returns': ['warn', { publicOnly: true }],
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-lines-per-function': ['warn', 75],
    },
  },
]
