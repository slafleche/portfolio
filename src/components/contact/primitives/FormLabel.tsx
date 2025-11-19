import type { ReactNode } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';

type FormLabelProps =
  | {
      className?: string;
      htmlFor: string;
      label: ReactNode;
      required?: false;
      requiredText?: string;
    }
  | {
      className?: string;
      htmlFor: string;
      label: ReactNode;
      required: true;
      requiredText: string;
    };

export function FormLabel({
  className,
  htmlFor,
  label,
  required,
  requiredText,
}: FormLabelProps) {
  return (
    <label className={clsx(s.labelRow, className)} htmlFor={htmlFor}>
      <span>{label}</span>
      {required ? (
        <span className={s.required}>
          <span aria-hidden="true">*</span>
          <span data-visible="sc-only">{requiredText}</span>
        </span>
      ) : null}
    </label>
  );
}
