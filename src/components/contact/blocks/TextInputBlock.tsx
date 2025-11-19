import { forwardRef, useId } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import clsx from 'clsx';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import { FormHint } from '@/components/contact/primitives/FormHint';
import { TextInput } from '@/components/contact/primitives/TextInput';
import * as s from '@/styles/components/forms.css';

type BaseProps = {
  blockKey: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  type?: string;
  autoComplete?: string;
  className?: string;
};

type TextInputBlockProps =
  | (BaseProps & { required?: false; requiredText?: string })
  | (BaseProps & { required: true; requiredText: string });

export const TextInputBlock = forwardRef<
  HTMLInputElement,
  TextInputBlockProps
>(
  (
    {
      blockKey,
      label,
      value,
      onChange,
      onBlur,
      required,
      helperText,
      errorText,
      readOnly,
      disabled,
      maxLength,
      minLength,
  type = 'text',
  autoComplete,
  className,
  requiredText,
},
    ref,
  ) => {
    const inputId = useId();
    const hintId = `${blockKey}-hint`;
    return (
      <div className={clsx(s.fieldGroup, className)}>
        <FormLabel
          htmlFor={inputId}
          label={label}
          required={required}
          requiredText={requiredText}
        />
        <TextInput
          id={inputId}
          ref={ref}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          type={type}
          autoComplete={autoComplete}
          aria-describedby={hintId}
          aria-invalid={errorText ? 'true' : undefined}
        />
        <FormHint tone={errorText ? 'error' : 'helper'} id={hintId}>
          {errorText || helperText}
        </FormHint>
      </div>
    );
  },
);
TextInputBlock.displayName = 'TextInputBlock';
