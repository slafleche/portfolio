/** @type {import('eslint').FlatConfig.Config[]} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier'; // ⬅ add this

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(__dirname, 'tsconfig.json');

const tsTypeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map(
	(config) => ({
		...config,
		files:
			config.files ??
			[
				'src/**/*.ts',
				'src/**/*.tsx',
				'app/**/*.ts',
				'app/**/*.tsx',
				'types/**/*.ts',
				'types/**/*.tsx',
			],
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
				project: [
					tsconfigPath,
				],
				tsconfigRootDir: __dirname,
			},
		},
	}),
);

const tsNoProjectFiles = [
	'middleware.ts',
	'next-env.d.ts',
	'scripts/**/*.ts',
];

export default [
	// ignores etc…
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

	{
		files: [
			'*.config.{js,cjs,mjs}',
		],
		languageOptions: {
			parserOptions: {
				project: false,
			},
		},
	},

	// Your main TypeScript / JS config (example; keep what you already had)
	...tsTypeCheckedConfigs, // if you're already using this
	{
		files: [
			'**/*.{ts,tsx}',
		],
		plugins: {
			'react-hooks': reactHooks,
			react,
		},
		rules: {
			// Let Prettier handle indentation & wrapping:
			indent: 'off',
			'react/jsx-indent': 'off',
			'react/jsx-indent-props': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
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
			'**/*.{js,jsx}',
		],
		ignores: [
			'**/*.config.{js,cjs,mjs}',
		],
		languageOptions: {
			parserOptions: {
				project: false,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			react,
		},
		rules: {
			indent: 'off',
			'react/jsx-indent': 'off',
			'react/jsx-indent-props': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},

	// ⬇ MUST be last: disables any remaining conflicting stylistic rules
	eslintConfigPrettier,
];
