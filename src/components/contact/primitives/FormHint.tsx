import type { ReactNode } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';

type FormHintTone = 'error' | 'helper';

type FormHintProps = {
  tone?: FormHintTone;
  id?: string;
  children?: ReactNode;
};

export function FormHint({
  tone = 'error',
  id,
  children,
}: FormHintProps) {
  return (
    <p
      id={id}
      data-form-hint={tone}
      className={clsx(tone === 'error' ? s.errorText : s.helperText, { [s.empty]: !children })}
      aria-hidden={!children}
    >
      {children}
      {!children && '\u00A0'}
    </p>
  );
}
