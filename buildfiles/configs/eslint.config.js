import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import js from '@eslint/js'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import importPlugin from 'eslint-plugin-import'

export default [
  {
    ignores: [
      '**/*.min.js',
      '**/build',
      '**/node_modules',
      '**/dist',
    ],
  },
  js.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-flavor'],
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'curly': 'error',
      'no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],
      'unicorn/prefer-code-point': ['warn'],
      'unicorn/prefer-string-slice': ['warn'],
      'unicorn/prefer-at': ['warn'],
      'unicorn/prefer-modern-dom-apis': ['warn'],
      'unicorn/no-array-push-push': ['warn'],
      'unicorn/prefer-node-protocol': ['error'],
      'unicorn/prefer-array-find': ['error'],
      'jsdoc/valid-types': 0,
      'jsdoc/reject-any-type': 0,
      'jsdoc/require-jsdoc': 0,
      'jsdoc/require-returns': 0,
      'jsdoc/tag-lines': 0,
      'no-empty-pattern': ['error', { 'allowObjectPatternsAsParameters': true }],
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'import/extensions': ['error', 'always'],
      'max-lines-per-function': ['warn', { max: 75, skipComments: true }],
      'jsdoc/require-jsdoc': ['warn', { exemptEmptyFunctions: true }],
      'jsdoc/require-returns': ['warn', { publicOnly: true }],
      'jsdoc/tag-lines': ['error', 'any', { startLines: null }],
      'import/no-extraneous-dependencies': ['error', { 'devDependencies': false, 'optionalDependencies': false, 'peerDependencies': false }],
    },
  }, {
    files: [
      '**/*.spec.js',
      '**/*.spec.ts',
    ],
    rules: {
      'jsdoc/require-param-description': 0,
      'jsdoc/require-returns-description': 0,
      'no-unused-vars': 0,
      'import/no-restricted-paths': ['error', {
        'zones': [
          {
            'target': [
              '**/*.unit.spec.js',
              '**/*.unit.spec.ts',
            ],
            'from': [
              './test-utils/ui/**/*',
            ],
          },
          {
            'target': [
              '**/*.ui.spec.js',
              '**/*.ui.spec.ts',
            ],
            'from': [
              './test-utils/unit/**/*',
            ],
          },
        ],
      }],
    },
  },
]
