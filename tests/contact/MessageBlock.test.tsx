import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MessageBlock } from '@/components/contact/blocks/MessageBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { MessageBlockLocale } from '@/lib/locales/form/form.message';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  MESSAGE_URL_LIMIT,
} from '@/modules/contactForm/validation.constants';

import { checkMatchingId } from '../helpers/ariaIdRef.helpers';
import { createFocusSentinelHandles } from './helpers/focusSentinel.helpers';
import { FormBlocksValidationObserver } from './helpers/formBlocksValidationObserver';
import { renderMessageBlockWithFormBlocks } from './helpers/messageBlock.harness';

type MessageBlockValidationSnapshot = {
  results: unknown[];
};

const messageCopy: MessageBlockLocale = {
  label: enFormCopy['form-message-label'],
  requiredText: enFormCopy['form-required-indicator'],
  counterTemplate: enFormCopy['form-counter-remaining'],
  maxCharactersMessage: enFormCopy['form-message-max_chars'],
  urlUsageTemplate: enFormCopy['form-message-url_usage'],
  maxUrlsMessage: enFormCopy['form-message-max_links'],
  errors: {
    required: enFormCopy['form-error-message-required'],
    tooShort: enFormCopy['form-error-message-too_short'].replace(
      '{min}',
      MESSAGE_MIN_LENGTH.toString(),
    ),
    tooLong: enFormCopy['form-error-message-too_long'],
    tooManyLinks: enFormCopy['form-error-message-too_many_links'],
  },
};

