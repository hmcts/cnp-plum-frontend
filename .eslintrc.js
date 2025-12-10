module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'import', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  ignorePatterns: [
    'dist/',
    'coverage/',
    '**/*.d.ts',
    'src/main/public/',
    'src/main/types/',
    'src/main/views/govuk/',
    'node_modules/',
    '.yarn/',
    '.pnp.*',
    'jest.config.js',
    'jest.*.config.js',
    'src/test/*/codecept.conf.js',
    'src/test/config.ts',
    '.github/',
    '.husky/',
    // Common non-project JS files
    'webpack/**',
    'codecept.conf.*',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
      rules: {
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['**/*.js'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {
        // JS-specific adjustments can go here
      },
    },
  ],
  rules: {
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
};
