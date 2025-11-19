import type { ReactNode } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';

type FormHintTone = 'error' | 'helper';

type FormHintProps = {
  tone?: FormHintTone;
  id?: string;
  children?: ReactNode;
};

export function FormHint({ tone = "error", id, children }: FormHintProps) {
  if (!children) {
    return null;
  }
  return (
    <p
      id={id}
      className={clsx(
        tone === 'error' ? s.errorText : s.helperText,
      )}
    >
      {children}
    </p>
  );
}
