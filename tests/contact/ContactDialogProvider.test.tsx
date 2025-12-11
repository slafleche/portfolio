import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import type { Translator } from '@/lib/locales/sections/helpers.locale';

const buildFormCopy = () =>
  buildContactFormCopy(
    ((key) =>
      enFormCopy[key as keyof typeof enFormCopy]) as unknown as Translator,
  );

const buildPrivacy = () =>
  buildPrivacyCopy(
    ((key) => {
      if (key === 'privacy-title') return 'Privacy';
      if (key === 'privacy-href') return '#privacy';
      if (key === 'privacy-updated') return '';
      if (key === 'privacy-content') return 'Privacy content.';
      return key;
    }) as unknown as Translator,
  );

describe('ContactDialogProvider', () => {
  it('shows the success panel after a successful form submission inside the dialog', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        code: 'success',
        message: formCopy.statuses.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      render(
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel="Close"
        >
          <ContactDialogTrigger>Open contact</ContactDialogTrigger>
        </ContactDialogProvider>,
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Open contact' }),
      );

      const nameInput = await screen.findByLabelText(
        formCopy.blocks.name.label,
        { exact: false },
      );
      const emailInput = screen.getByLabelText(
        formCopy.blocks.email.label,
        { exact: false },
      );
      const messageInput = screen.getByLabelText(
        formCopy.blocks.message.label,
        { exact: false },
      );

      await userEvent.type(nameInput, 'Jane Doe');
      await userEvent.type(emailInput, 'example@example.com');
      await userEvent.type(
        messageInput,
        'This is a sufficiently long message for validation.',
      );

      const submitButton = screen.getByRole('button', {
        name: formCopy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const successPanel = document.querySelector(
          '[data-form="success"]',
        );
        expect(successPanel).not.toBeNull();
      });

      const liveForm = document.querySelector('[data-form="form"]');
      expect(liveForm).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
