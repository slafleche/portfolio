import { clsx } from 'clsx';
import {
  Highlight,
  type Language,
  themes,
  type Token,
} from 'prism-react-renderer';
import type { ComponentPropsWithoutRef } from 'react';

import * as s from '@/styles/components/code.css';

import { textStyleVars } from '../tokens/textStyles.tokens';

type CodeBlockProps = {
  code: string;
  language?: string | null;
} & Omit<ComponentPropsWithoutRef<'pre'>, 'children'>;

const normalizeCodeForPrism = (value: string): string => {
  const normalized = value.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  let start = 0;
  let end = lines.length;

  while (start < end && (lines[start]?.trim() ?? '') === '') {
    start += 1;
  }

  while (end > start && (lines[end - 1]?.trim() ?? '') === '') {
    end -= 1;
  }

  return lines.slice(start, end).join('\n');
};

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
  const normalizedCode = normalizeCodeForPrism(code);

  const theme = {
    ...themes.nightOwl,
    styles: themes.nightOwl.styles.map((rule) =>
	      rule.types.includes('comment')
	        ? {
	            ...rule,
	            style: {
	              ...rule.style,
	              color: textStyleVars.code.block.colors.comments.css(),
	            },
	          }
	        : rule,
	    ),
	  } as typeof themes.nightOwl;

  return (
    <div className={clsx(s.root, s.code)}>
      <Highlight
        code={normalizedCode}
        language={toPrismLanguage(language)}
        theme={theme}
      >
        {({ className: prismClassName, tokens, getTokenProps }) => {
          const rawLines = normalizedCode.split('\n');
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

                  return (
                    <span key={lineIndex}>
                      {line.map((token, tokenIndex) => {
                        const { children, ...props } = getTokenProps({
                          token,
                        });

                        return (
                          <span key={tokenIndex} {...props}>
                            {typeof children === 'string'
                              ? children.replaceAll('\n', '')
                              : children}
                          </span>
                        );
                      })}
                      {!isLastLine ? '\n' : null}
                    </span>
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
