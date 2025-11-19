import { useMemo, useRef } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';

export type NameBlockProps = {
  value: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function NameBlock({
  value,
  label,
  onChange,
  onBlur,
  helperText,
  errorText,
  readOnly,
  disabled,
  maxLength,
  minLength,
  onFocusBefore,
  onFocusAfter,
}: NameBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useFormBlock(
    useMemo(
      () => ({
        key: 'name',
        focus: () => inputRef.current?.focus(),
        getValue: () => value,
        validate: () => value.trim().length > 0,
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [onFocusAfter, onFocusBefore, value],
    ),
  );

  return (
    <TextInputBlock
      blockKey="name"
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      helperText={helperText}
      errorText={errorText}
      readOnly={readOnly}
      disabled={disabled}
      maxLength={maxLength ?? NAME_LIMIT.max}
      minLength={minLength ?? NAME_LIMIT.min}
      ref={inputRef}
      required
    />
  );
}