describe('Contact form block tests: MessageBlock', () => {
  describe('wiring and ARIA', () => {
    it('renders the message textarea with its HTML wiring and helpers', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      if (!label) return;
      expect(label.textContent).toContain(messageCopy.label);
      expect(label.htmlFor).toBe(textarea.id);
      const requiredHint = label.querySelector(
        '[data-visible="sc-only"]',
      ) as HTMLElement | null;
      expect(requiredHint).not.toBeNull();

      expect(textarea).not.toBeDisabled();
      expect(textarea).toHaveAttribute(
        'minlength',
        MESSAGE_MIN_LENGTH.toString(),
      );
      expect(textarea).toHaveAttribute(
        'maxlength',
        MESSAGE_MAX_LENGTH.toString(),
      );
      expect(textarea).toHaveAttribute(
        'aria-describedby',
        'test-message-block-hint',
      );

      const counterHint = container.querySelector(
        '#test-message-block-hint',
      );
      expect(
        checkMatchingId(counterHint, textarea, 'describedby'),
      ).toBe(true);
    });
  });

  describe('focus and keyboard behaviour', () => {
    it('participates correctly in focus order with focus sentinels', async () => {
      const { getByTestId, container, getRegistration } =
        renderMessageBlockWithFormBlocks(
          {
            id: 'test-message-block',
            order: 0,
            copy: messageCopy,
          },
          { wrapWithFocusSentinels: true },
        );

      const handles = createFocusSentinelHandles(getByTestId);
      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      handles.focusBefore();
      expect(handles.isFocusOnBefore()).toBe(true);

      await userEvent.tab();
      expect(document.activeElement).toBe(textarea);

      await userEvent.tab();
      expect(handles.isFocusOnAfter()).toBe(true);

      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(textarea);

      await userEvent.tab({ shift: true });
      expect(handles.isFocusOnBefore()).toBe(true);

      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(textarea);
    });

    it('moves focus to the textarea even when an inline error is shown', () => {
      const { container, getRegistration, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      markSubmitAttempted();
      fireEvent.blur(textarea);

      const errorHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(errorHint).not.toBeNull();

      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('validation, helpers, and live updates', () => {
    it('shows the max-characters message when the value reaches the limit', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const maxLengthValue = 'x'.repeat(MESSAGE_MAX_LENGTH);
      fireEvent.change(textarea, {
        target: { value: maxLengthValue },
      });

      const hint = container.querySelector(
        '#test-message-block-hint',
      ) as HTMLElement | null;
      expect(hint).not.toBeNull();
    });

    it('shows required error only after blur for empty message', () => {
      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      markSubmitAttempted();
      fireEvent.blur(textarea);

      const requiredHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(requiredHint).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows too-short error after blur and clears once length is valid', async () => {
      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);

      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      markSubmitAttempted();
      fireEvent.blur(textarea);

      const tooShortHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(tooShortHint).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      await userEvent.type(textarea, 'x');

      await waitFor(() => {
        expect(
          container.querySelector(
            '#test-message-block-hint[data-form-hint="error"]',
          ),
        ).toBeNull();
        expect(textarea).not.toHaveAttribute('aria-invalid');
      });
    });

    it('shows too-long error when exceeding max length and clears once trimmed', () => {
      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const tooLongValue = 'x'.repeat(MESSAGE_MAX_LENGTH + 1);
      markSubmitAttempted();
      fireEvent.change(textarea, { target: { value: tooLongValue } });
      fireEvent.blur(textarea);

      const tooLongHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(tooLongHint).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      const validValue = 'x'.repeat(MESSAGE_MAX_LENGTH);
      fireEvent.change(textarea, { target: { value: validValue } });

      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('does not show URL usage hint when there are zero URLs', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
          />
        </FormBlocksProvider>,
      );

      const linksHint = container.querySelector(
        '#test-message-block-links',
      );

      expect(linksHint).toBeNull();
      expect(
        container.querySelector(
          '#test-message-block-links[data-form-hint="helper"]',
        ),
      ).toBeNull();
    });

    it('shows max-links hint when URL count reaches the limit', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const urlCount = MESSAGE_URL_LIMIT;
      const urls = Array.from(
        { length: urlCount },
        (_, index) => `https://example${index}.com`,
      ).join(' ');

      fireEvent.change(textarea, { target: { value: urls } });

      const linksHint = container.querySelector(
        '#test-message-block-links[data-form-hint="helper"]',
      ) as HTMLElement | null;
      expect(linksHint).not.toBeNull();
      const errorHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      );
      expect(errorHint).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('shows too-many-links error and max-links hint when URL limit is exceeded', () => {
      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const urlCount = MESSAGE_URL_LIMIT + 1;
      const urls = Array.from(
        { length: urlCount },
        (_, index) => `https://example${index}.com`,
      ).join(' ');

      markSubmitAttempted();
      fireEvent.change(textarea, { target: { value: urls } });
      fireEvent.blur(textarea);

      const tooManyLinksHint = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(tooManyLinksHint).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      const linksHint = container.querySelector(
        '#test-message-block-links[data-form-hint="helper"]',
      ) as HTMLElement | null;
      expect(linksHint).not.toBeNull();
    });

    it('shows and then clears inline errors when continuousValidation is enabled and value becomes valid', async () => {
      const { container, enableContinuousValidation } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);

      enableContinuousValidation();

      await waitFor(() => {
        const tooShortHint = container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        );
        expect(tooShortHint).not.toBeNull();
      });
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, validValue);

      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('emits at most one validation snapshot per error bucket transition', async () => {
      const updates: MessageBlockValidationSnapshot[] = [];
      const handleUpdate = vi.fn((results: unknown[]) => {
        updates.push({
          results,
        });
      });

      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks(
          {
            id: 'test-message-block',
            order: 0,
            copy: messageCopy,
          },
          {
            beforeChildren: (
              <FormBlocksValidationObserver onUpdate={handleUpdate} />
            ),
          },
        );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      // Empty + blur → required bucket.
      markSubmitAttempted();
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Too-short value → too_short bucket.
      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(2);
      });

      // Too-long value → too_long bucket (jump directly beyond max).
      const tooLongValue = 'x'.repeat(MESSAGE_MAX_LENGTH + 1);
      fireEvent.change(textarea, {
        target: { value: tooLongValue },
      });

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(3);
      });
    });

    it('reports validation results only when the live validation state changes', async () => {
      const updates: MessageBlockValidationSnapshot[] = [];
      const handleUpdate = vi.fn((results: unknown[]) => {
        updates.push({
          results,
        });
      });

      const { container, markSubmitAttempted } =
        renderMessageBlockWithFormBlocks(
          {
            id: 'test-message-block',
            order: 0,
            copy: messageCopy,
          },
          {
            beforeChildren: (
              <FormBlocksValidationObserver onUpdate={handleUpdate} />
            ),
          },
        );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      expect(handleUpdate).not.toHaveBeenCalled();

      // Enter a too-short message and blur: one invalid snapshot
      // (too_short) should be recorded.
      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      markSubmitAttempted();
      await userEvent.type(textarea, tooShortValue);
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Once the message becomes long enough to be valid, live
      // reporting should emit a single new snapshot to clear errors.
      const remaining = MESSAGE_MIN_LENGTH - tooShortValue.length;
      await userEvent.type(textarea, 'x'.repeat(remaining));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(2);
      });

      const lastSnapshot = updates[updates.length - 1];
      expect(
        Array.isArray(lastSnapshot.results) &&
          lastSnapshot.results.some(
            (result) =>
              typeof result === 'object' &&
              result !== null &&
              'id' in result &&
              (result as { id: string }).id ===
                'test-message-block' &&
              'valid' in result &&
              (result as { valid: boolean }).valid === true,
          ),
      ).toBe(true);
    });

    it('does not update value or error state when disabled', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const initialValue = textarea.value;

      await userEvent.type(textarea, 'Some message text');

      expect(textarea.value).toBe(initialValue);
      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('does not update value or create new errors when readOnly', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            readOnly
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const initialValue = textarea.value;

      await userEvent.type(textarea, 'Some message text');

      expect(textarea.value).toBe(initialValue);
      expect(
        container.querySelector(
          '#test-message-block-hint[data-form-hint="error"]',
        ),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('preserves existing error when toggling to readOnly', async () => {
      const { container, markSubmitAttempted, rerenderBlock } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
          readOnly: false,
        });

      let textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      markSubmitAttempted();
      await userEvent.type(textarea, tooShortValue);
      fireEvent.blur(textarea);

      const tooShortHintInitial = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(tooShortHintInitial).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      rerenderBlock({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
        readOnly: true,
      });

      textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;

      expect(textarea).not.toBeNull();

      const tooShortHintAfter = container.querySelector(
        '#test-message-block-hint[data-form-hint="error"]',
      ) as HTMLElement | null;
      expect(tooShortHintAfter).not.toBeNull();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      const valueAfterError = textarea.value;
      await userEvent.type(textarea, 'more text');
      expect(textarea.value).toBe(valueAfterError);
    });
  });
});

