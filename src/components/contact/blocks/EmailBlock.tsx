import { useMemo, useRef } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { EMAIL_PATTERN } from '@/modules/contactForm/validation.constants';

export type EmailBlockProps = {
  value: string;
  label: string;
  requiredText: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function EmailBlock({
  value,
  label,
  onChange,
  onBlur,
  helperText,
  requiredText,
  errorText,
  readOnly,
  disabled,
  maxLength,
  onFocusBefore,
  onFocusAfter,
}: EmailBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useFormBlock(
    useMemo(
      () => ({
        key: 'email',
        focus: () => inputRef.current?.focus(),
        getValue: () => value,
        validate: () => EMAIL_PATTERN.test(value.trim()),
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [onFocusAfter, onFocusBefore, value],
    ),
  );

  return (
    <TextInputBlock
      blockKey="email"
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      helperText={helperText}
      errorText={errorText}
      requiredText={requiredText}
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
