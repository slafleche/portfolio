import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler } from 'react';
import { TextInputBlock } from './TextInputBlock';
import { useFormBlock } from '../formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';
import { evaluateNameField } from '@/modules/contactForm/validation';
import type { NameValidationReason } from '@/modules/contactForm/validation';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
  ContactFormBlockInitialConfig,
} from '../types/form.types';

export type NameBlockProps = ContactFormBlockBaseProps & {
  copy: NameBlockLocale;
  maxLength?: number;
  minLength?: number;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
  initialConfig?: ContactFormBlockInitialConfig<string>;
};

const NAME_ERRORS = {
  empty: {
    code: 'form-error-name-required' as const,
    getText: (copy: NameBlockLocale) => copy.errors.required,
  },
  too_short: {
    code: 'form-error-name-required' as const,
    getText: (copy: NameBlockLocale) => copy.errors.required,
  },
  too_long: {
    code: 'form-error-name-too_long' as const,
    getText: (copy: NameBlockLocale) => copy.errors.tooLong,
  },
} as const satisfies Record<
  NameValidationReason,
  {
    code: string;
    getText: (copy: NameBlockLocale) => string;
  }
>;

type NameErrorKey = keyof typeof NAME_ERRORS;
type NameErrorCode = (typeof NAME_ERRORS)[NameErrorKey]['code'];

const getNameError = (
  evaluation: ReturnType<typeof evaluateNameField>,
  copy: NameBlockLocale,
): { code: NameErrorCode; text: string } | null => {
  const { validation } = evaluation;
  if (validation.ok) {
    return null;
  }

  const config = NAME_ERRORS[validation.reason];
  const text = config.getText(copy);

  return {
    code: config.code,
    text,
  };
};

const buildNameValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateNameField>,
  copy: NameBlockLocale,
): ContactFormBlockValidationResult => {
  const error = getNameError(evaluation, copy);
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
  initialConfig,
}: NameBlockProps) {
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
    errorCode: NameErrorCode | null;
  } | null>(null);

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

  const registration = useMemo(() => {
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
        const error = getNameError(evaluation, copy);
        return error ? error.text : null;
      },
      liveValidation: liveValidationRegistration,
      getContract: () => contract,
    };
  }, [
    copy,
    evaluation,
    id,
    liveValidationRegistration,
    value,
  ]);

  const { continuousValidation, recordValidationResult } =
    useFormBlock(registration);

  const liveValidation = hasBlurred || continuousValidation;

  const nameError = getNameError(evaluation, copy);
  const localErrorText =
    liveValidation && nameError ? nameError.text : null;

  useEffect(() => {
    if (!liveValidation) {
      lastValidationStateRef.current = null;
      return;
    }

    const nextState = {
      valid: !nameError,
      errorCode: nameError ? nameError.code : null,
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
    const result = buildNameValidationResult(id, evaluation, copy);
    recordValidationResult(result);
  }, [
    copy,
    evaluation,
    id,
    liveValidation,
    nameError,
    recordValidationResult,
  ]);

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
