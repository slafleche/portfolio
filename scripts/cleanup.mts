import { ESLint } from 'eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { notHosted } from '../src/lib/runtimeEnv';
import tsParser from '@typescript-eslint/parser';

const inputs = process.argv.slice(2);
const targets = inputs.length > 0 ? inputs : ['.'];

if (!notHosted()) {
  console.log(
    '[cleanup] Skipped: hosted environment.',
  );
  process.exit(0);
}

const eslint = new ESLint({
  fix: true,
  overrideConfigFile: true,
  overrideConfig: [
    {
      ignores: [
        '**/.next/**',
        '**/tmp/**',
        '**/public/**/*.js',
      ],
      files: [
        '**/*.{js,jsx,ts,tsx,mjs,cjs}',
      ],
      plugins: {
        'unused-imports': unusedImports,
        'simple-import-sort': simpleImportSort,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: {
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
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    },
  ],
});

const results = await eslint.lintFiles(targets);
await ESLint.outputFixes(results);

const hasErrors = results.some(
  (result) => result.errorCount > 0,
);

if (hasErrors) {
  process.exit(1);
}
