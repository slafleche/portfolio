import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFocusSentinelHandles } from './helpers/focusSentinel.helpers';
import { renderEmailBlockWithFormBlocks } from './helpers/emailBlock.harness';
import { checkMatchingId } from '../helpers/ariaIdRef.helpers';
import { FormBlocksValidationObserver } from './helpers/formBlocksValidationObserver';
import { EmailBlock } from '@/components/contact/blocks/EmailBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { EmailBlockLocale } from '@/lib/locales/form/form.email';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import { EMAIL_MAX_LENGTH } from '@/modules/contactForm/validation.constants';

type EmailBlockValidationSnapshot = {
  results: unknown[];
};

const emailCopy: EmailBlockLocale = {
  label: enFormCopy['form-email-label'],
  requiredText: enFormCopy['form-required-indicator'],
  errors: {
    invalid: enFormCopy['form-error-email-invalid'],
  },
};

describe('Contact form block tests: EmailBlock', () => {
  const getErrorHint = (container: HTMLElement) =>
    container.querySelector(
      '[data-form-hint="error"]',
    ) as HTMLElement | null;

  const expectErrorHintWiredToInput = (
    container: HTMLElement,
    input: HTMLInputElement,
  ) => {
    const errorHint = getErrorHint(container);
    expect(errorHint).not.toBeNull();
    if (!errorHint) return;
    expect(errorHint.id).toBeTruthy();
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe(errorHint.id);
  };

  describe('wiring and ARIA', () => {
    it('renders the email input with its HTML wiring', () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            disabled
            copy={emailCopy}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      if (!label) return;
      expect(label.textContent).toContain(emailCopy.label);
      expect(label.htmlFor).toBe(input.id);
      const requiredHint = label.querySelector(
        '[data-visible="sc-only"]',
      ) as HTMLElement | null;
      expect(requiredHint).not.toBeNull();

      expect(input).toBeDisabled();
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute(
        'maxlength',
        EMAIL_MAX_LENGTH.toString(),
      );

      const initialValue = input.value;

      void userEvent.type(input, 'example@example.com');

      expect(input.value).toBe(initialValue);
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('focus and keyboard behaviour', () => {
    it('participates correctly in focus order with focus sentinels', async () => {
      const { getByTestId, container, getRegistration } =
        renderEmailBlockWithFormBlocks(
          {
            id: 'test-email-block',
            order: 0,
            copy: emailCopy,
            disabled: false,
          },
          { wrapWithFocusSentinels: true },
        );

      const handles = createFocusSentinelHandles(getByTestId);
      const emailInput = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(emailInput).not.toBeNull();
      if (!emailInput) return;

      handles.focusBefore();
      expect(handles.isFocusOnBefore()).toBe(true);

      await userEvent.tab();
      expect(document.activeElement).toBe(emailInput);

      await userEvent.tab();
      expect(handles.isFocusOnAfter()).toBe(true);

      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(emailInput);

      await userEvent.tab({ shift: true });
      expect(handles.isFocusOnBefore()).toBe(true);

      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(emailInput);
    });

    it('moves focus to the input even when an inline error is shown', async () => {
      const { container, getRegistration } =
        renderEmailBlockWithFormBlocks({
          id: 'test-email-block',
          order: 0,
          copy: emailCopy,
          disabled: false,
        });

      const emailInput = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(emailInput).not.toBeNull();
      if (!emailInput) return;

      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      expectErrorHintWiredToInput(container, emailInput);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');

      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(emailInput);
    });
  });

  describe('validation and live updates', () => {
    it('shows invalid error only after blur for invalid email', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      await userEvent.type(input, 'invalid-email');

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      fireEvent.blur(input);

      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('updates validation live after the first blur', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);

      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');

      await userEvent.clear(input);
      await userEvent.type(input, 'example@example.com');

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('does not show an error for a valid email', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      await userEvent.type(input, 'example@example.com');
      fireEvent.blur(input);

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('reports validation results only when the live validation state changes', async () => {
      const updates: EmailBlockValidationSnapshot[] = [];
      const handleUpdate = vi.fn((results: unknown[]) => {
        updates.push({
          results,
        });
      });

      const { container } = render(
        <FormBlocksProvider>
          <FormBlocksValidationObserver
            onUpdate={handleUpdate}
          />
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      expect(handleUpdate).not.toHaveBeenCalled();

      // Enter an invalid email and blur: one invalid snapshot should
      // be recorded.
      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Additional invalid edits should stay within the same error
      // bucket and not cause extra validation snapshots.
      await userEvent.type(input, '-still-invalid');

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Once the email becomes valid, live reporting should emit a
      // single new validation result to clear messages.
      await userEvent.clear(input);
      await userEvent.type(input, 'example@example.com');

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
              (result as { id: string }).id === 'test-email-block' &&
              'valid' in result &&
              (result as { valid: boolean }).valid === true,
          ),
      ).toBe(true);
    });

    it('shows and then clears inline error when continuousValidation is enabled and value becomes valid', async () => {
      const { container, enableContinuousValidation } =
        renderEmailBlockWithFormBlocks({
          id: 'test-email-block',
          order: 0,
          copy: emailCopy,
          disabled: false,
        });

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      await userEvent.type(input, 'invalid-email');

      enableContinuousValidation();

      await waitFor(() => {
        const errorHint = getErrorHint(container);
        expect(errorHint).not.toBeNull();
      });
      expect(input).toHaveAttribute('aria-invalid', 'true');

      await userEvent.clear(input);
      await userEvent.type(input, 'example@example.com');

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('does not update value or error state when disabled', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      const initialValue = input.value;

      await userEvent.type(input, 'user@example.com');

      expect(input.value).toBe(initialValue);
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('does not update value or create new errors when readOnly', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
            readOnly
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      const initialValue = input.value;

      await userEvent.type(input, 'invalid-email');

      expect(input.value).toBe(initialValue);
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('preserves existing error when toggling to readOnly', async () => {
      const { container, rerender } = render(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
            readOnly={false}
          />
        </FormBlocksProvider>,
      );

      let input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);

      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');

      rerender(
        <FormBlocksProvider>
          <EmailBlock
            id="test-email-block"
            order={0}
            copy={emailCopy}
            disabled={false}
            readOnly
          />
        </FormBlocksProvider>,
      );

      input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      const errorHintAfter = getErrorHint(container);
      expect(errorHintAfter).not.toBeNull();
      expect(input).toHaveAttribute('aria-invalid', 'true');

      const valueAfterError = input.value;
      await userEvent.type(input, 'more-text');
      expect(input.value).toBe(valueAfterError);
    });
  });
});

describe('Contact form block contract: EmailBlock', () => {
  it('registers under key "email" with core contract shape', () => {
    const { getRegistration } = renderEmailBlockWithFormBlocks({
      id: 'test-email-block',
      order: 0,
      copy: emailCopy,
      disabled: false,
    });

    const registration = getRegistration();
    expect(registration).not.toBeNull();
    if (!registration) return;

    expect(registration.key).toBe('email');
    expect(typeof registration.focus).toBe('function');
    expect(typeof registration.getValue).toBe('function');
    expect(typeof registration.validate).toBe('function');
    expect(typeof registration.liveValidation).toBe('boolean');
  });

  it('getValue reflects the current email value', async () => {
    const { getRegistration, container } =
      renderEmailBlockWithFormBlocks({
        id: 'test-email-block',
        order: 0,
        copy: emailCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    await userEvent.type(input, 'example@example.com');

    const registration = getRegistration();
    expect(registration?.getValue?.()).toBe('example@example.com');
  });

  it('validate returns false for invalid and true for valid emails', async () => {
    const { getRegistration, container } =
      renderEmailBlockWithFormBlocks({
        id: 'test-email-block',
        order: 0,
        copy: emailCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    let registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    await userEvent.type(input, 'invalid-email');

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    await userEvent.clear(input);
    await userEvent.type(input, 'example@example.com');

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(true);
  });

  it('liveValidation is false initially and true after first blur', () => {
    const { getRegistration, container } =
      renderEmailBlockWithFormBlocks({
        id: 'test-email-block',
        order: 0,
        copy: emailCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    let registration = getRegistration();
    expect(registration?.liveValidation).toBe(false);

    fireEvent.blur(input);

    registration = getRegistration();
    expect(registration?.liveValidation).toBe(true);
  });

  it('returns structured validation result for empty email', () => {
    const { validateEmail } = renderEmailBlockWithFormBlocks({
      id: 'test-email-block',
      order: 0,
      copy: emailCopy,
      disabled: false,
    });

    const result = validateEmail();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-email-invalid');
    expect(message.text).toBe(emailCopy.errors.invalid);
    expect(message.scrollTarget).toBe('test-email-block');
  });

  it('returns structured validation result for invalid email', async () => {
    const { validateEmail, container } =
      renderEmailBlockWithFormBlocks({
        id: 'test-email-block',
        order: 0,
        copy: emailCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    await userEvent.type(input, 'invalid-email');

    const result = validateEmail();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-email-invalid');
    expect(message.text).toBe(emailCopy.errors.invalid);
    expect(message.scrollTarget).toBe('test-email-block');
  });

  it('returns structured validation result for valid email', async () => {
    const { validateEmail, container } =
      renderEmailBlockWithFormBlocks({
        id: 'test-email-block',
        order: 0,
        copy: emailCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    await userEvent.type(input, 'example@example.com');

    const result = validateEmail();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
