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
import { setContactFormDebugLogger } from '@/components/contact/contactFormDebugLogger';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import { EmailBlock } from '@/components/contact/blocks/EmailBlock';
import { MessageBlock } from '@/components/contact/blocks/MessageBlock';
import { useContactFormFlow } from '@/components/contact/useContactFormFlow';
import {
  type ContactFormFlowSubmitHelper,
  type ContactFormBlockValidationResult,
} from '@/components/contact/types/form.types';
import { FormBlocksValidationObserver } from './helpers/formBlocksValidationObserver';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { MESSAGE_MIN_LENGTH } from '@/modules/contactForm/validation.constants';
import {
  enableTurnstileHarness,
  type TurnstileHarnessController,
} from './helpers/turnstileTestHarness';

const buildCopy = () =>
  buildContactFormCopy(
    ((key: string) =>
      enFormCopy[
        key as keyof typeof enFormCopy
      ]) as unknown as Translator,
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

afterEach(() => {
  setContactFormDebugLogger(null);
});

type LiveValidationHarnessProps = {
  copy: ReturnType<typeof buildCopy>;
  submitHelper: ContactFormFlowSubmitHelper;
  onValidationUpdate: (
    results: ContactFormBlockValidationResult[],
  ) => void;
};

function LiveValidationHarness({
  copy,
  submitHelper,
  onValidationUpdate,
}: LiveValidationHarnessProps) {
  return (
    <FormBlocksProvider>
      <FormBlocksValidationObserver onUpdate={onValidationUpdate} />
      <LiveValidationInner copy={copy} submitHelper={submitHelper} />
    </FormBlocksProvider>
  );
}

type LiveValidationInnerProps = {
  copy: ReturnType<typeof buildCopy>;
  submitHelper: ContactFormFlowSubmitHelper;
};

function LiveValidationInner({
  copy,
  submitHelper,
}: LiveValidationInnerProps) {
  const flow = useContactFormFlow({
    submitHelper,
  });

  return (
    <form
      aria-label="live validation harness"
      onSubmit={(event) => {
        void flow.handleSubmit(event);
      }}
    >
      <NameBlock
        id="live-name"
        order={1}
        copy={copy.blocks.name}
        disabled={false}
      />
      <EmailBlock
        id="live-email"
        order={2}
        copy={copy.blocks.email}
        disabled={false}
      />
      <MessageBlock
        id="live-message"
        order={3}
        copy={copy.blocks.message}
        disabled={false}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('ContactForm — integration with flow and outcome layers', () => {
  it('submits a valid form via the JS flow while keeping the message centre quiet on success', async () => {
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
        'test-site-key',
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
        // Key assertion: the submission went through once.
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const successPanel = container.querySelector(
          '[data-form="success"]',
        ) as HTMLElement | null;
        expect(successPanel).not.toBeNull();
        if (!successPanel) {
          throw new Error('Expected success panel to render.');
        }

        const successHeading = successPanel.querySelector(
          'h1',
        ) as HTMLElement | null;
        expect(successHeading).not.toBeNull();
        if (!successHeading) {
          throw new Error('Expected success heading to render.');
        }

        expect(successHeading.getAttribute('tabindex')).toBe('-1');
        expect(document.activeElement).toBe(successHeading);

        expect(
          container.querySelector('[data-form="loading"]'),
        ).toBeNull();

        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).toBeNull();

        const toastRegion = container.querySelector(
          '[role="status"]:not([aria-atomic])',
        );
        expect(toastRegion).toBeNull();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('renders a single Turnstile widget instance even after a failed submit', async () => {
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
        code: 'validation_error',
        message: copy.blocks.messageCentre.statuses.validation_error,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      const { container } = renderWrappedContactForm(
        copy,
        '/api/contact',
        turnstileHarness.getSiteKey(),
      );

      const turnstileSection = container
        .querySelector('[data-form-turnstile="status"]')
        ?.closest('[data-order]');
      expect(turnstileSection).not.toBeNull();

      await waitFor(() => {
        const instances = container.querySelectorAll(
          '[data-testid="turnstile-instance"]',
        );
        expect(instances.length).toBe(1);
      });

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        const instances = container.querySelectorAll(
          '[data-testid="turnstile-instance"]',
        );
        expect(instances.length).toBe(1);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('restores focus to the last focused field after a recoverable server error', async () => {
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
      renderWrappedContactForm(
        copy,
        '/api/contact',
        turnstileHarness.getSiteKey(),
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
        'This is a sufficiently long message.',
      );

      messageInput.focus();
      expect(document.activeElement).toBe(messageInput);

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const inlineRegion = document.querySelector(
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

      await waitFor(() => {
        expect(document.activeElement).toBe(messageInput);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
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
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }
        expect(inlineRegion.textContent ?? '').toContain(
          statusMessages.validation_error,
        );
        expect(submitButton).toBeDisabled();
      });

      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('does not duplicate the global status message in the inline message list', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
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

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }

        const globalText = statusMessages.service_unavailable;
        const inlineLines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const inlineTexts = inlineLines.map(
          (el) => el.textContent ?? '',
        );

        expect(inlineRegion.textContent ?? '').toContain(globalText);
        expect(
          inlineTexts.filter((text) => text.includes(globalText))
            .length,
        ).toBe(0);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('clears validation banners and jump button as fields recover under live feedback, and submits once all fields are valid', async () => {
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

      // 1) Fill only the name; leave email and message invalid.
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

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      // 2) First submit: should show validation_error and errors for email and message.
      await userEvent.click(submitButton);

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
        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        expect(codes).toContain('form-error-email-invalid');
        expect(
          codes.some((code) =>
            code?.startsWith('form-error-message-'),
          ),
        ).toBe(true);
      });

      // No submit happened yet.
      expect(fetchMock).not.toHaveBeenCalled();

      // 3) Fix email: its error should disappear (live validation),
      // while message is still invalid.
      await userEvent.type(emailInput, 'example@example.com');

      // 4) Second submit: still missing valid message, so still validation_error and no submit.
      await userEvent.click(submitButton);

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
        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        expect(
          codes.some((code) =>
            code?.startsWith('form-error-message-'),
          ),
        ).toBe(true);
        expect(codes).not.toContain('form-error-email-invalid');
      });

      expect(fetchMock).not.toHaveBeenCalled();

      // 5) Fix message with a valid, long-enough value. Text-field errors
      // are now cleared under live validation; Turnstile may still be
      // pending until the user completes verification.
      await userEvent.type(messageInput, 'This is a valid message.');
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
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

  it('does not trigger state-update-during-render warnings when live validation turns on', async () => {
    const copy = buildCopy();

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      renderWrappedContactForm(copy, '/api/contact');

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      // First submit with empty fields enables continuous validation
      // and causes blocks to enter live validation.
      await userEvent.click(submitButton);

      // In a healthy implementation this should not produce React
      // warnings about updating state during render.
      const calls = consoleErrorSpy.mock.calls;
      const hasUpdateDuringRenderWarning = calls.some(
        (args) =>
          typeof args[0] === 'string' &&
          args[0].includes(
            'Cannot update a component while rendering a different component',
          ),
      );

      expect(hasUpdateDuringRenderWarning).toBe(false);
    } finally {
      global.fetch = originalFetch;
      consoleErrorSpy.mockRestore();
    }
  });

  it('does not trigger state-update-during-render warnings in StrictMode when live validation turns on', async () => {
    const copy = buildCopy();

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const dialogValue = {
      open: () => {},
      close: () => {},
      isOpen: false,
      openPrivacy: () => {},
      closePrivacy: () => {},
      isPrivacyOpen: false,
    };

    try {
      render(
        <React.StrictMode>
          <ContactDialogContext.Provider value={dialogValue}>
            <ContactForm copy={copy} actionUrl="/api/contact" />
          </ContactDialogContext.Provider>
        </React.StrictMode>,
      );

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      const calls = consoleErrorSpy.mock.calls;
      const hasUpdateDuringRenderWarning = calls.some(
        (args) =>
          typeof args[0] === 'string' &&
          args[0].includes(
            'Cannot update a component while rendering a different component',
          ),
      );

      expect(hasUpdateDuringRenderWarning).toBe(false);
    } finally {
      global.fetch = originalFetch;
      consoleErrorSpy.mockRestore();
    }
  });

  it('reports validation results only on meaningful state changes for a full form flow', async () => {
    const copy = buildCopy();

    const updates: ContactFormBlockValidationResult[][] = [];
    const handleUpdate = vi.fn(
      (results: ContactFormBlockValidationResult[]) => {
        updates.push(results);
      },
    );

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    render(
      <LiveValidationHarness
        copy={copy}
        submitHelper={submitHelper}
        onValidationUpdate={handleUpdate}
      />,
    );

    const nameInput = screen.getByLabelText(copy.blocks.name.label, {
      exact: false,
    }) as HTMLInputElement;
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

    const tooShortValue = 'x'.repeat(MESSAGE_MIN_LENGTH - 3);
    await userEvent.type(messageInput, tooShortValue);

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    // First submit with a too-short message: form is invalid and
    // live validation turns on. This should record at least one
    // validation snapshot but must not call the submit helper.
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });

    const baselineCalls = handleUpdate.mock.calls.length;
    expect(submitHelper).not.toHaveBeenCalled();

    // Editing the message while it remains in the same "too_short"
    // error bucket should not cause additional validation snapshots
    // at the flow level.
    await userEvent.type(messageInput, 'xx');
    expect(handleUpdate).toHaveBeenCalledTimes(baselineCalls);

    // Once the value becomes valid, submitting again should:
    // - Call the submit helper exactly once.
    // - Produce exactly one additional validation snapshot with all
    //   blocks valid.
    await userEvent.clear(messageInput);
    const validValue = 'x'.repeat(MESSAGE_MIN_LENGTH);
    await userEvent.type(messageInput, validValue);

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const lastSnapshot = updates[updates.length - 1];
      expect(
        lastSnapshot.some(
          (result) =>
            result.id === 'live-message' && result.valid === true,
        ),
      ).toBe(true);
    });
  });

  it('shifts priority and clears stale errors as different fields become invalid and then recover', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;
    const fetchMock = vi.fn();

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

      // Start with both name and email invalid (empty) and submit.
      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }

        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        expect(
          codes.some((code) => code?.startsWith('form-error-name-')),
        ).toBe(true);
        expect(codes).toContain('form-error-email-invalid');
      });

      // Fix name only; email stays invalid.
      await userEvent.type(nameInput, 'Jane Doe');

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
        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        expect(codes).toContain('form-error-email-invalid');
        expect(
          codes.some((code) => code?.startsWith('form-error-name-')),
        ).toBe(false);
      });

      // Fix email as well; message is still invalid, so we still expect a message-focused error.
      await userEvent.type(emailInput, 'example@example.com');

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
        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        expect(
          codes.some((code) =>
            code?.startsWith('form-error-message-'),
          ),
        ).toBe(true);
        expect(codes).not.toContain('form-error-email-invalid');
        expect(
          codes.some((code) => code?.startsWith('form-error-name-')),
        ).toBe(false);
      });

      // Finally fix the message; name and email errors should be cleared.
      await userEvent.type(messageInput, 'This is a valid message.');

      await waitFor(() => {
        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }

        const lines = Array.from(
          inlineRegion.querySelectorAll('[data-error]'),
        ) as HTMLElement[];
        const codes = lines.map((el) => el.dataset.error);
        const nonTurnstileCodes = codes.filter(
          (code) => code && !code.startsWith('turnstile.'),
        );
        expect(nonTurnstileCodes).toHaveLength(0);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('emits debug events via the custom logger for a happy-path submission', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugLogger(logger);

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
        message: statusMessages.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(
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
        expect(logger).toHaveBeenCalledTimes(2);
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });

  it('emits submit_attempt and submit_result events when debug is enabled for a happy-path submission', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugLogger(logger);

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
        message: statusMessages.success,
      }),
    } as Response);

    global.fetch = fetchMock;

    try {
      renderWrappedContactForm(
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
      turnstileHarness.restore();
    }
  });

  it('does not spam debug events for repeated invalid submissions', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
    setContactFormDebugLogger(logger);

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
      renderWrappedContactForm(copy, '/api/contact');

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      // First invalid submit.
      await userEvent.click(submitButton);

      // Second invalid submit with no meaningful change.
      await userEvent.click(submitButton);

      await waitFor(() => {
        const attemptEvents = logger.mock.calls.filter(
          ([
            event,
          ]) => event.type === 'submit_attempt',
        );
        const resultEvents = logger.mock.calls.filter(
          ([
            event,
          ]) => event.type === 'submit_result',
        );

        expect(attemptEvents.length).toBe(1);
        expect(resultEvents.length).toBe(1);
      });
    } finally {
      global.fetch = originalFetch;
      setContactFormDebugLogger(null);
    }
  });

  it('emits a validation_error submit_result with message in the invalid field summary', async () => {
    const copy = buildCopy();
    const statusMessages = buildStatusMessages(copy);

    const logger = vi.fn();
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
        lastResult.invalidFields.some((field: { id: string }) =>
          field.id.includes('message'),
        ),
      ).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
