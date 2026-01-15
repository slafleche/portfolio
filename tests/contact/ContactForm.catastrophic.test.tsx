import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ContactDialogContext } from '@/components/contact/ContactDialogProvider';
import ContactForm from '@/components/contact/ContactForm';
import type { ContactFormFlowSubmitHelper } from '@/components/contact/types/form.types';
import {
  buildContactFormCopy,
  type FormStatusKey,
} from '@/lib/locales/sections/form.locale';

import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';
import { enFormTranslator } from './helpers/enFormTranslator';
import {
  enableTurnstileHarness,
  type TurnstileHarnessController,
} from './helpers/turnstileTestHarness';

// NOTE:
// These tests will cover *catastrophic* contact-form failures — cases where
// the user cannot realistically fix or retry from the form UI itself.
//
// The intent is to verify that:
// - The form switches to the dedicated error view (`data-form="error"`).
// - The form view (`data-form="form"`) is no longer rendered.
// - Retry affordances (submit button, jump-to-first-issue) are not shown.
// - The error copy matches the appropriate status message.

const buildCopy = () => buildContactFormCopy(enFormTranslator);

const buildStatusMessages = (copy = buildCopy()) =>
  copy.blocks.messageCentre.statuses as Record<FormStatusKey, string>;

function renderWrappedContactForm(
  copy = buildCopy(),
  actionUrl = '/api/contact',
  turnstileSiteKey: string | null = null,
) {
  const dialogValue = {
    open: () => {},
    close: () => {},
    isOpen: false,
    openPrivacy: () => {},
    closePrivacy: () => {},
    isPrivacyOpen: false,
  };

  return render(
    <ContactDialogContext.Provider value={dialogValue}>
      <ContactForm
        copy={copy}
        actionUrl={actionUrl}
        turnstileSiteKey={turnstileSiteKey}
      />
    </ContactDialogContext.Provider>,
  );
}

describe('ContactForm — catastrophic failures (error view)', () => {
  it('treats a no-blocks configuration as not_configured and surfaces a catastrophic-style summary', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);
    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, getByRole, queryByTestId } =
      renderContactFormShellHarness({
        blocks: [],
        submitHelper,
        statusMessages,
      });

    submit();

    await waitFor(() => {
      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      expect(inlineRegion.textContent ?? '').toContain(
        statusMessages.not_configured,
      );

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion?.textContent ?? '').toContain(
        statusMessages.not_configured,
      );

      const submitButton = getByRole('button', {
        name: copy.submitLabel,
      });
      expect(submitButton).toBeDisabled();

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).toBeNull();
    });

    expect(submitHelper).not.toHaveBeenCalled();
  });

  it('switches to the error view, hides the form, and logs a catastrophic-view reason when the server returns not_configured', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

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
        message: statusMessages.not_configured,
      }),
    } as Response);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
        turnstileHarness.getSiteKey(),
      );

      await userEvent.type(
        screen.getByLabelText(copy.blocks.name.label, {
          exact: false,
        }),
        'Jane Doe',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.email.label, {
          exact: false,
        }),
        'example@example.com',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.message.label, {
          exact: false,
        }),
        'This is a sufficiently long message for validation.',
      );

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const errorPanel = container.querySelector(
          '[data-form="error"]',
        ) as HTMLElement | null;
        expect(errorPanel).not.toBeNull();
        const errorHeading = errorPanel?.querySelector(
          '[data-form="state-title"]',
        ) as HTMLElement | null;
        expect(errorHeading).not.toBeNull();
        if (!errorHeading) {
          throw new Error('Expected error heading to render.');
        }
        expect(errorHeading.getAttribute('tabindex')).toBe('-1');
        expect(document.activeElement).toBe(errorHeading);
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();

        expect(
          container.querySelector('[data-form="form"]'),
        ).toBeNull();

        expect(
          container.querySelector(
            '[data-testid="jump-to-first-issue"]',
          ),
        ).toBeNull();

        expect(
          screen.queryByRole('button', {
            name: copy.submitLabel,
          }),
        ).toBeNull();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[contact][catastrophic-view]',
          {
            reason: 'form.not_configured',
          },
        );
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
      consoleErrorSpy.mockRestore();
    }
  });

  it('switches to the error view and hides the form when the server reports the request is blocked', async () => {
    const copy = buildCopy();

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: false,
        code: 'blocked',
      }),
    } as Response);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
        turnstileHarness.getSiteKey(),
      );

      await userEvent.type(
        screen.getByLabelText(copy.blocks.name.label, {
          exact: false,
        }),
        'Jane Doe',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.email.label, {
          exact: false,
        }),
        'example@example.com',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.message.label, {
          exact: false,
        }),
        'This is a sufficiently long message for validation.',
      );

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const errorPanel = container.querySelector(
          '[data-form="error"]',
        ) as HTMLElement | null;
        expect(errorPanel).not.toBeNull();
        const errorHeading = errorPanel?.querySelector(
          '[data-form="state-title"]',
        ) as HTMLElement | null;
        expect(errorHeading).not.toBeNull();
        if (!errorHeading) {
          throw new Error('Expected error heading to render.');
        }
        expect(errorHeading.getAttribute('tabindex')).toBe('-1');
        expect(document.activeElement).toBe(errorHeading);
        expect(
          container.querySelector('[data-form="form"]'),
        ).toBeNull();

        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();

        expect(
          container.querySelector(
            '[data-testid="jump-to-first-issue"]',
          ),
        ).toBeNull();

        expect(
          screen.queryByRole('button', {
            name: copy.submitLabel,
          }),
        ).toBeNull();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[contact][catastrophic-view]',
          {
            reason: 'form.blocked',
          },
        );
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
      consoleErrorSpy.mockRestore();
    }
  });

  it('switches to the catastrophic error view when Turnstile reports an unrecoverable error before any submit', async () => {
    const copy = buildCopy();

    const originalTurnstile = (
      window as typeof window & {
        turnstile?: unknown;
      }
    ).turnstile;

    const mockTurnstile = {
      render: () => {
        throw new Error('Render failed');
      },
      reset: () => {},
    };

    (window as typeof window & { turnstile?: unknown }).turnstile =
      mockTurnstile;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
        'test-site-key',
      );

      await waitFor(() => {
        const errorPanel = container.querySelector(
          '[data-form="error"]',
        ) as HTMLElement | null;
        expect(errorPanel).not.toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).toBeNull();

        expect(
          container.querySelector(
            '[data-testid="jump-to-first-issue"]',
          ),
        ).toBeNull();

        expect(
          screen.queryByRole('button', {
            name: copy.submitLabel,
          }),
        ).toBeNull();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[contact][catastrophic]',
          {
            source: 'turnstile',
            reason: 'Turnstile script failed to load or initialise.',
          },
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[contact][catastrophic-view]',
          {
            reason: 'Turnstile script failed to load or initialise.',
          },
        );
      });
    } finally {
      (window as typeof window & { turnstile?: unknown }).turnstile =
        originalTurnstile;
      consoleErrorSpy.mockRestore();
    }
  });
});
