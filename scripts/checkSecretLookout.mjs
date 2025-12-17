#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  SECRET_API_KEY_PATTERNS,
  SECRET_EMAIL_PATTERN,
  SECRET_EMAIL_WHITELIST_PATTERNS,
  SECRET_EMAIL_WHITELIST_STRINGS,
  SECRET_LOOKOUT_IGNORE_PATH_SUBSTRINGS,
  SECRET_LOOKOUT_SCAN_EXTENSIONS,
  SECRET_LOOKOUT_SCAN_PATH_SUBSTRINGS,
} from './lint/secretLookoutRules.mjs';
import {
  scanAllRuntimeConfigUsage,
  scanRuntimeEnvUsageInTests,
} from './checkRuntimeConfig.mjs';

const ROOT = path.resolve(process.cwd());

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getAllTrackedFiles() {
  const output = execSync('git ls-files', {
    encoding: 'utf-8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getEnvFiles() {
  const candidates = [
    '.env',
    '.env.local',
    '.env.prod',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
  ];
  const existing = [];
  for (const candidate of candidates) {
    const fullPath = path.join(ROOT, candidate);
    if (existsSync(fullPath)) {
      existing.push(candidate);
    }
  }
  return existing;
}

function readFile(filePath) {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf-8');
}

function shouldScanFile(relativePath) {
  const posix = relativePath.split(path.sep).join('/');

  if (
    SECRET_LOOKOUT_IGNORE_PATH_SUBSTRINGS.some((marker) =>
      posix.includes(marker),
    )
  ) {
    return false;
  }

  const ext = path.extname(posix).toLowerCase();
  const matchesExt = SECRET_LOOKOUT_SCAN_EXTENSIONS.includes(ext);
  const matchesPath = SECRET_LOOKOUT_SCAN_PATH_SUBSTRINGS.some((segment) =>
    posix.includes(segment),
  );

  return matchesExt || matchesPath;
}

function isEmailWhitelisted(email) {
  if (SECRET_EMAIL_WHITELIST_STRINGS.includes(email)) {
    return true;
  }

  for (const pattern of SECRET_EMAIL_WHITELIST_PATTERNS) {
    if (pattern.test(email)) return true;
  }

  return false;
}

function* findEmails(line) {
  const emailRegex = new RegExp(
    SECRET_EMAIL_PATTERN.source,
    SECRET_EMAIL_PATTERN.flags.includes('i') ? 'gi' : 'g',
  );
  let match;
  while ((match = emailRegex.exec(line)) !== null) {
    yield match[0];
  }
}

function* findApiKeyMatches(line) {
  for (const pattern of SECRET_API_KEY_PATTERNS) {
    const regex = new RegExp(
      pattern.regex.source,
      pattern.regex.flags.includes('i') ? 'gi' : 'g',
    );
    let match;
    while ((match = regex.exec(line)) !== null) {
      yield {
        pattern,
        value: match[0],
      };
    }
  }
}

function scanFile(relativePath, content) {
  const violations = [];
  const posix = relativePath.split(path.sep).join('/');
  const lines = content.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    // Email detection with whitelisting.
    for (const email of findEmails(line)) {
      if (isEmailWhitelisted(email)) continue;

      violations.push({
        type: 'email',
        filePath: posix,
        lineNumber,
        value: email,
        message: `Potential email address "${email}"`,
      });
    }

    // API key detection with pattern-level whitelists.
    for (const { pattern, value } of findApiKeyMatches(line)) {
      if (pattern.allowedValues?.includes(value)) continue;
      if (
        pattern.allowedPathSubstrings?.some((marker) =>
          posix.includes(marker),
        )
      ) {
        continue;
      }

      violations.push({
        type: 'api-key',
        filePath: posix,
        lineNumber,
        value,
        patternId: pattern.id,
        description: pattern.description,
        message: `Potential API key (${pattern.description})`,
      });
    }
  }

  return violations;
}

function scanTestRuntimeEnvViolations(relativePath, content) {
  const testViolations = scanRuntimeEnvUsageInTests(
    relativePath,
    content,
  );
  if (!testViolations.length) return [];

  const lines = content.split('\n');

  return testViolations.map((violation) => {
    const snippet =
      lines[violation.lineNumber - 1] ?? '';

    return {
      type: 'runtime-env-test',
      filePath: violation.filePath,
      lineNumber: violation.lineNumber,
      value: snippet.trim(),
      ruleId: violation.rule.id,
      description: violation.rule.description,
      message: violation.message,
    };
  });
}

const RUNTIME_CONFIG_SCAN_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
];

