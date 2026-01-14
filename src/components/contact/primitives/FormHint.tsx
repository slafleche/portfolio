import clsx from 'clsx';
import type { ReactNode } from 'react';

import * as s from '@/styles/components/forms.css';

import { renderInlineMarkdown } from '../../Markdown';

type FormHintTone = 'error' | 'helper';

type FormHintProps = {
  tone?: FormHintTone;
  id?: string;
  children?: ReactNode;
};

const inlineMarkdownOptions = {
  openLinksInNewTab: false,
  asUi: {},
};

export function FormHint({
  tone = 'error',
  id,
  children,
}: FormHintProps) {
  const content =
    typeof children === 'string'
      ? renderInlineMarkdown(
          children,
          inlineMarkdownOptions,
          `form-hint-${tone}`,
        )
      : children;

  return (
    <p
      id={id}
      data-form-hint={tone}
      className={clsx(tone === 'error' ? s.errorText : s.helperText, { [s.empty]: !children })}
      aria-hidden={!children}
    >
      {content}
      {!children && '\u00A0'}
    </p>
  );
}
