import { useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { evaluateEmailField } from '@/modules/contactForm/validation';
import type { EmailBlockLocale } from '@/lib/locales/form/form.email';

export type EmailBlockProps = {
  copy: EmailBlockLocale;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function EmailBlock({
  readOnly,
  disabled,
  maxLength,
  onFocusBefore,
  onFocusAfter,
  copy,
}: EmailBlockProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const evaluation = useMemo(
    () => evaluateEmailField(value),
    [value],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

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
      onChange={handleChange}
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
