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

export type MessageBlockProps = {
  id?: string;
  copy: MessageBlockLocale;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function MessageBlock({
  id,
  copy,
  helperText,
  errorText,
  readOnly,
  disabled,
  onFocusBefore,
  onFocusAfter,
}: MessageBlockProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const baseHeightRef = useRef<number | null>(null);
  const generatedId = useId();
  const textareaId = id ?? `${generatedId}-message`;
  const characterHintId = `${textareaId}-hint`;
  const linksHintId = `${textareaId}-links`;
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
        const minimum =
          baseHeightRef.current ?? node.scrollHeight;
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
    [value],
  );
  useFormBlock(
    useMemo(
      () => ({
        key: 'message',
        focus: () => textareaRef.current?.focus(),
        getValue: () => value,
        validate: () => evaluation.validation.ok,
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
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [
        copy.errors,
        evaluation,
        onFocusAfter,
        onFocusBefore,
        value,
      ],
    ),
  );

  const remainingCharacters = evaluation.remainingCharacters;

  const counterText = copy.counterTemplate.replace(
    '{count}',
    remainingCharacters.toString(),
  );
  const characterHint =
    remainingCharacters === 0 ? copy.maxCharactersMessage : counterText;
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

  return (
    <div className={clsx(s.fieldGroup)}>
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
        minLength={MESSAGE_MIN_LENGTH}
        maxLength={MESSAGE_MAX_LENGTH}
        aria-describedby={describedBy}
        aria-invalid={errorText ? 'true' : undefined}
        readOnly={readOnly}
        disabled={disabled}
      />
      <FormHint tone={errorText ? 'error' : 'helper'} id={characterHintId}>
        {errorText || helperText || characterHint}
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
