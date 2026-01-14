import { describe, expect,it } from 'vitest';

import type { MessageCentreMessages } from '@/components/contact/messageCentre.types';

import { renderMessageCentre } from './helpers/messageCentre.harness';

const emptyMessages: MessageCentreMessages = {
  globals: [],
  blocks: [],
  messageFallback: undefined,
};

describe('Contact form message centre: MessageCentreBlock', () => {
  describe('rendering and accessibility', () => {
    it('renders a live-region shell with no inline text or messageCentre when there are no messages', () => {
      const { getInlineRegion, querymessageCentreRegion, container } =
        renderMessageCentre(emptyMessages);

      const liveRegion = getInlineRegion();

      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

      const root = container.querySelector(
        '[data-form="messages"]',
      ) as HTMLDivElement | null;
      expect(root).not.toBeNull();
      if (!root) return;
      expect(root.getAttribute('data-empty')).toBe('true');

      expect(liveRegion.textContent?.trim() ?? '').toBe('');
      expect(querymessageCentreRegion()).toBeNull();
    });

    it('switches the inline status wrapper to visible when messages appear', () => {
      const messages: MessageCentreMessages = {
        globals: [
          'Global error',
        ],
        blocks: [],
        messageFallback: undefined,
      };

      const { getInlineRegion, container } =
        renderMessageCentre(messages);

      const liveRegion = getInlineRegion();

      const statusWrapper = container.querySelector(
        '[data-visible]',
      ) as HTMLDivElement | null;
      expect(statusWrapper).not.toBeNull();
      if (!statusWrapper) return;
      expect(statusWrapper.getAttribute('data-visible')).toBe(
        'false',
      );
      expect(liveRegion.textContent).toContain('Global error');
    });

    it('hides inline status and messageCentre again when messages clear', () => {
      const messagesWithContent: MessageCentreMessages = {
        globals: [
          'Global error',
        ],
        blocks: [],
        messageFallback: undefined,
      };

      const {
        container,
        getInlineRegion,
        querymessageCentreRegion,
        rerenderWithMessages,
      } = renderMessageCentre(messagesWithContent);
      expect(querymessageCentreRegion()).not.toBeNull();

      rerenderWithMessages(emptyMessages);

      const liveRegion = getInlineRegion();
      const root = container.querySelector(
        '[data-form="messages"]',
      ) as HTMLDivElement | null;
      expect(root).not.toBeNull();
      if (!root) return;
      expect(root.getAttribute('data-empty')).toBe('true');
      expect(liveRegion.textContent?.trim() ?? '').toBe('');
      expect(querymessageCentreRegion()).toBeNull();
    });
  });

  describe('inline content shapes', () => {
    it('renders global messages inline in order', () => {
      const messages: MessageCentreMessages = {
        globals: [
          'First global',
          'Second global',
        ],
        blocks: [],
        messageFallback: undefined,
      };

      const { container, getmessageCentreText } =
        renderMessageCentre(messages);

      const errorContainer = container.querySelector(
        '[data-mc="errors"]',
      ) as HTMLElement | null;
      expect(errorContainer).toBeNull();

      expect(getmessageCentreText()).toBe('First global');
    });

    it('renders block messages inline in order', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: [
          'Name error',
          'Email error',
        ],
        messageFallback: undefined,
      };

      const { container } = renderMessageCentre(messages);

      const errorContainer = container.querySelector(
        '[data-mc="errors"]',
      ) as HTMLElement | null;
      expect(errorContainer).not.toBeNull();
      if (!errorContainer) return;

      const errors = Array.from(
        errorContainer.querySelectorAll('[data-mc="error"]'),
      );
      const texts = errors.map((error) => error.textContent?.trim());
      expect(texts).toEqual([
        'Name error',
        'Email error',
      ]);
    });

    it('renders globals before blocks when both are present', () => {
      const messages: MessageCentreMessages = {
        globals: [
          'Global summary',
        ],
        blocks: [
          'Name error',
          'Email error',
        ],
        messageFallback: undefined,
      };

      const { container } = renderMessageCentre(messages);

      const errorContainer = container.querySelector(
        '[data-mc="errors"]',
      ) as HTMLElement | null;
      expect(errorContainer).not.toBeNull();
      if (!errorContainer) return;

      const errors = Array.from(
        errorContainer.querySelectorAll('[data-mc="error"]'),
      );
      const texts = errors.map((error) => error.textContent?.trim());
      expect(texts).toEqual([
        'Name error',
        'Email error',
      ]);
    });
  });

  describe('messageCentre behaviour and shapes', () => {
    it('does not render a messageCentre when there are no messages', () => {
      const { querymessageCentreRegion } =
        renderMessageCentre(emptyMessages);
      expect(querymessageCentreRegion()).toBeNull();
    });

    it('uses the first global message as the messageCentre when globals are present', () => {
      const messages: MessageCentreMessages = {
        globals: [
          'Global one',
          'Global two',
        ],
        blocks: [
          'Block message',
        ],
        messageFallback: 'Fallback summary',
      };

      const { querymessageCentreRegion, getmessageCentreText } =
        renderMessageCentre(messages);

      const messageCentreRegion = querymessageCentreRegion();
      expect(messageCentreRegion).not.toBeNull();
      if (!messageCentreRegion) return;
      expect(getmessageCentreText()).toBe('Global one');
    });

    it('uses the single block message as the messageCentre when there are no globals', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: [
          'Only block error',
        ],
        messageFallback: undefined,
      };

      const { querymessageCentreRegion, getmessageCentreText } =
        renderMessageCentre(messages);

      expect(querymessageCentreRegion()).not.toBeNull();
      expect(getmessageCentreText()).toBe('Only block error');
    });

    it('renders an empty messageCentre when there are multiple block messages and no fallback', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: [
          'Block one',
          'Block two',
        ],
        messageFallback: undefined,
      };

      const { querymessageCentreRegion, getmessageCentreText } =
        renderMessageCentre(messages);

      expect(querymessageCentreRegion()).not.toBeNull();
      expect(getmessageCentreText()).toBe('');
    });

    it('uses messageFallback as messageCentre text when there are multiple block messages and no globals', () => {
      const messages: MessageCentreMessages = {
        globals: [],
        blocks: [
          'Block one',
          'Block two',
        ],
        messageFallback: 'Summary messageCentre',
      };

      const { querymessageCentreRegion, getmessageCentreText } =
        renderMessageCentre(messages);

      expect(querymessageCentreRegion()).not.toBeNull();
      expect(getmessageCentreText()).toBe('Summary messageCentre');
    });

    it('removes the messageCentre when messages change to a non-messageCentre shape', () => {
      const messagesWithmessageCentre: MessageCentreMessages = {
        globals: [],
        blocks: [
          'Only block error',
        ],
        messageFallback: undefined,
      };

      const { querymessageCentreRegion, rerenderWithMessages } =
        renderMessageCentre(messagesWithmessageCentre);

      expect(querymessageCentreRegion()).not.toBeNull();

      rerenderWithMessages(emptyMessages);

      expect(querymessageCentreRegion()).toBeNull();
    });

    it('exposes the messageCentre via a live region with status role', () => {
      const messages: MessageCentreMessages = {
        globals: [
          'Global one',
        ],
        blocks: [],
        messageFallback: undefined,
      };

      const { querymessageCentreRegion, getmessageCentreText } =
        renderMessageCentre(messages);

      const messageCentreRegion = querymessageCentreRegion();
      expect(messageCentreRegion).not.toBeNull();
      if (!messageCentreRegion) return;

      expect(messageCentreRegion).toHaveAttribute('role', 'status');
      expect(messageCentreRegion).toHaveAttribute(
        'aria-live',
        'polite',
      );
      expect(getmessageCentreText()).toBe('Global one');
    });
  });
});
