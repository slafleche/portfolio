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

    const tokenLines = Array.from(
      container.querySelectorAll(
        'pre[data-ui="code-block"] div.token-line',
      ),
    );

    expect(tokenLines.length).toBeGreaterThan(0);
    expect((tokenLines[0]?.textContent ?? '').trim()).not.toBe('');
    expect(
      (tokenLines.at(-1)?.textContent ?? '').trim(),
    ).not.toBe('');
  });
});
