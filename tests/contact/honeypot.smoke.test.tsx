import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusSentinelWrapper } from './components/FocusSentinelWrapper';
import { HoneypotBlock } from '@/components/contact/blocks/HoneypotBlock';
import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

describe('Contact form block tests: HoneypotBlock', () => {
  it('tabs from before sentinel to after sentinel, skipping honeypot', async () => {
    const copy: HoneypotBlockLocale = {
      label: enFormCopy['form-honeypot-label'],
    };

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

    await userEvent.tab({shift: true});

    expect(document.activeElement).toBe(before);
  });
});
