import { Fragment } from 'react';
import type { ReactNode } from 'react';
import * as s from '@/styles/components/forms.css';

type FormErrorProps = {
  children: ReactNode;
  /** Inline error content (already localized/formatted). */
  error?: ReactNode;
  /** Optional ID wired to aria-describedby on the control. */
  errorId?: string;
};

export function FormError({
  children,
  error,
  errorId,
}: FormErrorProps) {
  return (
    <Fragment>
      {children}
      {error ? (
        <p id={errorId} className={s.errorText}>
          {error}
        </p>
      ) : null}
    </Fragment>
  );
}
