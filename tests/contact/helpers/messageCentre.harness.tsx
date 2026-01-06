import React from 'react';
import { render } from '@testing-library/react';
import { MessageCentreBlock } from '@/components/contact/blocks/MessageCentreBlock';
import type { MessageCentreMessages } from '@/components/contact/messageCentre.types';

export type MessageCentreHarnessResult = ReturnType<typeof render> & {
  getInlineRegion: () => HTMLElement;
  querymessageCentreRegion: () => HTMLElement | null;
  getmessageCentreText: () => string | null;
  rerenderWithMessages: (messages: MessageCentreMessages) => void;
};

export const renderMessageCentre = (
  messages: MessageCentreMessages,
): MessageCentreHarnessResult => {
  const renderResult = render(
    <MessageCentreBlock messages={messages} />,
  );

  const getInlineRegion = () => {
    const inlineRegion = renderResult.container.querySelector(
      '[role="status"][aria-atomic="true"]',
    );
    if (!inlineRegion) {
      throw new Error('Inline message-centre region not found');
    }
    return inlineRegion as HTMLElement;
  };

  const querymessageCentreRegion = () => {
    const messageCentreRegion = renderResult.container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    return messageCentreRegion as HTMLElement | null;
  };

  const getmessageCentreText = () => {
    const messageCentreRegion = querymessageCentreRegion();
    if (!messageCentreRegion) return null;
    return messageCentreRegion.textContent?.trim() ?? null;
  };

  const rerenderWithMessages = (
    nextMessages: MessageCentreMessages,
  ) => {
    renderResult.rerender(
      <MessageCentreBlock messages={nextMessages} />,
    );
  };

  return {
    ...renderResult,
    getInlineRegion,
    querymessageCentreRegion,
    getmessageCentreText,
    rerenderWithMessages,
  };
};
