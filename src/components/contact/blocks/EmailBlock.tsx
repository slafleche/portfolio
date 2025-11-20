import { useMemo, useRef } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { evaluateEmailField } from '@/modules/contactForm/validation';
import type { EmailBlockLocale } from '@/lib/locales/form/form.email';

export type EmailBlockProps = {
  value: string;
  copy: EmailBlockLocale;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function EmailBlock({
  value,
  onChange,
  onBlur,
  readOnly,
  disabled,
  maxLength,
  onFocusBefore,
  onFocusAfter,
  copy,
}: EmailBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const evaluation = useMemo(
    () => evaluateEmailField(value),
    [value],
  );

  useFormBlock(
    useMemo(
      () => ({
        key: 'email',
        focus: () => inputRef.current?.focus(),
        getValue: () => value,
        validate: () => evaluation.validation.ok,
        getValidationSummary: () => {
          if (evaluation.validation.ok) return null;
          return copy.errors.invalid;
        },
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [copy.errors.invalid, evaluation, onFocusAfter, onFocusBefore, value],
    ),
  );

  return (
    <TextInputBlock
      blockKey="email"
      label={copy.label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      requiredText={copy.requiredText}
      readOnly={readOnly}
      disabled={disabled}
      maxLength={maxLength}
      type="email"
      autoComplete="email"
      ref={inputRef}
      required
    />
  );
}
