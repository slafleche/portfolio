import { useId, useMemo, useRef } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
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
  URL_PATTERN,
} from '@/modules/contactForm/validation.constants';

const countUrls = (value: string) => {
  const matches = value.match(URL_PATTERN);
  return matches ? matches.length : 0;
};

const createAutoResizeHandlers = (
  nodeRef: React.MutableRefObject<HTMLTextAreaElement | null>,
) => {
  let baseHeight: number | null = null;
  return {
    onInit: (node: HTMLTextAreaElement) => {
      nodeRef.current = node;
      if (baseHeight === null) {
        baseHeight = node.scrollHeight;
      }
    },
    onSync: () => {
      const node = nodeRef.current;
      if (!node) return;
      node.style.height = 'auto';
      const minimum = baseHeight ?? node.scrollHeight;
      node.style.height = `${Math.max(node.scrollHeight, minimum)}px`;
    },
  };
};

export type MessageBlockProps = {
  id?: string;
  value: string;
  label: string;
  requiredText: string;
  counterTemplate: string;
  maxCharactersMessage: string;
  urlUsageTemplate: string;
  maxUrlsMessage: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  helperText?: string | null;
  errorText?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  onFocusBefore?: () => void;
  onFocusAfter?: () => void;
};

export function MessageBlock({
  id,
  value,
  label,
  requiredText,
  counterTemplate,
  maxCharactersMessage,
  urlUsageTemplate,
  maxUrlsMessage,
  onChange,
  onBlur,
  helperText,
  errorText,
  readOnly,
  disabled,
  onFocusBefore,
  onFocusAfter,
}: MessageBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const generatedId = useId();
  const textareaId = id ?? `${generatedId}-message`;
  const characterHintId = `${textareaId}-hint`;
  const linksHintId = `${textareaId}-links`;
  const autoResizeHandlers = useMemo(
    () => createAutoResizeHandlers(textareaRef),
    [],
  );

  useFormBlock(
    useMemo(
      () => ({
        key: 'message',
        focus: () => textareaRef.current?.focus(),
        getValue: () => value,
        validate: () => {
          const length = value.length;
          if (length === 0) return false;
          if (length < MESSAGE_MIN_LENGTH) return false;
          if (length > MESSAGE_MAX_LENGTH) return false;
          if (countUrls(value) > MESSAGE_URL_LIMIT) return false;
          return true;
        },
        requestFocusBefore: onFocusBefore ?? (() => {}),
        requestFocusAfter: onFocusAfter ?? (() => {}),
      }),
      [
        onFocusAfter,
        onFocusBefore,
        value,
      ],
    ),
  );

  const remainingCharacters = Math.max(
    0,
    MESSAGE_MAX_LENGTH - value.length,
  );

  const counterText = counterTemplate.replace(
    '{count}',
    remainingCharacters.toString(),
  );
  const characterHint =
    remainingCharacters === 0 ? maxCharactersMessage : counterText;
  const urlCount = countUrls(value);
  const showLinksHint = urlCount > 0;
  const linksHint = showLinksHint
    ? urlCount >= MESSAGE_URL_LIMIT
      ? maxUrlsMessage
      : urlUsageTemplate
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
        label={label}
        required
        requiredText={requiredText}
      />
      <TextareaInput
        id={textareaId}
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          autoResizeHandlers.onInit(event.currentTarget);
          autoResizeHandlers.onSync();
          onChange(event);
        }}
        onBlur={onBlur}
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
