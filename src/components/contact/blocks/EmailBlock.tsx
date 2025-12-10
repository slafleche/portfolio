import { useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { evaluateEmailField } from '@/modules/contactForm/validation';
import { EMAIL_MAX_LENGTH } from '@/modules/contactForm/validation.constants';
import type { EmailBlockLocale } from '@/lib/locales/form/form.email';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
} from '../types/form.types';

export type EmailBlockProps = ContactFormBlockBaseProps & {
  copy: EmailBlockLocale;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

const buildEmailValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateEmailField>,
  copy: EmailBlockLocale,
): ContactFormBlockValidationResult => {
  const valid = evaluation.validation.ok;
  if (valid) {
    return {
      id,
      valid: true,
      messages: [],
    };
  }

  const code = 'form-error-email-invalid';
  const text = copy.errors.invalid;

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

const buildEmailContract = (
  id: string,
  value: string,
  evaluation: ReturnType<typeof evaluateEmailField>,
  copy: EmailBlockLocale,
): Omit<ContactFormBlockContract<string>, 'focus'> => ({
  validate: () => buildEmailValidationResult(id, evaluation, copy),
  getPayload: (): ContactFormBlockPayload<string> => ({
    id,
    value,
  }),
});

export function EmailBlock({
  id,
  order,
  readOnly,
  disabled,
  maxLength,
  copy,
}: EmailBlockProps) {
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
    () => evaluateEmailField(value),
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

  const { continuousValidation } = useFormBlock(
    useMemo(() => {
      const baseContract = buildEmailContract(
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
        key: 'email',
        focus: contract.focus,
        getValue: () => value,
        validate: () => contract.validate().valid,
        getValidationSummary: () => {
          if (evaluation.validation.ok) return null;
          return copy.errors.invalid;
        },
        liveValidation: liveValidationRegistration,
        getContract: () => contract,
      };
    }, [
      copy,
      evaluation,
      id,
      value,
      liveValidationRegistration,
    ]),
  );

  const liveValidation = hasBlurred || continuousValidation;

  const localErrorText =
    !evaluation.validation.ok && liveValidation
      ? copy.errors.invalid
      : null;

  return (
    <div id={id} data-order={order}>
      <TextInputBlock
        blockKey="email"
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
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength ?? EMAIL_MAX_LENGTH}
        type="email"
        autoComplete="email"
        ref={inputRef}
        required
      />
    </div>
  );
}