describe('Contact form block contract: MessageBlock', () => {
  it('registers under key "message" with core contract shape', () => {
    const { getRegistration } = renderMessageBlockWithFormBlocks({
      id: 'test-message-block',
      order: 0,
      copy: messageCopy,
    });

    const registration = getRegistration();
    if (!registration) {
      throw new Error(
        'Expected MessageBlock to register with the form blocks context',
      );
    }

    expect(registration.key).toBe('message');
    expect(typeof registration.focus).toBe('function');
    expect(typeof registration.getValue).toBe('function');
    expect(typeof registration.validate).toBe('function');
    expect(typeof registration.liveValidation).toBe('boolean');
  });

  it('getValue reflects the current textarea value', async () => {
    const { getRegistration, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    await userEvent.type(textarea, 'Some message text');

    const registration = getRegistration();
    expect(registration?.getValue?.()).toBe('Some message text');
  });

  it('validate returns false for invalid and true for valid messages', async () => {
    const { getRegistration, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    let registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
    await userEvent.type(textarea, validValue);

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(true);
  });

  it('liveValidation is false initially and true after first blur', () => {
    const { getRegistration, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    let registration = getRegistration();
    expect(registration?.liveValidation).toBe(false);

    fireEvent.blur(textarea);

    registration = getRegistration();
    expect(registration?.liveValidation).toBe(true);
  });

  it('returns structured validation result for an empty message', () => {
    const { validateMessage } = renderMessageBlockWithFormBlocks({
      id: 'test-message-block',
      order: 0,
      copy: messageCopy,
    });

    const result = validateMessage();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-message-required');
    expect(message.text).toBe(messageCopy.errors.required);
    expect(message.scrollTarget).toBe('test-message-block');
  });

  it('returns structured validation result for too-short message', async () => {
    const { validateMessage, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    const tooShortValue = 'x'.repeat(
      Math.max(1, MESSAGE_MIN_LENGTH - 1),
    );
    await userEvent.type(textarea, tooShortValue);

    const result = validateMessage();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-message-too_short');
    expect(message.text).toBe(messageCopy.errors.tooShort);
    expect(message.scrollTarget).toBe('test-message-block');
  });

  it('returns structured validation result for too-long message', () => {
    const { validateMessage, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    const tooLongValue = 'x'.repeat(MESSAGE_MAX_LENGTH + 1);
    fireEvent.change(textarea, { target: { value: tooLongValue } });

    const result = validateMessage();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-message-too_long');
    expect(message.text).toBe(messageCopy.errors.tooLong);
    expect(message.scrollTarget).toBe('test-message-block');
  });

  it('returns structured validation result for too-many-links message', () => {
    const { validateMessage, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    const urlCount = MESSAGE_URL_LIMIT + 1;
    const urls = Array.from(
      { length: urlCount },
      (_, index) => `https://example${index}.com`,
    ).join(' ');

    fireEvent.change(textarea, { target: { value: urls } });

    const result = validateMessage();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-message-too_many_links');
    expect(message.text).toBe(messageCopy.errors.tooManyLinks);
    expect(message.scrollTarget).toBe('test-message-block');
  });

  it('returns structured validation result for valid message', async () => {
    const { validateMessage, container } =
      renderMessageBlockWithFormBlocks({
        id: 'test-message-block',
        order: 0,
        copy: messageCopy,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;

    expect(textarea).not.toBeNull();

    const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
    await userEvent.type(textarea, validValue);

    const result = validateMessage();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
