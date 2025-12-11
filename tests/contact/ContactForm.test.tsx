import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '@/components/contact/ContactForm';
import {
  buildContactFormCopy,
  type FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import { ContactDialogContext } from '@/components/contact/ContactDialogProvider';
import {
  setContactFormDebugEnabled,
  setContactFormDebugLogger,
} from '@/components/contact/contactFormDebugLogger';
import type { Translator } from '@/lib/locales/sections/helpers.locale';

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
      <ContactForm copy={copy} actionUrl={actionUrl} />
    </ContactDialogContext.Provider>,
  );
}

afterEach(() => {
  setContactFormDebugEnabled(null);
  setContactFormDebugLogger(null);
});

describe('ContactForm — integration with flow and outcome layers', () => {
  it('submits a valid form via the JS flow while keeping the message centre quiet on success', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        code: 'success',
        message: statusMessages.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
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

      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      if (!inlineRegion) return;

      expect(inlineRegion.textContent ?? '').toBe('');

      const toastRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(toastRegion).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('does not submit when validation fails and surfaces a validation_error summary', async () => {
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

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) return;
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.validation_error,
        );
      });

      expect(fetchMock).not.toHaveBeenCalled();

      expect(submitButton).toBeDisabled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('shows a jump-to-first-issue control and focuses the priority field when activated', async () => {
    const copy = buildCopy();

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(copy, '/api/contact');

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

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

      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('treats not_configured as catastrophic: disables fields and scrolls to the message centre', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        code: 'not_configured',
        message: statusMessages.not_configured,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
      );

      const nameInput = screen.getByLabelText(
        copy.blocks.name.label,
        { exact: false },
      ) as HTMLInputElement;
      const emailInput = screen.getByLabelText(
        copy.blocks.email.label,
        { exact: false },
      ) as HTMLInputElement;
      const messageInput = screen.getByLabelText(
        copy.blocks.message.label,
        { exact: false },
      ) as HTMLTextAreaElement;

      await userEvent.type(nameInput, 'Jane Doe');
      await userEvent.type(emailInput, 'example@example.com');
      await userEvent.type(
        messageInput,
        'This is a sufficiently long message for validation.',
      );

      const messageCentreRoot = container.querySelector(
        '[data-form="messages"]',
      ) as HTMLElement | null;
      expect(messageCentreRoot).not.toBeNull();
      if (!messageCentreRoot) return;
      const scrollSpy = vi.fn();
      messageCentreRoot.scrollIntoView = scrollSpy;

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(messageCentreRoot.textContent ?? '').toContain(
          statusMessages.not_configured,
        );
      });

      expect(scrollSpy).toHaveBeenCalled();

      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(messageInput).toBeDisabled();
      expect(submitButton).toBeDisabled();

      expect(screen.queryByTestId('jump-to-first-issue')).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('does not emit debug events by default for a happy-path submission', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugLogger(logger);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        code: 'success',
        message: statusMessages.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(copy, '/api/contact');

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

      expect(logger).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('emits submit_attempt and submit_result events when debug is enabled for a happy-path submission', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugEnabled(true);
    setContactFormDebugLogger(logger);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        code: 'success',
        message: statusMessages.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(copy, '/api/contact');

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
        expect(logger).toHaveBeenCalled();
      });

      const types = logger.mock.calls.map(
        ([
          event,
        ]) => event.type,
      );

      expect(types).toContain('submit_attempt');
      expect(types).toContain('submit_result');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('emits a validation_error submit_result with message in the invalid field summary', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugEnabled(true);
    setContactFormDebugLogger(logger);

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(copy, '/api/contact');

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
        'short',
      );

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(logger).toHaveBeenCalled();
      });

      const eventTypes = logger.mock.calls.map(
        ([
          event,
        ]) => event.type,
      );

      expect(eventTypes).toContain('submit_attempt');
      expect(eventTypes).toContain('submit_result');

      const resultEvents = logger.mock.calls
        .map(
          ([
            event,
          ]) => event,
        )
        .filter((event) => event.type === 'submit_result');

      expect(resultEvents.length).toBeGreaterThanOrEqual(1);

      const lastResult =
        resultEvents[resultEvents.length - 1].payload;

      expect(lastResult.submitStatus).toBe('validation_error');
      expect(
        lastResult.invalidFields.some(
          (field: { id: string }) =>
            field.id.includes('message'),
        ),
      ).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
