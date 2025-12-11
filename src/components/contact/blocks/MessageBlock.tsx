import { useId, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { TextareaInput } from '@/components/contact/primitives/TextareaInput';
import { FormHint } from '@/components/contact/primitives/FormHint';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import * as s from '@/styles/components/forms.css';
import { useFormBlock } from '../formBlocks.context';
import {
  MESSAGE_URL_LIMIT,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
} from '@/modules/contactForm/validation.constants';
import { evaluateMessageField } from '@/modules/contactForm/validation';
import type { MessageBlockLocale } from '@/lib/locales/form/form.message';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
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
};

const buildMessageValidationResult = (
  id: string,
  evaluation: ReturnType<typeof evaluateMessageField>,
  copy: MessageBlockLocale,
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

  const code =
    reason === 'too_short'
      ? 'form-error-message-too_short'
      : reason === 'too_long'
        ? 'form-error-message-too_long'
        : reason === 'too_many_links'
          ? 'form-error-message-too_many_links'
          : 'form-error-message-required';

  const text =
    reason === 'too_short'
      ? copy.errors.tooShort
      : reason === 'too_long'
        ? copy.errors.tooLong
        : reason === 'too_many_links'
          ? copy.errors.tooManyLinks
          : copy.errors.required;

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
}: MessageBlockProps) {
  const [
    value,
    setValue,
  ] = useState('');
  const [
    hasBlurred,
    setHasBlurred,
  ] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const baseHeightRef = useRef<number | null>(null);
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

  const {
    continuousValidation,
    recordValidationResult,
  } = useFormBlock(
    useMemo(() => {
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
        validate: () => {
          const result = contract.validate();
          recordValidationResult(result);
          return result.valid;
        },
        getValidationSummary: () => {
          if (evaluation.validation.ok) return null;
          const reason = evaluation.validation.reason;
          if (reason === 'too_short') {
            return copy.errors.tooShort;
          }
          if (reason === 'too_long') {
            return copy.errors.tooLong;
          }
          if (reason === 'too_many_links') {
            return copy.errors.tooManyLinks;
          }
          return copy.errors.required;
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
    ]),
  );

  const liveValidation = hasBlurred || continuousValidation;

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

  let localErrorText: string | null = null;
  if (!evaluation.validation.ok && liveValidation) {
    const reason = evaluation.validation.reason;
    if (reason === 'too_short') {
      localErrorText = copy.errors.tooShort;
    } else if (reason === 'too_long') {
      localErrorText = copy.errors.tooLong;
    } else if (reason === 'too_many_links') {
      localErrorText = copy.errors.tooManyLinks;
    } else {
      localErrorText = copy.errors.required;
    }
  }

  if (liveValidation) {
    const result = buildMessageValidationResult(
      id,
      evaluation,
      copy,
    );
    recordValidationResult(result);
  }

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
          tone={urlCount >= MESSAGE_URL_LIMIT ? 'error' : 'helper'}
          id={linksHintId}
        >
          {linksHint}
        </FormHint>
      ) : null}
    </div>
  );
}
