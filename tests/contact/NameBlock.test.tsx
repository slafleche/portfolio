import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFocusSentinelHandles } from './helpers/focusSentinel.helpers';
import { renderNameBlockWithFormBlocks } from './helpers/nameBlock.harness';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';

const nameCopy: NameBlockLocale = {
  label: enFormCopy['form-name-label'],
  requiredText: enFormCopy['form-required-indicator'],
  errors: {
    required: enFormCopy['form-error-name-required'],
    tooLong: enFormCopy['form-error-name-too_long'],
  },
};

describe('Contact form block tests: NameBlock', () => {
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
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      // Label and required indicator: label text and required marker are present
      const label = container.querySelector('label');
      expect(label).not.toBeNull();
      if (!label) return;
      expect(label.textContent).toContain(nameCopy.label);
      expect(label.htmlFor).toBe(input.id);
      expect(
        screen.getByText(nameCopy.requiredText),
      ).toBeInTheDocument();

      // HTML attributes
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('aria-describedby', 'name-hint');

      // Disabled behaviour: user input does not change value or error state
      const initialValue = input.value;

      void userEvent.type(input, 'Jane Doe');

      expect(input.value).toBe(initialValue);
      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(
        screen.queryByText(nameCopy.errors.tooLong),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('focus and keyboard behaviour', () => {
    it('participates correctly in focus order with focus sentinels', async () => {
      const {
        getByTestId,
        container,
        getRegistration,
      } = renderNameBlockWithFormBlocks(
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
      ) as HTMLInputElement | null;

      expect(nameInput).not.toBeNull();
      if (!nameInput) return;

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
      const { container, getRegistration } = renderNameBlockWithFormBlocks({
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      });

      const nameInput = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(nameInput).not.toBeNull();
      if (!nameInput) return;

      fireEvent.blur(nameInput);

      expect(
        screen.getByText(nameCopy.errors.required),
      ).toBeInTheDocument();

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
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      // Before blur, no inline error text
      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      // Trigger blur with empty value
      fireEvent.blur(input);

      // After blur, required error is shown and aria-invalid is set
      const error = screen.getByText(nameCopy.errors.required);
      expect(error).toBeInTheDocument();
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
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      // Initial state: no error
      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      // First blur with empty value triggers required error
      fireEvent.blur(input);
      expect(
        screen.getByText(nameCopy.errors.required),
      ).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // After first blur, live validation is on: fixing the value clears the error
      await userEvent.type(input, 'Jane Doe');

      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
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
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      // Too long: value exceeds NAME_LIMIT.max
      const tooLongValue = 'x'.repeat(NAME_LIMIT.max + 1);
      fireEvent.change(input, { target: { value: tooLongValue } });
      fireEvent.blur(input);

      expect(
        screen.getByText(nameCopy.errors.tooLong),
      ).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');

      // Too short: non-empty value shorter than NAME_LIMIT.min should map to "required"
      const tooShortValue = 'x'.repeat(
        Math.max(1, NAME_LIMIT.min - 1),
      );
      fireEvent.change(input, { target: { value: tooShortValue } });

      expect(
        screen.getByText(nameCopy.errors.required),
      ).toBeInTheDocument();
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
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      const validValue = 'x'.repeat(NAME_LIMIT.min);
      fireEvent.change(input, { target: { value: validValue } });
      fireEvent.blur(input);

      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(
        screen.queryByText(nameCopy.errors.tooLong),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('shows and then clears inline error when continuousValidation is enabled and value becomes valid', async () => {
      const { container, enableContinuousValidation } = renderNameBlockWithFormBlocks({
        id: 'test-name-block',
        order: 0,
        copy: nameCopy,
        disabled: false,
      });

      const input = container.querySelector(
        'input[data-input="text"]',
      ) as HTMLInputElement | null;

      expect(input).not.toBeNull();
      if (!input) return;

      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');

      enableContinuousValidation();

      expect(
        await screen.findByText(nameCopy.errors.required),
      ).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');

      await userEvent.clear(input);
      await userEvent.type(input, 'Jane Doe');

      expect(
        screen.queryByText(nameCopy.errors.required),
      ).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid');
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
    expect(registration).not.toBeNull();
    if (!registration) return;

    expect(registration.key).toBe('name');
    expect(typeof registration.focus).toBe('function');
    expect(typeof registration.getValue).toBe('function');
    expect(typeof registration.validate).toBe('function');
    expect(typeof registration.liveValidation).toBe('boolean');
  });

  it('getValue reflects the current input value', async () => {
    const { getRegistration, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
    });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    await userEvent.type(input, 'Jane Doe');

    const registration = getRegistration();
    expect(registration?.getValue?.()).toBe('Jane Doe');
  });

  it('validate returns false for invalid and true for valid values', async () => {
    const { getRegistration, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
    });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    let registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    await userEvent.type(input, 'Jane Doe');

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(true);
  });

  it('liveValidation is false initially and true after first blur', () => {
    const { getRegistration, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
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
    const [message] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-required');
    expect(message.text).toBe(nameCopy.errors.required);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for a too-short non-empty value', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
    });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    const tooShortValue = 'x'.repeat(
      Math.max(1, NAME_LIMIT.min - 1),
    );
    await userEvent.type(input, tooShortValue);

    const result = validateName();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [message] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-required');
    expect(message.text).toBe(nameCopy.errors.required);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for too-long error', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
      maxLength: NAME_LIMIT.max,
    });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    const tooLongValue = 'x'.repeat(NAME_LIMIT.max + 1);
    fireEvent.change(input, { target: { value: tooLongValue } });

    const result = validateName();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    const [message] = result.messages;
    expect(message.type).toBe('error');
    expect(message.code).toBe('form-error-name-too_long');
    expect(message.text).toBe(nameCopy.errors.tooLong);
    expect(message.scrollTarget).toBe('test-name-block');
  });

  it('returns structured validation result for valid value', async () => {
    const { validateName, container } = renderNameBlockWithFormBlocks({
      id: 'test-name-block',
      order: 0,
      copy: nameCopy,
      disabled: false,
      minLength: NAME_LIMIT.min,
    });

    const input = container.querySelector(
      'input[data-input="text"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    const validValue = 'x'.repeat(NAME_LIMIT.min);
    await userEvent.type(input, validValue);

    const result = validateName();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
