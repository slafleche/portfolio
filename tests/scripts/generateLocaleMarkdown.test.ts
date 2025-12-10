import { describe, expect, it, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildFileContents,
  readMarkdownFiles,
  serializeMarkdownMessages,
} from '../../scripts/generateLocaleMarkdown';

const tempRoot = path.join(os.tmpdir(), 'markdown-tests');
let tempDir: string;

async function ensureTempDir() {
  if (!tempDir) {
    await fs.mkdir(tempRoot, { recursive: true });
    tempDir = await fs.mkdtemp(path.join(tempRoot, 'run-'));
  }
  return tempDir;
}

afterAll(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('generateLocaleMarkdown helpers', () => {
  it('reads markdown files and groups content by locale', async () => {
    const dir = await ensureTempDir();
    await fs.writeFile(
      path.join(dir, 'en-home-intro_content.md'),
      '# Hello EN\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'fr-home-intro_content.md'),
      '# Bonjour FR\n',
      'utf8',
    );

    const { messages, keys } = await readMarkdownFiles(dir);
    expect(Array.from(keys)).toEqual([
      'intro-content',
    ]);
    expect(messages.en?.['intro-content']).toContain('Hello');
    expect(messages.fr?.['intro-content']).toContain('Bonjour');
  });

  it('serializes markdown messages deterministically', () => {
    const serialized = serializeMarkdownMessages({
      en: { 'foo-key': '# Foo' },
      fr: { 'foo-key': '# Bar' },
    });
    expect(serialized).toContain(`"en"`);
    expect(serialized).toContain(`"foo-key": "# Foo"`);
  });

  it('produces bannered TypeScript output', () => {
    const output = buildFileContents(
      {
        en: { intro: '# Hi' },
        fr: { intro: '# Salut' },
      },
      new Set([
        'intro',
      ]),
    );
    expect(output.startsWith('// AUTO-GENERATED')).toBe(true);
    expect(output).toContain('export const MARKDOWN_MESSAGE_KEYS');
  });
});
