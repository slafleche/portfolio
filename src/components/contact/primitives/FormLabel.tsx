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
  requiredText = 'required',
}: FormLabelProps) {
  return (
    <label className={clsx(s.labelRow, className)} htmlFor={htmlFor}>
      <span>{label}</span>
      {required ? (
        <span className={s.required}>
          <span aria-hidden="true">*</span>
          <span data-visible="sr-only">{requiredText}</span>
        </span>
      ) : null}
    </label>
  );
}