function scanRuntimeConfigViolations(relativePath, content) {
  const posix = relativePath.split(path.sep).join('/');

  if (
    posix.includes('/tests/') ||
    posix.startsWith('tests/') ||
    posix.startsWith('scripts/lint/') ||
    posix === 'scripts/checkRuntimeConfig.mjs'
  ) {
    return [];
  }

  const ext = path.extname(posix).toLowerCase();
  if (!RUNTIME_CONFIG_SCAN_EXTENSIONS.includes(ext)) {
    return [];
  }

  const configViolations = scanAllRuntimeConfigUsage(
    relativePath,
    content,
  );
  if (!configViolations.length) {
    return [];
  }

  const lines = content.split('\n');

  return configViolations.map((violation) => {
    const snippet =
      lines[violation.lineNumber - 1] ?? '';

    return {
      type: 'runtime-config',
      filePath: violation.filePath,
      lineNumber: violation.lineNumber,
      value: snippet.trim(),
      ruleId: violation.rule.id,
      description: violation.rule.description,
      message: violation.message,
    };
  });
}

function colorPathSegment(text) {
  if (!process.stderr.isTTY) {
    return text;
  }
  const CYAN = '\x1b[36m';
  const RESET = '\x1b[0m';
  return `${CYAN}${text}${RESET}`;
}

function colorSnippet(text) {
  if (!process.stderr.isTTY) {
    return text;
  }
  const MAGENTA = '\x1b[35m';
  const RESET = '\x1b[0m';
  return text.replace(
    /\b[A-Z][A-Z0-9_]*\b/g,
    (token) => `${MAGENTA}${token}${RESET}`,
  );
}

function formatViolations(violations) {
  if (!violations.length) return;

  console.error('\nSecret lookout failed:\n');

  for (const violation of violations) {
    const { type, filePath, lineNumber, message, value } = violation;
    const kindLabel =
      type === 'api-key'
        ? 'API key'
        : type === 'runtime-env-test'
          ? 'runtime env in tests'
          : type === 'runtime-config'
            ? 'runtime env in code'
            : 'email';
    const location = colorPathSegment(`${filePath}:${lineNumber}`);
    console.error(` - [${kindLabel}] ${location} — ${message}`);
    const snippet =
      type === 'runtime-config' || type === 'runtime-env-test'
        ? colorSnippet(value)
        : value;
    console.error(`   Snippet: ${snippet}`);
  }

  console.error(
    '\nRemove or rotate the secret, or whitelist safe test values/domains in scripts/lint/secretLookoutRules.mjs before committing.',
  );
}

function main() {
  const useAll =
    process.env.SECRET_LOOKOUT_ALL === '1' ||
    process.argv.includes('--all');

  const includeEnv =
    process.env.SECRET_LOOKOUT_INCLUDE_ENV === '1';

  const baseFiles = useAll
    ? getAllTrackedFiles()
    : getStagedFiles();

  const targetFiles = [...baseFiles];
  if (useAll && includeEnv) {
    for (const envPath of getEnvFiles()) {
      if (!targetFiles.includes(envPath)) {
        targetFiles.push(envPath);
      }
    }
  }

  if (!targetFiles.length) {
    return 0;
  }

  const violations = [];

  for (const relativePath of targetFiles) {
    if (!shouldScanFile(relativePath)) continue;
    const fullPath = path.join(ROOT, relativePath);
    const content = readFile(fullPath);
    if (!content) continue;

    violations.push(...scanFile(relativePath, content));
    violations.push(
      ...scanTestRuntimeEnvViolations(relativePath, content),
    );
    violations.push(
      ...scanRuntimeConfigViolations(relativePath, content),
    );
  }

  if (violations.length) {
    formatViolations(violations);
    return 1;
  }

  return 0;
}

process.exitCode = main();
