import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import type { MessageCentreMessages } from '@/components/contact/messageCentre.types';
import { renderMessageCentre } from './helpers/messageCentre.harness';

const emptyMessages: MessageCentreMessages = {
  globals: [],
  blocks: [],
  toastFallback: undefined,
};

describe('Contact form message centre: MessageCentreBlock', () => {
  describe('rendering and accessibility', () => {
    it('renders a live-region shell with no inline text or toast when there are no messages', () => {
      const { getInlineRegion, queryToastRegion, container } =
        renderMessageCentre(emptyMessages);

      const liveRegion = getInlineRegion();

      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

      const statusWrapper = container.querySelector(
        '[data-visible]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;
      expect(statusWrapper.getAttribute('data-visible')).toBe('false');

      expect(liveRegion.textContent?.trim() ?? '').toBe('');
      expect(queryToastRegion()).toBeNull();
    });

    it('switches the inline status wrapper to visible when messages appear', () => {
      const messages: MessageCentreMessages = {
        globals: ['Global error'],
        blocks: [],
        toastFallback: undefined,
      };

      const { getInlineRegion, container } =
        renderMessageCentre(messages);

      const liveRegion = getInlineRegion();

      const statusWrapper = container.querySelector(
        '[data-visible]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;
      expect(statusWrapper.getAttribute('data-visible')).toBe('true');
      expect(liveRegion.textContent).toContain('Global error');
    });

    it('hides inline status and toast again when messages clear', () => {
      const messagesWithContent: MessageCentreMessages = {
        globals: ['Global error'],
        blocks: [],
        toastFallback: undefined,
      };

      const {
        container,
        getInlineRegion,
        queryToastRegion,
        rerenderWithMessages,
      } = renderMessageCentre(messagesWithContent);
      expect(queryToastRegion()).not.toBeNull();

      rerenderWithMessages(emptyMessages);

      const liveRegion = getInlineRegion();
      const statusWrapper = container.querySelector(
        '[data-visible]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;
      expect(statusWrapper.getAttribute('data-visible')).toBe('false');
      expect(liveRegion.textContent?.trim() ?? '').toBe('');
      expect(queryToastRegion()).toBeNull();
    });
  });

  describe('inline content shapes', () => {
    it('renders global messages inline in order', () => {
      const messages: MessageCentreMessages = {
        globals: ['First global', 'Second global'],
        blocks: [],
        toastFallback: undefined,
      };

      const { container } = renderMessageCentre(messages);

      const statusWrapper = container.querySelector(
        '[data-visible="true"]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;

      const spans = Array.from(
        statusWrapper.querySelectorAll('span'),
      );
      const texts = spans.map((span) => span.textContent?.trim());
      expect(texts).toEqual(['First global', 'Second global']);
    });

    it('renders block messages inline in order', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: ['Name error', 'Email error'],
        toastFallback: undefined,
      };

      const { container } = renderMessageCentre(messages);

      const statusWrapper = container.querySelector(
        '[data-visible="true"]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;

      const spans = Array.from(
        statusWrapper.querySelectorAll('span'),
      );
      const texts = spans.map((span) => span.textContent?.trim());
      expect(texts).toEqual(['Name error', 'Email error']);
    });

    it('renders globals before blocks when both are present', () => {
      const messages: MessageCentreMessages = {
        globals: ['Global summary'],
        blocks: ['Name error', 'Email error'],
        toastFallback: undefined,
      };

      const { container } = renderMessageCentre(messages);

      const statusWrapper = container.querySelector(
        '[data-visible="true"]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;

      const spans = Array.from(
        statusWrapper.querySelectorAll('span'),
      );
      const texts = spans.map((span) => span.textContent?.trim());
      expect(texts).toEqual([
        'Global summary',
        'Name error',
        'Email error',
      ]);
    });
  });

  describe('toast behaviour and shapes', () => {
    it('does not render a toast when there are no messages', () => {
      const { queryToastRegion } = renderMessageCentre(emptyMessages);
      expect(queryToastRegion()).toBeNull();
    });

    it('uses the first global message as the toast when globals are present', () => {
      const messages: MessageCentreMessages = {
        globals: ['Global one', 'Global two'],
        blocks: ['Block message'],
        toastFallback: 'Fallback summary',
      };

      const { queryToastRegion, getToastText } =
        renderMessageCentre(messages);

      const toastRegion = queryToastRegion();
      expect(toastRegion).not.toBeNull();
      if (!toastRegion) return;
      expect(getToastText()).toBe('Global one');
    });

    it('uses the single block message as the toast when there are no globals', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: ['Only block error'],
        toastFallback: undefined,
      };

      const { queryToastRegion, getToastText } =
        renderMessageCentre(messages);

      expect(queryToastRegion()).not.toBeNull();
      expect(getToastText()).toBe('Only block error');
    });

    it('does not render a toast when there are multiple block messages and no fallback', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: ['Block one', 'Block two'],
        toastFallback: undefined,
      };

      const { queryToastRegion } = renderMessageCentre(messages);

      expect(queryToastRegion()).toBeNull();
    });

    it('uses toastFallback as toast text when there are multiple block messages and no globals', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: ['Block one', 'Block two'],
        toastFallback: 'Summary toast',
      };

      const { queryToastRegion, getToastText } =
        renderMessageCentre(messages);

      expect(queryToastRegion()).not.toBeNull();
      expect(getToastText()).toBe('Summary toast');
    });

    it('removes the toast when messages change to a non-toast shape', () => {
      const messagesWithToast: MessageCentreMessages = {
        globals: [],
        blocks: ['Only block error'],
        toastFallback: undefined,
      };

      const { queryToastRegion, rerenderWithMessages } =
        renderMessageCentre(messagesWithToast);

      expect(queryToastRegion()).not.toBeNull();

      rerenderWithMessages(emptyMessages);

      expect(queryToastRegion()).toBeNull();
    });
  });
});
