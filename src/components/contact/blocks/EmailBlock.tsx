import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import {
  evaluateEmailField,
  type EmailValidationReason,
} from '@/modules/contactForm/validation';
import { EMAIL_MAX_LENGTH } from '@/modules/contactForm/validation.constants';
import type { EmailBlockLocale } from '@/lib/locales/form/form.email';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
  ContactFormBlockInitialConfig,
} from '../types/form.types';

export type EmailBlockProps = ContactFormBlockBaseProps & {
  copy: EmailBlockLocale;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
  initialConfig?: ContactFormBlockInitialConfig<string>;
};

const EMAIL_ERRORS = {
  empty: {
    code: 'form-error-email-invalid' as const,
    getText: (copy: EmailBlockLocale) => copy.errors.invalid,
  },
  invalid: {
    code: 'form-error-email-invalid' as const,
    getText: (copy: EmailBlockLocale) => copy.errors.invalid,
  },
} as const satisfies Record<
  EmailValidationReason,
  {
    code: string;
    getText: (copy: EmailBlockLocale) => string;
  }
>;

type EmailErrorKey = keyof typeof EMAIL_ERRORS;
type EmailErrorCode = (typeof EMAIL_ERRORS)[EmailErrorKey]['code'];

const getEmailError = (
  evaluation: ReturnType<typeof evaluateEmailField>,
  copy: EmailBlockLocale,
): { code: EmailErrorCode; text: string } | null => {
  const { validation } = evaluation;
  if (validation.ok) {
    return null;
  }

  const config = EMAIL_ERRORS[validation.reason];

  return {
    code: config.code,
    text: config.getText(copy),
  };
};

const buildEmailValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateEmailField>,
  copy: EmailBlockLocale,
): ContactFormBlockValidationResult => {
  const error = getEmailError(evaluation, copy);
  if (!error) {
    return {
      id,
      valid: true,
      messages: [],
    };
  }

  return {
    id,
    valid: false,
    messages: [
      {
        type: 'error',
        code: error.code,
        text: error.text,
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
  initialConfig,
}: EmailBlockProps) {
  const [
    value,
    setValue,
  ] = useState(() => initialConfig?.initialData ?? '');
  const [
    hasBlurred,
    setHasBlurred,
  ] = useState(() => Boolean(initialConfig?.validateOnMount));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastValidationStateRef = useRef<{
    valid: boolean;
    errorCode: EmailErrorCode | null;
  } | null>(null);
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

  const registration = useMemo(() => {
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
        const error = getEmailError(evaluation, copy);
        return error ? error.text : null;
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
  ]);

  const { continuousValidation, recordValidationResult } =
    useFormBlock(registration);

  const liveValidation = hasBlurred || continuousValidation;
  const emailError = getEmailError(evaluation, copy);
  const localErrorText =
    liveValidation && emailError ? emailError.text : null;

  useEffect(() => {
    if (!liveValidation) {
      lastValidationStateRef.current = null;
      return;
    }

    const nextState = {
      valid: !emailError,
      errorCode: emailError ? emailError.code : null,
    };

    const previousState = lastValidationStateRef.current;
    if (
      previousState &&
      previousState.valid === nextState.valid &&
      previousState.errorCode === nextState.errorCode
    ) {
      return;
    }

    lastValidationStateRef.current = nextState;
    const result = buildEmailValidationResult(id, evaluation, copy);
    recordValidationResult(result);
  }, [
    copy,
    emailError,
    evaluation,
    id,
    liveValidation,
    recordValidationResult,
  ]);

  return (
    <div id={id} data-order={order}>
      <TextInputBlock
        id={id}
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
