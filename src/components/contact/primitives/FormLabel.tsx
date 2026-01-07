import clsx from 'clsx';
import type { ReactNode } from 'react';

import { notRelease } from '@/lib/runtimeEnv';
import * as s from '@/styles/components/forms.css';

type FormLabelProps = {
  className?: string;
  htmlFor: string;
  label: ReactNode;
  required?: boolean;
  requiredText?: string;
};

export function FormLabel({
  className,
  htmlFor,
  label,
  required,
  requiredText,
}: FormLabelProps) {
  if (required && !requiredText && notRelease()) {
    throw new Error(
      `FormLabel for "${htmlFor}" is marked as required but is missing requiredText.`,
    );
  }
  return (
    <label
      data-form="label"
      className={clsx(s.labelRow, className)}
      htmlFor={htmlFor}
    >
      <span className={s.label} data-form="label-text">{label}</span>
      {required ? (
        <span data-form="label-required" className={s.required}>
          {requiredText && (
            <span data-visible="sc-only">{requiredText}</span>
          )}
          *
        </span>
      ) : null}
    </label>
  );
}
