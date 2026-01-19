import type { ChangeEventHandler } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import type { NameValidationReason } from '@/modules/contactForm/validation';
import { evaluateNameField } from '@/modules/contactForm/validation';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';

import { nameBlockOutline } from '../../../styles/components/forms.css';
import { useFormBlock } from '../formBlocks.context';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockContract,
  ContactFormBlockInitialConfig,
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
} from '../types/form.types';
import { TextInputBlock } from './TextInputBlock';

export type NameBlockProps = ContactFormBlockBaseProps & {
  copy: NameBlockLocale;
  logInputs?: boolean;
  logValidation?: boolean;
  logMessages?: boolean;
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
  disabled = false,
  maxLength,
  minLength,
  copy,
  logInputs = false,
  logValidation = false,
  logMessages = false,
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
  const hasLoggedInitRef = useRef(false);

  const evaluation = useMemo(
    () => evaluateNameField(value),
    [
      value,
    ],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    if (logInputs) {
      console.info('[contact][debug][name][change]', {
        value: nextValue,
      });
    }
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
        const node = inputRef.current;
        if (!node) return;
        try {
          node.focus({ preventScroll: true });
        } catch {
          node.focus();
        }
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

  const {
    continuousValidation,
    hasSubmitAttempted,
    recordValidationResult,
  } = useFormBlock(registration);

  const liveValidation =
    continuousValidation || (hasBlurred && hasSubmitAttempted);

  const nameError = getNameError(evaluation, copy);
  const localErrorText =
    liveValidation && nameError ? nameError.text : null;

  useEffect(() => {
    if (!logInputs || hasLoggedInitRef.current) return;
    const result = buildNameValidationResult(id, evaluation, copy);
    const payload: {
      value?: string;
      valid?: boolean;
      messages?: ContactFormBlockValidationResult['messages'];
    } = {
      value,
    };
    if (logValidation) {
      payload.valid = result.valid;
    }
    if (logMessages) {
      payload.messages = result.messages;
    }
    console.info('[contact][debug][name][init]', payload);
    hasLoggedInitRef.current = true;
  }, [
    copy,
    evaluation,
    id,
    logInputs,
    logMessages,
    logValidation,
    value,
  ]);

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
    if (logValidation || logMessages) {
      const payload: {
        value?: string;
        valid?: boolean;
        messages?: ContactFormBlockValidationResult['messages'];
      } = {};
      if (logInputs) {
        payload.value = value;
      }
      if (logValidation) {
        payload.valid = result.valid;
      }
      if (logMessages) {
        payload.messages = result.messages;
      }
      console.info('[contact][debug][name][validation]', payload);
    }
    recordValidationResult(result);
  }, [
    copy,
    evaluation,
    id,
    logInputs,
    logMessages,
    logValidation,
    liveValidation,
    nameError,
    recordValidationResult,
    value,
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
