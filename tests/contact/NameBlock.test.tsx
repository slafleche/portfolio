import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { NameBlockLocale } from '@/lib/locales/form/form.name';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

const nameCopy: NameBlockLocale = {
  label: enFormCopy['form-name-label'],
  requiredText: enFormCopy['form-required-indicator'],
  errors: {
    required: enFormCopy['form-error-name-required'],
    tooLong: enFormCopy['form-error-name-too_long'],
  },
};

describe('Contact form block tests: NameBlock', () => {
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

    // HTML attributes
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('aria-describedby', 'name-hint');
  });
});
