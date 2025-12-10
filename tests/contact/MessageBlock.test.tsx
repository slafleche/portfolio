import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFocusSentinelHandles } from './helpers/focusSentinel.helpers';
import { renderMessageBlockWithFormBlocks } from './helpers/messageBlock.harness';
import { MessageBlock } from '@/components/contact/blocks/MessageBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { MessageBlockLocale } from '@/lib/locales/form/form.message';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import {
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
  MESSAGE_URL_LIMIT,
} from '@/modules/contactForm/validation.constants';

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
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      if (!label) return;
      expect(label.textContent).toContain(messageCopy.label);
      expect(label.htmlFor).toBe(textarea.id);
      expect(
        screen.getByText(messageCopy.requiredText),
      ).toBeInTheDocument();

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

      const initialCounterText = enFormCopy[
        'form-counter-remaining'
      ].replace('{count}', MESSAGE_MAX_LENGTH.toString());
      expect(
        screen.getByText(initialCounterText),
      ).toBeInTheDocument();
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
            disabled: false,
          },
          { wrapWithFocusSentinels: true },
        );

      const handles = createFocusSentinelHandles(getByTestId);
      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

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
      const { container, getRegistration } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
          disabled: false,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.required),
      ).toBeInTheDocument();

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
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const maxLengthValue = 'x'.repeat(MESSAGE_MAX_LENGTH);
      fireEvent.change(textarea, {
        target: { value: maxLengthValue },
      });

      expect(
        screen.getByText(messageCopy.maxCharactersMessage),
      ).toBeInTheDocument();
    });

    it('shows required error only after blur for empty message', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      expect(
        screen.queryByText(messageCopy.errors.required),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.required),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows too-short error after blur and clears once length is valid', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);

      expect(
        screen.queryByText(messageCopy.errors.tooShort),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.tooShort),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      await userEvent.type(textarea, 'x');

      expect(
        screen.queryByText(messageCopy.errors.tooShort),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('shows too-long error when exceeding max length and clears once trimmed', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const tooLongValue = 'x'.repeat(MESSAGE_MAX_LENGTH + 1);
      fireEvent.change(textarea, { target: { value: tooLongValue } });
      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.tooLong),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      const validValue = 'x'.repeat(MESSAGE_MAX_LENGTH);
      fireEvent.change(textarea, { target: { value: validValue } });

      expect(
        screen.queryByText(messageCopy.errors.tooLong),
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
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const linksHint = container.querySelector(
        '#test-message-block-links',
      );

      expect(linksHint).toBeNull();
      expect(
        screen.queryByText(messageCopy.maxUrlsMessage),
      ).toBeNull();
    });

    it('shows max-links hint when URL count reaches the limit', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const urlCount = MESSAGE_URL_LIMIT;
      const urls = Array.from(
        { length: urlCount },
        (_, index) => `https://example${index}.com`,
      ).join(' ');

      fireEvent.change(textarea, { target: { value: urls } });

      expect(
        screen.getByText(messageCopy.maxUrlsMessage),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(messageCopy.errors.tooManyLinks),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('shows too-many-links error and max-links hint when URL limit is exceeded', () => {
      const { container } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const urlCount = MESSAGE_URL_LIMIT + 1;
      const urls = Array.from(
        { length: urlCount },
        (_, index) => `https://example${index}.com`,
      ).join(' ');

      fireEvent.change(textarea, { target: { value: urls } });
      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.tooManyLinks),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(
        screen.getByText(messageCopy.maxUrlsMessage),
      ).toBeInTheDocument();
    });

    it('shows and then clears inline errors when continuousValidation is enabled and value becomes valid', async () => {
      const { container, enableContinuousValidation } =
        renderMessageBlockWithFormBlocks({
          id: 'test-message-block',
          order: 0,
          copy: messageCopy,
          disabled: false,
        });

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      expect(
        screen.queryByText(messageCopy.errors.tooShort),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);

      enableContinuousValidation();

      expect(
        await screen.findByText(messageCopy.errors.tooShort),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, validValue);

      expect(
        screen.queryByText(messageCopy.errors.tooShort),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
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
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const initialValue = textarea.value;

      await userEvent.type(textarea, 'Some message text');

      expect(textarea.value).toBe(initialValue);
      expect(
        screen.queryByText(messageCopy.errors.required),
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
            disabled={false}
            readOnly
          />
        </FormBlocksProvider>,
      );

      const textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const initialValue = textarea.value;

      await userEvent.type(textarea, 'Some message text');

      expect(textarea.value).toBe(initialValue);
      expect(
        screen.queryByText(messageCopy.errors.required),
      ).toBeNull();
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('preserves existing error when toggling to readOnly', async () => {
      const { container, rerender } = render(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
            readOnly={false}
          />
        </FormBlocksProvider>,
      );

      let textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      const tooShortValue = 'x'.repeat(
        Math.max(1, MESSAGE_MIN_LENGTH - 1),
      );
      await userEvent.type(textarea, tooShortValue);
      fireEvent.blur(textarea);

      expect(
        screen.getByText(messageCopy.errors.tooShort),
      ).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-invalid', 'true');

      rerender(
        <FormBlocksProvider>
          <MessageBlock
            id="test-message-block"
            order={0}
            copy={messageCopy}
            disabled={false}
            readOnly
          />
        </FormBlocksProvider>,
      );

      textarea = container.querySelector(
        'textarea',
      ) as HTMLTextAreaElement | null;

      expect(textarea).not.toBeNull();
      if (!textarea) return;

      expect(
        screen.getByText(messageCopy.errors.tooShort),
      ).toBeInTheDocument();
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
      disabled: false,
    });

    const registration = getRegistration();
    expect(registration).not.toBeNull();
    if (!registration) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
      disabled: false,
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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

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
        disabled: false,
      });

    const textarea = container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement | null;

    expect(textarea).not.toBeNull();
    if (!textarea) return;

    const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
    await userEvent.type(textarea, validValue);

    const result = validateMessage();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
