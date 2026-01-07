import { ESLint } from 'eslint';
import unusedImports from 'eslint-plugin-unused-imports';

const inputs = process.argv.slice(2);
const targets = inputs.length > 0 ? inputs : ['.'];

if (process.env.NODE_ENV !== 'development') {
  console.log(
    '[cleanup] Skipped: NODE_ENV is not "development".',
  );
  process.exit(0);
}

const eslint = new ESLint({
  fix: true,
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: [
        '**/*.{js,jsx,ts,tsx,mjs,cjs}',
      ],
      plugins: {
        'unused-imports': unusedImports,
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
