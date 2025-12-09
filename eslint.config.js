// eslint.config.js — ESLint v9 Flat Config
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // Disable rules that conflict with Prettier
  prettierConfig,

  // Ignore patterns
  {
    ignores: ['src/main/views/govuk/**'],
  },

  // Main ruleset applied to JS/TS files
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      jest: jestPlugin,
    },
    rules: {
      // Typescript rules
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-var-requires': 'off',

      // General rules
      curly: 'error',
      eqeqeq: 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: false, order: 'asc' },
          'newlines-between': 'always',
        },
      ],
      'jest/prefer-to-have-length': 'error',
      'jest/valid-expect': 'off',
      'linebreak-style': ['error', 'unix'],
      'no-console': 'warn',
      'no-prototype-builtins': 'off',
      'no-return-await': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'object-curly-spacing': ['error', 'always'],
      'object-shorthand': ['error', 'properties'],
      quotes: ['error', 'single', { allowTemplateLiterals: false, avoidEscape: true }],
      semi: ['error', 'always'],
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: false,
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
    },
    settings: {
      'import/external-module-folders': ['.yarn', 'node_modules', 'node_modules/@types'],
    },
  },
];
