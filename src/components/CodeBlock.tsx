import { clsx } from 'clsx';
import {
  Highlight,
  type Language,
  themes,
  type Token,
} from 'prism-react-renderer';
import type { ComponentPropsWithoutRef } from 'react';
import { Fragment } from 'react';

import * as s from '@/styles/components/code.css';

type CodeBlockProps = {
  code: string;
  language?: string | null;
} & Omit<ComponentPropsWithoutRef<'pre'>, 'children'>;

const toPrismLanguage = (
  raw: string | null | undefined,
): Language => {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return 'text';

  const map: Record<string, Language> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
  };

  return map[value] ?? value;
};

export default function CodeBlock({
  code,
  language,
  className,
  ...preProps
}: CodeBlockProps) {
  return (
    <div className={clsx(s.root, s.code)}>
      <Highlight
        code={code}
        language={toPrismLanguage(language)}
        theme={themes.nightOwl}
      >
        {({
          className: prismClassName,
          tokens,
          getLineProps,
          getTokenProps,
        }) => {
          const rawLines = code.replace(/\r\n/g, '\n').split('\n');
          const lines = tokens.slice(0, rawLines.length);

          return (
            <pre
              {...preProps}
              data-code="block"
              data-ui="code-block"
              data-language={language ?? ''}  
              className={clsx(className, prismClassName)}
            >
              <code data-code="block" data-ui="code-block">
                {rawLines.map((_, lineIndex: number) => {
                  const line: Token[] = lines[lineIndex] ?? [];
                  const isLastLine =
                    lineIndex === rawLines.length - 1;
                  const lineContent = line
                    .map((token) => token.content)
                    .join('');
                  const lineHasTrailingNewline =
                    lineContent.endsWith('\n');

                  return (
                    <Fragment key={lineIndex}>
                      <div {...getLineProps({ line })}>
                        {line.map((token, tokenIndex) => (
                          <span
                            key={tokenIndex}
                            {...getTokenProps({ token })}
                          />
                        ))}
                      </div>
                      {!isLastLine && !lineHasTrailingNewline
                        ? '\n'
                        : null}
                    </Fragment>
                  );
                })}
              </code>
            </pre>
          );
        }}
      </Highlight>
    </div>
  );
}
