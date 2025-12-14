import type { ReactNode } from 'react';
import clsx from 'clsx';
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
  if (
    required &&
    !requiredText &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn(
      `FormLabel for "${htmlFor}" is missing requiredText.`,
    );
  }
  return (
    <label
      data-form="label"
      className={clsx(s.labelRow, className)}
      htmlFor={htmlFor}
    >
      <span data-form="label-text">{label}</span>
      {required ? (
        <span data-form="label-required" className={s.required}>
          {requiredText ? (
            <>
              <span aria-hidden="true">
                {requiredText}
              </span>
              <span data-visible="sc-only">{requiredText}</span>
              <span aria-hidden="true">
                {' '}
                *
              </span>
            </>
          ) : (
            <span aria-hidden="true">*</span>
          )}
        </span>
      ) : null}
    </label>
  );
}
