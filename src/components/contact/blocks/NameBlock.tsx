import { useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';
import { evaluateNameField } from '@/modules/contactForm/validation';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import type { ContactFormBlockBaseProps } from '../types/form.types';

export type NameBlockProps = ContactFormBlockBaseProps & {
  copy: NameBlockLocale;
  maxLength?: number;
  minLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function NameBlock({
  id,
  order,
  required = true,
  disabled,
  maxLength,
  minLength,
  onFocusBefore,
  onFocusAfter,
  copy,
}: NameBlockProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const evaluation = useMemo(
    () => evaluateNameField(value),
    [value],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

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
    <div id={id} data-order={order}>
      <TextInputBlock
        blockKey="name"
        label={copy.label}
        value={value}
        onChange={handleChange}
        requiredText={copy.requiredText}
        disabled={disabled}
        maxLength={maxLength ?? NAME_LIMIT.max}
        minLength={minLength ?? NAME_LIMIT.min}
        ref={inputRef}
        required={required}
        />
    </div>
  );
}
