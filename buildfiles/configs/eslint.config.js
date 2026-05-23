import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import importPlugin from 'eslint-plugin-import-x'

export default [
  {
    ignores: [
      '**/*.min.js',
      '**/build',
      '**/node_modules',
      '**/dist',
    ],
  },
  {
    // ESLint built-in rules
    // https://eslint.org/docs/latest/rules/
    name: 'eslint-base-rules',
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'logical-assignment-operators': ['error', 'always'],
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unassigned-vars': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-with': 'error',
      'prefer-object-has-own': 'error',
      'preserve-caught-error': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },
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
          argsIgnorePattern: "^_",
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
