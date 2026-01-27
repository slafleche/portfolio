import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import importPluginFlatRecommended from 'eslint-plugin-import/config/flat/recommended.js';
import promisePlugin from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const customRuleConfigs =
  (await import('./eslint/rules.mjs')).default ?? [];

const importFlatConfig =
  importPluginFlatRecommended?.default ??
  importPluginFlatRecommended ??
  {};
const promiseFlatConfig = promisePlugin.configs?.[
  'flat/recommended'
] ?? {
  plugins: { promise: promisePlugin },
  rules: {},
};
const reactFlatRecommended = react.configs?.flat?.recommended ?? {
  rules: {},
  plugins: { react },
};
const reactHooksRecommended = reactHooks.configs?.[
  'recommended-latest'
] ??
  reactHooks.configs?.recommended ?? {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  };

const tsSourceFiles = [
  'src/**/*.{ts,tsx}',
  'app/**/*.{ts,tsx}',
  'scripts/**/*.{ts,mts,cts}',
  'types/**/*.{ts,tsx}',
];

const tsNoProjectFiles = [
  'proxy.ts',
  'next-env.d.ts',
  'cdn/**/*.{ts,tsx,mts}',
  'tests/**/*.{ts,tsx}',
  '.storybook/**/*.{ts,tsx}',
];

/** @type {import('eslint').FlatConfig.Config[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      '.yarn/**',
      '.next/**',
      'next-env.d.ts',
      'dist/**',
      'build/**',
      'tmp/**',
      '.cloudflare/**',
      'public/**',
      'src/data/generated/**/*.gen.ts',
      'src/lib/locales/generated/**/*.gen.ts',
      '**/*.bak.*',
    ],
  },
  {
    files: [
      '*.config.{js,cjs,mjs}',
      '**/*.config.{js,cjs,mjs}',
      'next.config.js',
      'prettier.config.cjs',
    ],
    languageOptions: {
      parserOptions: {
        project: false,
      },
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    ...js.configs.recommended,
    files: [
      '**/*.{js,mjs,cjs,jsx}',
    ],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: config.files ?? tsSourceFiles,
    ignores: [
      ...(config.ignores ?? []),
      '**/*.config.{js,cjs,mjs}',
      'proxy.ts',
    ],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...(config.languageOptions?.parserOptions ?? {}),
        project: [
          tsconfigPath,
        ],
        tsconfigRootDir: __dirname,
      },
    },
  })),
  {
    files: tsNoProjectFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: [
      'tests/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'screen',
          property: 'getByText',
          message:
            'Avoid text-based queries in tests; prefer data-* hooks, roles, or labels.',
        },
        {
          object: 'screen',
          property: 'findByText',
          message:
            'Avoid text-based queries in tests; prefer data-* hooks, roles, or labels.',
        },
        {
          object: 'screen',
          property: 'queryByText',
          message:
            'Avoid text-based queries in tests; prefer data-* hooks, roles, or labels.',
        },
      ],
    },
  },
  {
    files: [
      '**/*.{js,jsx,ts,tsx,cjs,mjs}',
    ],
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: tsconfigPath,
        },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...(importFlatConfig.rules ?? {}),
      'import/no-cycle': [
        'error',
        {
          maxDepth: 1,
          ignoreExternal: true,
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    ...promiseFlatConfig,
    files: [
      '**/*.{js,jsx,ts,tsx}',
    ],
  },
  {
    files: ['scripts/**/*.{js,cjs,mjs,ts,mts,cts}'],
    languageOptions: {
      parserOptions: {
        project: [
          tsconfigPath,
        ],
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-empty': 'off',
    },
  },
  {
    files: [
      '**/*.{jsx,tsx,js,ts}',
    ],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...(reactFlatRecommended.rules ?? {}),
      ...(reactHooksRecommended.rules ?? {}),
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-comment-textnodes': 'off',
    },
  },
  ...customRuleConfigs,
  eslintConfigPrettier,
];
