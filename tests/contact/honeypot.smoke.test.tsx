import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusSentinelWrapper } from './components/FocusSentinelWrapper';
import { HoneypotBlock } from '@/components/contact/blocks/HoneypotBlock';
import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

const copy: HoneypotBlockLocale = {
  label: enFormCopy['form-honeypot-label'],
};

describe('Contact form block tests: HoneypotBlock', () => {
  it('tabs from before sentinel to after sentinel, skipping honeypot', async () => {

    const { getByTestId } = render(
      <FocusSentinelWrapper>
        <HoneypotBlock copy={copy} />
      </FocusSentinelWrapper>,
    );

    const before = getByTestId('focus-sentinel-before') as HTMLInputElement;
    const after = getByTestId('focus-sentinel-after') as HTMLInputElement;

    before.focus();
    expect(document.activeElement).toBe(before);

    await userEvent.tab();

    expect(document.activeElement).toBe(after);

    await userEvent.tab({ shift: true });

    expect(document.activeElement).toBe(before);
  });

  it('renders honeypot structure and accessibility attributes', () => {

    const { container } = render(<HoneypotBlock copy={copy} />);

    const wrapper = container.firstElementChild as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    if (!wrapper) return;

    expect(wrapper).toHaveAttribute('aria-hidden', 'true');

    const label = wrapper.querySelector('label');
    const input = wrapper.querySelector('input');

    expect(label).not.toBeNull();
    expect(input).not.toBeNull();
    if (!label || !input) return;

    expect(label.textContent).toBe(copy.label);
    expect(label).toHaveAttribute('for', input.id);

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('name', 'hp');
  });

  it('submits honeypot value under the hp name', async () => {
    let submittedValue: string | null = null;

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (
      event,
    ) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      submittedValue = (data.get('hp') as string | null) ?? null;
    };

    const { container, getByRole } = render(
      <form onSubmit={handleSubmit}>
        <HoneypotBlock copy={copy} />
        <button type="submit">Submit</button>
      </form>,
    );

    const input = container.querySelector(
      'input[name="hp"]',
    ) as HTMLInputElement | null;

    expect(input).not.toBeNull();
    if (!input) return;

    await userEvent.type(input, 'bot-signal');

    const submitButton = getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    expect(submittedValue).toBe('bot-signal');
  });
});
