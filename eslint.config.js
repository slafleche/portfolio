import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import importPluginFlatRecommended from 'eslint-plugin-import/config/flat/recommended.js';
import promisePlugin from 'eslint-plugin-promise';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(__dirname, 'tsconfig.json');

const importFlatConfig =
	(importPluginFlatRecommended?.default ?? importPluginFlatRecommended) ?? {};
const promiseFlatConfig =
	promisePlugin.configs?.['flat/recommended'] ?? {
		plugins: { promise: promisePlugin },
		rules: {},
	};
const reactFlatRecommended =
	react.configs?.flat?.recommended ?? { rules: {}, plugins: { react } };
const reactHooksRecommended =
	reactHooks.configs?.['recommended-latest'] ??
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
	'types/**/*.{ts,tsx}',
];

const tsNoProjectFiles = [
	'middleware.ts',
	'next-env.d.ts',
	'scripts/**/*.ts',
];

/** @type {import('eslint').FlatConfig.Config[]} */
export default [
		{
			ignores: [
				'node_modules/**',
				'.yarn/**',
				'.next/**',
				'dist/**',
				'build/**',
			'public/**',
			'src/data/locales.gen.ts',
		],
	},
	{
		...js.configs.recommended,
		files: ['**/*.{js,mjs,cjs,jsx}'],
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
			'scripts/**/*',
			'middleware.ts',
		],
		languageOptions: {
			...config.languageOptions,
			parserOptions: {
				...(config.languageOptions?.parserOptions ?? {}),
				project: [tsconfigPath],
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
			files: ['**/*.{js,jsx,ts,tsx,cjs,mjs}'],
			plugins: {
				import: importPlugin,
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
			rules: importFlatConfig.rules ?? {},
	},
	{
		...promiseFlatConfig,
		files: ['**/*.{js,jsx,ts,tsx}'],
	},
	{
		files: ['**/*.{jsx,tsx,js,ts}'],
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
		},
	},
	eslintConfigPrettier,
];
