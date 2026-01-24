import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Markdown } from '@/components/Markdown';

describe('CodeBlock', () => {
  it('does not add empty first/last token lines', () => {
    const source = readFileSync(
      join(process.cwd(), 'tests/fixtures/codeblock-sample.md'),
      'utf8',
    );

    const { container } = render(<Markdown source={source} />);

    const codeBlock = container.querySelector(
      'pre[data-ui="code-block"] code',
    );

    const lines = (codeBlock?.textContent ?? '').split('\n');
    expect(lines.length).toBeGreaterThan(0);
    expect((lines[0] ?? '').trim()).not.toBe('');
    expect((lines.at(-1) ?? '').trim()).not.toBe('');
  });
});
