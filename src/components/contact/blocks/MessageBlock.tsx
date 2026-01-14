import clsx from 'clsx';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { FormHint } from '@/components/contact/primitives/FormHint';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import { TextareaInput } from '@/components/contact/primitives/TextareaInput';
import type { MessageBlockLocale } from '@/lib/locales/form/form.message';
import {
  evaluateMessageField,
  type MessageValidationReason,
} from '@/modules/contactForm/validation';
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  MESSAGE_URL_LIMIT,
} from '@/modules/contactForm/validation.constants';
import * as s from '@/styles/components/forms.css';

import { useFormBlock } from '../formBlocks.context';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockContract,
  ContactFormBlockInitialConfig,
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
} from '../types/form.types';


export type MessageBlockProps = ContactFormBlockBaseProps & {
  id: string;
  order: number;
  copy: MessageBlockLocale;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
  initialConfig?: ContactFormBlockInitialConfig<string>;
};

const MESSAGE_ERRORS = {
  empty: {
    code: 'form-error-message-required' as const,
    getText: (copy: MessageBlockLocale) => copy.errors.required,
  },
  too_short: {
    code: 'form-error-message-too_short' as const,
    getText: (copy: MessageBlockLocale) => copy.errors.tooShort,
  },
  too_long: {
    code: 'form-error-message-too_long' as const,
    getText: (copy: MessageBlockLocale) => copy.errors.tooLong,
  },
  too_many_links: {
    code: 'form-error-message-too_many_links' as const,
    getText: (copy: MessageBlockLocale) => copy.errors.tooManyLinks,
  },
} as const satisfies Record<
  MessageValidationReason,
  {
    code: string;
    getText: (copy: MessageBlockLocale) => string;
  }
>;

type MessageErrorKey = keyof typeof MESSAGE_ERRORS;
type MessageErrorCode =
  (typeof MESSAGE_ERRORS)[MessageErrorKey]['code'];

const getMessageError = (
  evaluation: ReturnType<typeof evaluateMessageField>,
  copy: MessageBlockLocale,
): { code: MessageErrorCode; text: string } | null => {
  const { validation } = evaluation;
  if (validation.ok) {
    return null;
  }

  const config = MESSAGE_ERRORS[validation.reason];
  const text = config.getText(copy);

  return {
    code: config.code,
    text,
  };
};

const buildMessageValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateMessageField>,
  copy: MessageBlockLocale,
): ContactFormBlockValidationResult => {
  const error = getMessageError(evaluation, copy);
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

const buildMessageContract = (
  id: string,
  value: string,
  evaluation: ReturnType<typeof evaluateMessageField>,
  copy: MessageBlockLocale,
): Omit<ContactFormBlockContract<string>, 'focus'> => ({
  validate: () => buildMessageValidationResult(id, evaluation, copy),
  getPayload: (): ContactFormBlockPayload<string> => ({
    id,
    value,
  }),
});

export function MessageBlock({
  id,
  order,
  copy,
  helperText,
  errorText,
  readOnly,
  disabled,
  initialConfig,
}: MessageBlockProps) {
  const [
    value,
    setValue,
  ] = useState(() => initialConfig?.initialData ?? '');
  const [
    hasBlurred,
    setHasBlurred,
  ] = useState(() => Boolean(initialConfig?.validateOnMount));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const baseHeightRef = useRef<number | null>(null);
  const lastValidationStateRef = useRef<{
    valid: boolean;
    errorCode: MessageErrorCode | null;
  } | null>(null);
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const textareaId = `${blockId}-input`;
  const characterHintId = `${blockId}-hint`;
  const linksHintId = `${blockId}-links`;
  const autoResizeHandlers = useMemo(
    () => ({
      onInit: (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (baseHeightRef.current === null) {
          baseHeightRef.current = node.scrollHeight;
        }
      },
      onSync: () => {
        const node = textareaRef.current;
        if (!node) return;
        node.style.height = 'auto';
        const minimum = baseHeightRef.current ?? node.scrollHeight;
        node.style.height = `${Math.max(
          node.scrollHeight,
          minimum,
        )}px`;
      },
    }),
    [],
  );
  const evaluation = useMemo(
    () => evaluateMessageField(value),
    [
      value,
    ],
  );
  const liveValidationRegistration = hasBlurred;

  const registration = useMemo(
    () => {
      const baseContract = buildMessageContract(
        id,
        value,
        evaluation,
        copy,
      );
      const contract: ContactFormBlockContract<string> = {
        ...baseContract,
        focus: () => {
          textareaRef.current?.focus();
        },
      };
      return {
        key: 'message',
        focus: contract.focus,
        getValue: () => value,
        validate: () => contract.validate().valid,
        getValidationSummary: () => {
          const error = getMessageError(evaluation, copy);
          return error ? error.text : null;
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
    hasSubmitAttempted,
    recordValidationResult,
  } = useFormBlock(registration);

  const liveValidation =
    continuousValidation || (hasBlurred && hasSubmitAttempted);

  const messageError = getMessageError(evaluation, copy);

  const remainingCharacters = evaluation.remainingCharacters;

  const counterText = copy.counterTemplate.replace(
    '{count}',
    remainingCharacters.toString(),
  );
  const characterHint =
    remainingCharacters === 0
      ? copy.maxCharactersMessage
      : counterText;
  const urlCount = evaluation.urlCount;
  const showLinksHint = urlCount > 0;
  const linksHint = showLinksHint
    ? urlCount >= MESSAGE_URL_LIMIT
      ? copy.maxUrlsMessage
      : copy.urlUsageTemplate
          .replace('{used}', urlCount.toString())
          .replace('{limit}', MESSAGE_URL_LIMIT.toString())
    : null;
  const describedBy = showLinksHint
    ? `${characterHintId} ${linksHintId}`
    : characterHintId;

  const localErrorText =
    liveValidation && messageError ? messageError.text : null;

  useEffect(() => {
    if (!liveValidation) {
      lastValidationStateRef.current = null;
      return;
    }

    const nextState = {
      valid: !messageError,
      errorCode: messageError ? messageError.code : null,
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

    const result = buildMessageValidationResult(
      id,
      evaluation,
      copy,
    );
    recordValidationResult(result);
  }, [
    copy,
    evaluation,
    id,
    liveValidation,
    messageError,
    recordValidationResult,
  ]);

  const effectiveErrorText = errorText ?? localErrorText;

  return (
    <div id={id} data-order={order} className={clsx(s.fieldGroup)}>
      <FormLabel
        htmlFor={textareaId}
        label={copy.label}
        required
        requiredText={copy.requiredText}
      />
      <TextareaInput
        id={textareaId}
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          autoResizeHandlers.onInit(event.currentTarget);
          autoResizeHandlers.onSync();
          setValue(event.currentTarget.value);
        }}
        onBlur={() => {
          if (!hasBlurred) {
            setHasBlurred(true);
          }
        }}
        minLength={MESSAGE_MIN_LENGTH}
        maxLength={MESSAGE_MAX_LENGTH}
        aria-describedby={describedBy}
        aria-invalid={effectiveErrorText ? 'true' : undefined}
        readOnly={readOnly}
        disabled={disabled}
      />
      <FormHint
        tone={effectiveErrorText ? 'error' : 'helper'}
        id={characterHintId}
      >
        {effectiveErrorText || helperText || characterHint}
      </FormHint>
      {showLinksHint && linksHint ? (
        <FormHint
          tone="helper"
          id={linksHintId}
        >
          {linksHint}
        </FormHint>
      ) : null}
    </div>
  );
}
