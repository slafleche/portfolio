import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import {
  type EnData,
  enData,
} from '@/lib/locales/translations/en.data';
import { sharedStrings } from '@/lib/sharedStrings';

import { installTestEnv } from '../helpers/testEnvVars';
import { enFormTranslator } from './helpers/enFormTranslator';
import {
  enableTurnstileHarness,
  type TurnstileHarnessController,
} from './helpers/turnstileTestHarness';

const buildFormCopy = () => buildContactFormCopy(enFormTranslator);

const buildPrivacy = () =>
  buildPrivacyCopy(
    ((key: string) =>
      enData[key as keyof EnData] ?? key) as unknown as Translator,
  );

const uiLabels = {
  close: enData['close-label'],
  openContact: enData['contact-label-hero'],
};

describe('ContactDialogProvider', () => {
  let restoreEnv: (() => void) | null = null;

  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
  });

  it('shows the success panel after a successful form submission inside the dialog', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

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
      window.location.hash = '#contact-form';

      render(
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={uiLabels.close}
          turnstileSiteKey={turnstileHarness.getSiteKey()}
        >
          <ContactDialogTrigger>
            {uiLabels.openContact}
          </ContactDialogTrigger>
        </ContactDialogProvider>,
      );

      await waitFor(() => {
        const panel = document.querySelector(
          '[data-ui="contact-form"]',
        );
        expect(panel).not.toBeNull();
        expect(panel?.textContent ?? '').toContain(
          formCopy.headings.form,
        );
      });

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

      const getContactCalls = () =>
        fetchMock.mock.calls.filter(([url]) => {
          const href = typeof url === 'string' ? url : url?.url;
          return href === '/api/contact';
        });

      await waitFor(() => {
        expect(getContactCalls()).toHaveLength(1);
      });

      await waitFor(() => {
        const successPanel = document.querySelector(
          '[data-form="success"]',
        );
        expect(successPanel).not.toBeNull();
        const liveForm = document.querySelector('[data-form="form"]');
        expect(liveForm).toBeNull();
        const title = successPanel?.querySelector(
          '[data-form="state-title"]',
        ) as HTMLElement | null;
        expect(title).not.toBeNull();
        expect(title?.textContent).toBe(formCopy.headings.success);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('uses the error heading for catastrophic error view', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: false,
        code: 'not_configured',
        message: formCopy.statuses.not_configured,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      window.location.hash = '#contact-form';

      render(
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={uiLabels.close}
          turnstileSiteKey={turnstileHarness.getSiteKey()}
        >
          <ContactDialogTrigger>
            {uiLabels.openContact}
          </ContactDialogTrigger>
        </ContactDialogProvider>,
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
        const errorPanel = document.querySelector(
          '[data-form="error"]',
        );
        expect(errorPanel).not.toBeNull();
        const liveForm = document.querySelector('[data-form="form"]');
        expect(liveForm).toBeNull();
        const title = errorPanel?.querySelector(
          '[data-form="state-title"]',
        ) as HTMLElement | null;
        expect(title).not.toBeNull();
        expect(title?.textContent).toBe(formCopy.headings.error);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('keeps the form heading for recoverable server-side validation errors', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: false,
        code: 'validation_error',
        message: formCopy.statuses.validation_error,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      window.location.hash = '#contact-form';

      render(
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={uiLabels.close}
          turnstileSiteKey={turnstileHarness.getSiteKey()}
        >
          <ContactDialogTrigger>
            {uiLabels.openContact}
          </ContactDialogTrigger>
        </ContactDialogProvider>,
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
        const formPanel = document.querySelector('[data-form="form"]');
        expect(formPanel).not.toBeNull();
        const errorPanel = document.querySelector(
          '[data-form="error"]',
        );
        expect(errorPanel).toBeNull();
        const panel = document.querySelector(
          '[data-ui="contact-form"]',
        );
        expect(panel).not.toBeNull();
        expect(panel?.textContent ?? '').toContain(
          formCopy.headings.form,
        );
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('keeps the contact form open when closing the privacy dialog', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    window.location.hash = '#contact-form';

    render(
      <ContactDialogProvider
        formCopy={formCopy}
        privacyCopy={privacyCopy}
        closeLabel={uiLabels.close}
      >
        <ContactDialogTrigger>
          {uiLabels.openContact}
        </ContactDialogTrigger>
      </ContactDialogProvider>,
    );

    await waitFor(() => {
      const formPanel = document.querySelector('[data-form="form"]');
      expect(formPanel).not.toBeNull();
    });

    const privacyLink = screen.getByRole('link', {
      name: formCopy.privacy.linkLabel,
    });
    await userEvent.click(privacyLink);

    await waitFor(() => {
      const privacyTitle = screen.getByRole('heading', {
        name: privacyCopy.title,
      });
      expect(privacyTitle).toBeInTheDocument();
    });

    const closePrivacyButton = screen.getByRole('button', {
      name: formCopy.privacy.closeLabel,
    });
    await userEvent.click(closePrivacyButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: privacyCopy.title,
        }),
      ).toBeNull();
      const formPanel = document.querySelector('[data-form="form"]');
      expect(formPanel).not.toBeNull();
      const panel = document.querySelector(
        '[data-ui="contact-form"]',
      );
      expect(panel).not.toBeNull();
      expect(panel?.textContent ?? '').toContain(
        formCopy.headings.form,
      );
    });
  });

  it('applies the dev success scenario from the URL and uses the success heading', async () => {
    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const basePath = '/en';
      const scenarioUrl = `${basePath}?scenario=success${sharedStrings.contactFormHash}`;
      window.history.pushState({}, '', scenarioUrl);

      render(
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={uiLabels.close}
        >
          <ContactDialogTrigger>
            {uiLabels.openContact}
          </ContactDialogTrigger>
        </ContactDialogProvider>,
      );

      await waitFor(() => {
        const successPanel = document.querySelector(
          '[data-form="success"]',
        );
        expect(successPanel).not.toBeNull();
        const formPanel = document.querySelector('[data-form="form"]');
        expect(formPanel).toBeNull();
        const title = successPanel?.querySelector(
          '[data-form="state-title"]',
        ) as HTMLElement | null;
        expect(title).not.toBeNull();
        expect(title?.textContent).toBe(formCopy.headings.success);
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
