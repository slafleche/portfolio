#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.cwd());

const FORBIDDEN_PATTERNS = [
  {
    regex: /background(?:Color)?\s*:\s*['"]/,
    message: 'Use backgrounds(...) helper instead of raw background properties.',
  },
  {
    regex: /border(?:Radius)?\s*:\s*['"]/,
    message: 'Use borders(...) helper instead of raw border properties.',
  },
  {
    regex: /padding\s*:\s*['"]/,
    message: 'Use paddings(...) helper instead of raw padding properties.',
  },
  {
    regex: /margin\s*:\s*['"]/,
    message: 'Use margins(...) helper instead of raw margin properties.',
  },
];

const LAYER_IMPORT_BLOCKS = [
  {
    pattern: 'src/styles/helpers',
    regex: /from\s+['"]\.\.\/components\//,
    message: 'Helpers cannot import components.',
  },
  {
    pattern: 'src/styles/components',
    regex: /from\s+['"]\.\.\/modules\//,
    message: 'Components should not import modules directly.',
  },
  {
    pattern: 'src/modules',
    regex: /from\s+['"]\.\.\/styles\/components\//,
    message: 'Modules must not import component styles.',
  },
];

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function readFile(filePath) {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf-8');
}

function scanPatterns(filePath, content) {
  const violations = [];
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.regex.test(content)) {
      violations.push(`${filePath}: ${pattern.message}`);
    }
  }
  return violations;
}

function scanImports(filePath, content) {
  const violations = [];
  const posix = filePath.split(path.sep).join('/');
  for (const block of LAYER_IMPORT_BLOCKS) {
    if (posix.includes(block.pattern) && block.regex.test(content)) {
      violations.push(`${filePath}: ${block.message}`);
    }
  }
  return violations;
}

function main() {
  const staged = getStagedFiles();
  if (!staged.length) {
    return 0;
  }

  const errors = [];
  for (const relativePath of staged) {
    const ext = path.extname(relativePath).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) continue;
    const fullPath = path.join(ROOT, relativePath);
    const content = readFile(fullPath);
    errors.push(...scanPatterns(relativePath, content));
    errors.push(...scanImports(relativePath, content));
  }

  if (errors.length) {
    console.error('\nLint-staged guardrails failed:\n');
    for (const error of errors) {
      console.error(` - ${error}`);
    }
    console.error('\nPlease fix the issues above before committing.');
    return 1;
  }

  return 0;
}

process.exitCode = main();
