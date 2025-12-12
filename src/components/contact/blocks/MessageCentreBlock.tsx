import { forwardRef, useMemo } from 'react';
import type { Ref } from 'react';
import * as s from '@/styles/components/forms.css';
import type { MessageCentreMessages } from '../messageCentre.types';

type MessageCentreBlockProps = {
  messages: MessageCentreMessages;
};

export const MessageCentreBlock = forwardRef<
  HTMLDivElement,
  MessageCentreBlockProps
>(function MessageCentreBlock({ messages }, ref) {
  const inlineMessages = useMemo(
    () => [
      ...messages.globals,
      ...messages.blocks,
    ],
    [
      messages.blocks,
      messages.globals,
    ],
  );

  const inlineCodes = useMemo(
    () => [
      ...(messages.globalCodes ?? []),
      ...(messages.blockCodes ?? []),
    ],
    [
      messages.globalCodes,
      messages.blockCodes,
    ],
  );

  const globalMessage = useMemo(() => {
    if (messages.globals.length > 0) return messages.globals[0];
    if (messages.blocks.length === 1) return messages.blocks[0];
    if (messages.blocks.length > 1 && messages.toastFallback) {
      return messages.toastFallback;
    }
    return null;
  }, [
    messages.blocks,
    messages.globals,
    messages.toastFallback,
  ]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-form="messages"
    >
      {globalMessage ? (
        <div className={s.toastRoot} role="status" aria-live="polite">
          <span className={s.toastTitle}>{globalMessage}</span>
        </div>
      ) : null}
      <div
        className={s.statusWrapper}
        data-visible={inlineMessages.length ? 'true' : 'false'}
      >
        {inlineMessages.length ? (
          <div ref={ref as Ref<HTMLDivElement>} className={s.status}>
            {inlineMessages.map((line, index) => {
              const code = inlineCodes[index];
              return (
                <span
                  key={`${index}-${line}`}
                  className={s.statusText}
                  data-error={code ?? undefined}
                >
                  {line}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
});
