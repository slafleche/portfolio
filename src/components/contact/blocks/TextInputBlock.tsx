import clsx from 'clsx';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { forwardRef, useId } from 'react';

import { FormHint } from '@/components/contact/primitives/FormHint';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import { TextInput } from '@/components/contact/primitives/TextInput';
import * as s from '@/styles/components/forms.css';

import { OutlineForInput } from '../primitives/OutlineForInput';
import type { ContactFormBlockBaseProps } from '../types/form.types';

type BaseProps = Omit<ContactFormBlockBaseProps, 'order'> & {
  id: string;
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
  outlineClassName?: string;
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
      id,
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
      outlineClassName,
    },
    ref,
  ) => {
    const inputId = useId();
    const hintId = `${blockKey}-hint`;
    const hasHint = Boolean(errorText || helperText);
    return (
      <div id={id} className={clsx(s.fieldGroup, className)}>
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
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          type={type}
          autoComplete={autoComplete}
          aria-describedby={hasHint ? hintId : undefined}
          aria-invalid={errorText ? 'true' : undefined}
        />
        <FormHint
          tone={errorText ? 'error' : 'helper'}
          id={hasHint ? hintId : undefined}
        >
          {errorText || helperText}
        </FormHint>
      </div>
    );
  },
);
TextInputBlock.displayName = 'TextInputBlock';
