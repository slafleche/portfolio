import type { Ref } from 'react';
import { forwardRef, useMemo } from 'react';

import * as s from '@/styles/components/messageCentre.css';

import { renderInlineMarkdown } from '../../Markdown';
import type { MessageCentreMessages } from '../messageCentre.types';

type MessageCentreBlockProps = {
  messages: MessageCentreMessages;
};

const inlineMarkdownOptions = {
  openLinksInNewTab: false,
  asUi: {},
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

  const isEmpty = !globalMessage && inlineMessages.length === 0;

  const globalMessageContainer = (
    <div className={s.main} role="status" aria-live="polite">
      <span className={s.title}>
        {renderInlineMarkdown(
          globalMessage || '',
          inlineMarkdownOptions,
          'message-centre-global',
        )}
      </span>
    </div>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-form="messages"
      data-empty={isEmpty ? 'true' : 'false'}
      className={s.root}
    >
      {!isEmpty ? (
        <>
          {globalMessageContainer}
          <div
            className={s.statusWrapper}
            data-visible={inlineMessages.length ? 'true' : 'false'}
          >
            {inlineMessages.length > 1 ? (
              <ul data-mc="errors" className={s.status}>
                {inlineMessages.map((line, index) => {
                  const code = inlineCodes[index];
                  return (
                    <li
                      key={`${index}-${line}`}
                      className={s.statusText}
                      data-mc="error"
                      data-error={code ?? undefined}
                    >
                      {renderInlineMarkdown(
                        line,
                        inlineMarkdownOptions,
                        `message-centre-inline-${index}`,
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : inlineMessages.length === 1 ? (
              <div
                ref={ref as Ref<HTMLDivElement>}
                className={s.status}
                data-mc="errors"
              >
                <div
                  className={s.statusText}
                  data-mc="error"
                  data-error={inlineCodes[0] ?? undefined}
                >
                  {renderInlineMarkdown(
                    inlineMessages[0],
                    inlineMarkdownOptions,
                    'message-centre-inline-single',
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
});
