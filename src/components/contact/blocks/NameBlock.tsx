import { useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';
import { evaluateNameField } from '@/modules/contactForm/validation';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
} from '../types/form.types';

export type NameBlockProps = ContactFormBlockBaseProps & {
  copy: NameBlockLocale;
  maxLength?: number;
  minLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

const buildNameValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateNameField>,
  copy: NameBlockLocale,
): ContactFormBlockValidationResult => {
  const valid = evaluation.validation.ok;
  if (valid) {
    return {
      id,
      valid: true,
      messages: [],
    };
  }

  const reason = evaluation.validation.reason;
  const isTooLong = reason === 'too_long';

  const code = isTooLong
    ? 'form-error-name-too_long'
    : 'form-error-name-required';

  const text = isTooLong ? copy.errors.tooLong : copy.errors.required;

  return {
    id,
    valid: false,
    messages: [
      {
        type: 'error',
        code,
        text,
        scrollTarget: id,
      },
    ],
  };
};

const buildNameContract = (
  id: string,
  value: string,
  evaluation: ReturnType<typeof evaluateNameField>,
  copy: NameBlockLocale,
): Omit<ContactFormBlockContract<string>, 'focus'> => ({
  validate: () => buildNameValidationResult(id, evaluation, copy),
  getPayload: (): ContactFormBlockPayload<string> => ({
    id,
    value,
  }),
});

export function NameBlock({
  id,
  order,
  required = true,
  disabled,
  maxLength,
  minLength,
  copy,
}: NameBlockProps) {
  const [
    value,
    setValue,
  ] = useState('');
  const [
    hasBlurred,
    setHasBlurred,
  ] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const evaluation = useMemo(
    () => evaluateNameField(value),
    [
      value,
    ],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setValue(event.target.value);
  };

  const liveValidationRegistration = hasBlurred;

  const registration = useMemo(
    () => {
      const baseContract = buildNameContract(
        id,
        value,
        evaluation,
        copy,
      );
      const contract: ContactFormBlockContract<string> = {
        ...baseContract,
        focus: () => {
          inputRef.current?.focus();
        },
      };
      return {
        key: 'name',
        focus: contract.focus,
        getValue: () => value,
        validate: () => contract.validate().valid,
        getValidationSummary: () => {
          if (evaluation.validation.ok) return null;
          if (evaluation.validation.reason === 'too_long') {
            return copy.errors.tooLong;
          }
          return copy.errors.required;
        },
        liveValidation: liveValidationRegistration,
        getContract: () => contract,
      };
    },
    [
      copy,
      evaluation,
      id,
      liveValidationRegistration,
      value,
    ],
  );

  const {
    continuousValidation,
    recordValidationResult,
  } = useFormBlock(registration);

  const liveValidation = hasBlurred || continuousValidation;

  let localErrorText: string | null = null;
  if (!evaluation.validation.ok && liveValidation) {
    if (evaluation.validation.reason === 'too_long') {
      localErrorText = copy.errors.tooLong;
    } else {
      localErrorText = copy.errors.required;
    }
  }

  if (liveValidation) {
    const result = buildNameValidationResult(id, evaluation, copy);
    recordValidationResult(result);
  }

  return (
    <div id={id} data-order={order}>
      <TextInputBlock
        id={id}
        blockKey="name"
        label={copy.label}
        value={value}
        onChange={handleChange}
        onBlur={() => {
          if (!hasBlurred) {
            setHasBlurred(true);
          }
        }}
        errorText={localErrorText}
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
