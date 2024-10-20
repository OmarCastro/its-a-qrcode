import globals from 'globals'
import neostandard from 'neostandard'
import sonarjs from 'eslint-plugin-sonarjs'
import jsdoc from 'eslint-plugin-jsdoc'
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'

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
  cspellESLintPluginRecommended,
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
      '@cspell/spellchecker': 0
    },
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/utils/utf8-to-jis-table.constants.js'],
    rules: {
      '@cspell/spellchecker': ['warn', {
        cspell: {
          dictionaries: ['html'],
          words: ['untick', 'millis', 'qrcode', 'sonarjs', 'dcdata', 'ecdata', 'crfl', 'vcard', 'vevent', 'Chaudhuri', 'Hocquenghem', 'glog', 'gexp'],
        }
      }]
    }
  }
]
