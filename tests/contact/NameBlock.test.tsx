import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFocusSentinelHandles } from './helpers/focusSentinel.helpers';
import { renderNameBlockWithFormBlocks } from './helpers/nameBlock.harness';
import { FormBlocksValidationObserver } from './helpers/formBlocksValidationObserver';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';
import { checkMatchingId } from '../helpers/ariaIdRef.helpers';

type NameBlockValidationSnapshot = {
  results: unknown[];
};

const nameCopy: NameBlockLocale = {
  label: enFormCopy['form-name-label'],
  requiredText: enFormCopy['form-required-indicator'],
  errors: {
    required: enFormCopy['form-error-name-required'],
    tooLong: enFormCopy['form-error-name-too_long'],
  },
};

describe('Contact form block tests: NameBlock', () => {
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
    expect(errorHint!.id).toBeTruthy();
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe(errorHint!.id);
  };

  describe('wiring and ARIA', () => {
    it('renders the name input with its HTML wiring', () => {
      const { container } = render(
        <FormBlocksProvider>
          <NameBlock
            id="test-name-block"
            order={0}
            disabled
            copy={nameCopy}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Label and required indicator: label text and required marker are present
      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      if (!label) return;
      expect(label.textContent).toContain(nameCopy.label);
      expect(label.htmlFor).toBe(input.id);
      const requiredHint = label.querySelector(
        '[data-visible="sc-only"]',
      ) as HTMLElement | null;
      expect(requiredHint).not.toBeNull();

      // HTML attributes
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute(
        'maxlength',
        NAME_LIMIT.max.toString(),
      );
      expect(input).toHaveAttribute(
        'minlength',
        NAME_LIMIT.min.toString(),
      );

      // Disabled behaviour: user input does not change value or error state
      const initialValue = input.value;

      void userEvent.type(input, 'Jane Doe');

      expect(input.value).toBe(initialValue);
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('focus and keyboard behaviour', () => {
    it('participates correctly in focus order with focus sentinels', async () => {
      const { getByTestId, container, getRegistration } =
        renderNameBlockWithFormBlocks(
          {
            id: 'test-name-block',
            order: 0,
            copy: nameCopy,
            disabled: false,
          },
          { wrapWithFocusSentinels: true },
        );

      const handles = createFocusSentinelHandles(getByTestId);
      const nameInput = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(nameInput).not.toBeNull();

      // Start on the "before" sentinel
      handles.focusBefore();
      expect(handles.isFocusOnBefore()).toBe(true);

      // Tab once: focus moves to the NameBlock input
      await userEvent.tab();
      expect(document.activeElement).toBe(nameInput);

      // Tab again: focus moves to the "after" sentinel
      await userEvent.tab();
      expect(handles.isFocusOnAfter()).toBe(true);

      // Shift+Tab: back to NameBlock input
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(nameInput);

      // Shift+Tab again: back to "before" sentinel
      await userEvent.tab({ shift: true });
      expect(handles.isFocusOnBefore()).toBe(true);

      // Add call to "focus" function, NOT on the input, but from the contract
      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(nameInput);
    });

    it('moves focus to the input even when an inline error is shown', () => {
      const { container, getRegistration } =
        renderNameBlockWithFormBlocks({
          id: 'test-name-block',
          order: 0,
          copy: nameCopy,
          disabled: false,
        });

      const nameInput = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(nameInput).not.toBeNull();

      fireEvent.blur(nameInput);

      expectErrorHintWiredToInput(container, nameInput);

      const registration = getRegistration();
      expect(registration).not.toBeNull();
      registration?.focus?.();
      expect(document.activeElement).toBe(nameInput);
    });
  });

  describe('validation and live updates', () => {
    it('shows required error only after blur for empty value', () => {
      const { container } = render(
        <FormBlocksProvider>
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Before blur, no inline error text
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      // Trigger blur with empty value
      fireEvent.blur(input);

      // After blur, required error is shown and aria-invalid is set
      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('updates validation live after the first blur', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Initial state: no error
      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      // First blur with empty value triggers required error
      fireEvent.blur(input);
      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // After first blur, live validation is on: fixing the value clears the error
      await userEvent.type(input, 'Jane Doe');

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('shows too-long and too-short errors for out-of-range values', () => {
      const { container } = render(
        <FormBlocksProvider>
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Too long: value exceeds NAME_LIMIT.max
      const tooLongValue = 'x'.repeat(NAME_LIMIT.max + 1);
      fireEvent.change(input, { target: { value: tooLongValue } });
      fireEvent.blur(input);

      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // Too short: non-empty value shorter than NAME_LIMIT.min should map to "required"
      const tooShortValue = 'x'.repeat(
        Math.max(1, NAME_LIMIT.min - 1),
      );
      fireEvent.change(input, { target: { value: tooShortValue } });

      expectErrorHintWiredToInput(container, input);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not show an error for a valid length', () => {
      const { container } = render(
        <FormBlocksProvider>
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      const validValue = 'x'.repeat(NAME_LIMIT.min);
      fireEvent.change(input, { target: { value: validValue } });
      fireEvent.blur(input);

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('shows and then clears inline error when continuousValidation is enabled and value becomes valid', async () => {
      const { container, enableContinuousValidation } =
        renderNameBlockWithFormBlocks({
          id: 'test-name-block',
          order: 0,
          copy: nameCopy,
          disabled: false,
        });

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      enableContinuousValidation();

      await waitFor(() => {
        const errorHint = getErrorHint(container);
        expect(errorHint).not.toBeNull();
      });
      expect(input).toHaveAttribute('aria-invalid', 'true');

      await userEvent.clear(input);
      await userEvent.type(input, 'Jane Doe');

      expect(getErrorHint(container)).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('reports validation results only when the live validation state changes', async () => {
      const updates: NameBlockValidationSnapshot[] = [];
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
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Initial render: no validation results recorded.
      expect(handleUpdate).not.toHaveBeenCalled();

      // First blur with empty value: enters live validation with a
      // required-style error.
      fireEvent.blur(input);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Typing a too-short but non-empty name keeps the block in the
      // same "required" error bucket; live reporting should not emit
      // an additional validation result for each keystroke.
      const tooShortValue = 'x'.repeat(
        Math.max(1, NAME_LIMIT.min - 1),
      );
      await userEvent.type(input, tooShortValue);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Once the value becomes valid, live reporting should emit a
      // single new validation result (messages cleared).
      const remaining = NAME_LIMIT.min - tooShortValue.length;
      await userEvent.type(input, 'x'.repeat(remaining));

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
              (result as { id: string }).id === 'test-name-block' &&
              'valid' in result &&
              (result as { valid: boolean }).valid === true,
          ),
      ).toBe(true);
    });

    it('emits at most one validation snapshot per name error bucket transition', async () => {
      const updates: NameBlockValidationSnapshot[] = [];
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
          <NameBlock
            id="test-name-block"
            order={0}
            copy={nameCopy}
            disabled={false}
          />
        </FormBlocksProvider>,
      );

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement;

      expect(input).not.toBeNull();

      // Empty + blur → required-style bucket.
      fireEvent.blur(input);

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(1);
      });

      // Too-long value → too_long bucket.
      const tooLongValue = 'x'.repeat(NAME_LIMIT.max + 1);
      fireEvent.change(input, { target: { value: tooLongValue } });

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(2);
      });

      // Valid value → clear errors bucket.
      const validValue = 'x'.repeat(NAME_LIMIT.min);
      fireEvent.change(input, { target: { value: validValue } });

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledTimes(3);
      });

      const lastSnapshot = updates[updates.length - 1];
      expect(
        Array.isArray(lastSnapshot.results) &&
          lastSnapshot.results.some(
            (result) =>
              typeof result === 'object' &&
              result !== null &&
              'id' in result &&
              (result as { id: string }).id === 'test-name-block' &&
              'valid' in result &&
              (result as { valid: boolean }).valid === true,
          ),
      ).toBe(true);
    });
  });
});

describe('Contact form block contract: NameBlock', () => {
  it('registers under key "name" with core contract shape', () => {
    const { getRegistration } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
    });

    const registration = getRegistration();
    if (!registration) {
      throw new Error(
        'Expected NameBlock to register with the form blocks context',
      );
    }

    expect(registration.key).toBe('name');
    expect(typeof registration.focus).toBe('function');
    expect(typeof registration.getValue).toBe('function');
    expect(typeof registration.validate).toBe('function');
    expect(typeof registration.liveValidation).toBe('boolean');
  });

  it('getValue reflects the current input value', async () => {
    const { getRegistration, container } =
      renderNameBlockWithFormBlocks({
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    await userEvent.type(input, 'Jane Doe');

    const registration = getRegistration();
    expect(registration?.getValue?.()).toBe('Jane Doe');
  });

  it('validate returns false for invalid and true for valid values', async () => {
    const { getRegistration, container } =
      renderNameBlockWithFormBlocks({
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    let registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    await userEvent.type(input, 'Jane Doe');

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(true);
  });

  it('liveValidation is false initially and true after first blur', () => {
    const { getRegistration, container } =
      renderNameBlockWithFormBlocks({
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    let registration = getRegistration();
    expect(registration?.liveValidation).toBe(false);

    fireEvent.blur(input);

    registration = getRegistration();
    expect(registration?.liveValidation).toBe(true);
  });

  it('returns structured validation result for required error', () => {
    const { validateName } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
    });

    const result = validateName();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-required');
    expect(message.text).toBe(nameCopy.errors.required);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for a too-short non-empty value', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks(
      {
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      },
    );

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    const tooShortValue = 'x'.repeat(Math.max(1, NAME_LIMIT.min - 1));
    await userEvent.type(input, tooShortValue);

    const result = validateName();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-required');
    expect(message.text).toBe(nameCopy.errors.required);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for too-long error', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks(
      {
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
        maxLength: NAME_LIMIT.max,
      },
    );

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    const tooLongValue = 'x'.repeat(NAME_LIMIT.max + 1);
    fireEvent.change(input, { target: { value: tooLongValue } });

    const result = validateName();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [
      message,
    ] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-too_long');
    expect(message.text).toBe(nameCopy.errors.tooLong);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for valid value', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks(
      {
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
        minLength: NAME_LIMIT.min,
      },
    );

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();

    const validValue = 'x'.repeat(NAME_LIMIT.min);
    await userEvent.type(input, validValue);

    const result = validateName();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
