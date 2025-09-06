/** @type {import('eslint').FlatConfig.Config[]} */
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // ignore build/generated
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'public/**',
      'src/data/locales.gen.ts',
    ],
  },

  // lint your code
  {
    files: [
      'app/**/*.{js,ts,tsx}',
      'src/**/*.{js,ts,tsx}',
      'scripts/**/*.{js,mjs,ts}',
    ],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks }, // ✅ flat-config style
    rules: {
      // React Hooks rules back on
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // your style prefs
      'array-element-newline': ['error', { minItems: 2 }],
      'comma-dangle': ['error', 'always-multiline'],

      // keep noise down for now
      'no-unused-expressions': 'off',
    },
  },
];
