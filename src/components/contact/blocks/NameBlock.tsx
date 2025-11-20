import { useMemo, useRef } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';
import { evaluateNameField } from '@/modules/contactForm/validation';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';

export type NameBlockProps = {
  value: string;
  copy: NameBlockLocale;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function NameBlock({
  value,
  onChange,
  onBlur,
  readOnly,
  disabled,
  maxLength,
  minLength,
  onFocusBefore,
  onFocusAfter,
  copy,
}: NameBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const evaluation = useMemo(
    () => evaluateNameField(value),
    [value],
  );

  useFormBlock(
    useMemo(
      () => ({
        key: 'name',
        focus: () => inputRef.current?.focus(),
        getValue: () => value,
        validate: () => evaluation.validation.ok,
        getValidationSummary: () => {
          if (evaluation.validation.ok) return null;
          if (evaluation.validation.reason === 'too_long') {
            return copy.errors.tooLong;
          }
          return copy.errors.required;
        },
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [copy.errors, evaluation, onFocusAfter, onFocusBefore, value],
    ),
  );

  return (
    <TextInputBlock
      blockKey="name"
      label={copy.label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      requiredText={copy.requiredText}
      readOnly={readOnly}
      disabled={disabled}
      maxLength={maxLength ?? NAME_LIMIT.max}
      minLength={minLength ?? NAME_LIMIT.min}
      ref={inputRef}
      required
    />
  );
}
