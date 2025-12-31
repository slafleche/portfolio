import { forwardRef, useMemo } from 'react';
import type { Ref } from 'react';
import * as s from '@/styles/components/messageCentre.css';
import { status, statusText } from '@/styles/components/forms.css.ts';
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
      ...messages.blocks,
    ],
    [
      messages.blocks,
    ],
  );

  const inlineCodes = useMemo(
    () => [
      ...(messages.blockCodes ?? []),
    ],
    [
      messages.blockCodes,
    ],
  );

  const globalMessage = useMemo(() => {
    if (messages.globals.length > 0) return messages.globals[0];
    if (messages.blocks.length === 1) return messages.blocks[0];
    if (messages.blocks.length > 1 && messages.messageFallback) {
      return messages.messageFallback;
    }
    return null;
  }, [
    messages.blocks,
    messages.globals,
    messages.messageFallback,
  ]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-form="messages"
    >
      {globalMessage ? (
        <div className={s.root} role="status" aria-live="polite">
          <span className={s.title}>{globalMessage}</span>
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
