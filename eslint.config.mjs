/** @type {import('eslint').FlatConfig.Config[]} */
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier'; // ⬅ add this

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
		files: ['*.config.{js,cjs,mjs}'],
		languageOptions: {
			parserOptions: {
				project: false,
			},
		},
	},

	// Your main TypeScript / JS config (example; keep what you already had)
	...tseslint.configs.recommendedTypeChecked, // if you're already using this
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		ignores: ['**/*.config.{js,cjs,mjs}'],
		languageOptions: {
			parserOptions: {
				project: true,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
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

	// ⬇ MUST be last: disables any remaining conflicting stylistic rules
	eslintConfigPrettier,
];
