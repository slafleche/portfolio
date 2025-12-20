import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '@/components/contact/ContactForm';
import {
  buildContactFormCopy,
  type FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import { ContactDialogContext } from '@/components/contact/ContactDialogProvider';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import {
  enableTurnstileHarness,
  type TurnstileHarnessController,
} from './helpers/turnstileTestHarness';

// NOTE:
// These tests will cover *recoverable* error states for the contact form —
// situations where the user can reasonably fix the problem or try again
// later from the same form view.
//
// The intent is to verify that:
// - The form view (`data-form="form"`) remains visible.
// - Appropriate status / banner messages are shown.
// - The submit helper is called (or not) according to the error type.
// - Retryability (e.g., after fixing fields or waiting) behaves as expected.
// - The loading UI (`data-form="loading"`) appears only while a submit is
//   in-flight and never persists once a response has completed.

const buildCopy = () =>
  buildContactFormCopy(
    ((key: string) =>
      enFormCopy[key as keyof typeof enFormCopy]) as unknown as Translator,
  );

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

describe('ContactForm — recoverable error flows (form view)', () => {
  it('handles client-side validation_error without calling the server or showing the loader', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
      );

      // Submit immediately with empty fields.
      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });
      await userEvent.click(submitButton);

      // No fetch should happen for purely client-side validation errors.
      expect(fetchMock).not.toHaveBeenCalled();

      // Loader should never appear.
      expect(
        container.querySelector('[data-form="loading"]'),
      ).toBeNull();

      // Form view remains on screen.
      expect(
        container.querySelector('[data-form="form"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-form="error"]'),
      ).toBeNull();
      expect(
        container.querySelector('[data-form="success"]'),
      ).toBeNull();

      // Message centre shows validation_error summary.
      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.validation_error,
        );
      });

      // Jump-to-first-issue control appears and focuses the priority field.
      const jumpButton = await screen.findByTestId(
        'jump-to-first-issue',
      );
      const nameInput = screen.getByLabelText(
        copy.blocks.name.label,
        { exact: false },
      ) as HTMLInputElement;
      expect(document.activeElement).not.toBe(nameInput);

      await userEvent.click(jumpButton);

      await waitFor(() => {
        expect(document.activeElement).toBe(nameInput);
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('surfaces a server-side validation_error while keeping the form visible', async () => {
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
        code: 'validation_error',
        message: statusMessages.validation_error,
      }),
    } as Response);

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

      // After the response, we see the validation_error summary,
      // loader is gone, and the form view remains.
      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.validation_error,
        );
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-form="error"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="success"]'),
        ).toBeNull();
        expect(submitButton).toBeDisabled();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('surfaces a rate_limited status while keeping the form visible and loader non-sticky', async () => {
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
        code: 'rate_limited',
        message: statusMessages.rate_limited,
        retryAfterSeconds: 60,
      }),
    } as Response);

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

      // After the response, show rate_limited summary, remove loader,
      // keep the form view, and do not switch to catastrophic or success.
      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.rate_limited,
        );
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-form="error"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="success"]'),
        ).toBeNull();
        expect(submitButton).not.toBeDisabled();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('surfaces a service_unavailable status while keeping the form visible and loader non-sticky', async () => {
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
        code: 'service_unavailable',
        message: statusMessages.service_unavailable,
      }),
    } as Response);

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

      // After the response, show service_unavailable summary, remove loader,
      // keep the form view, and do not switch to catastrophic or success.
      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.service_unavailable,
        );
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-form="error"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="success"]'),
        ).toBeNull();
        expect(submitButton).not.toBeDisabled();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('surfaces a generic_error and then clears it after a subsequent successful submit', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockImplementation(async () => {
      const callIndex = fetchMock.mock.calls.length;
      if (callIndex === 1) {
        return {
          ok: true,
          json: async () => ({
            ok: false,
            code: 'generic_error',
            message: statusMessages.generic,
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          ok: true,
          code: 'success',
          message: statusMessages.success,
        }),
      } as Response;
    });

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

      // First submit: generic_error.
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.generic,
        );
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).not.toBeNull();
      });

      // Second submit: success, clears generic error.
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        const successPanel = container.querySelector(
          '[data-form="success"]',
        ) as HTMLElement | null;
        expect(successPanel).not.toBeNull();

        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(
          inlineRegion?.textContent?.includes(
            statusMessages.generic,
          ) ?? false,
        ).toBe(false);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('shows the loading UI while a recoverable server submit is in-flight and removes it afterwards', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        ok: true,
        json: async () => ({
          ok: false,
          code: 'generic_error',
          message: statusMessages.generic,
        }),
      } as Response;
    });

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
        const loading = container.querySelector(
          '[data-form="loading"]',
        );
        expect(loading).not.toBeNull();
      });

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.generic,
        );
        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="form"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-form="error"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-form="success"]'),
        ).toBeNull();
        expect(submitButton).not.toBeDisabled();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });
});
