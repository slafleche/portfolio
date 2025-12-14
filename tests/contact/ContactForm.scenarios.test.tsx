import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import {
  buildContactFormCopy,
  FORM_ERROR_KEYS,
  type FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';
import {
  enData,
  type EnData,
} from '@/lib/locales/translations/en.data';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { sharedStrings } from '@/lib/sharedStrings';

const buildFormCopy = () =>
  buildContactFormCopy(
    ((key: string) =>
      enFormCopy[key as keyof typeof enFormCopy]) as unknown as Translator,
  );

const buildPrivacy = () =>
  buildPrivacyCopy(
    ((key: string) =>
      enData[key as keyof EnData] ?? key) as unknown as Translator,
  );

const buildStatusMessages = (copy = buildFormCopy()) =>
  copy.statuses as Record<FormStatusKey, string>;

const getInlineStatusRegion = () =>
  document.querySelector(
    '[role="status"][aria-atomic="true"]',
  ) as HTMLElement | null;

const getToastStatusRegion = () =>
  document.querySelector(
    '[role="status"]:not([aria-atomic])',
  ) as HTMLElement | null;

const buildScenarioUrl = (id: string) =>
  `/en?scenario=${encodeURIComponent(id)}${sharedStrings.contactFormHash}`;

const renderScenarioDialog = () => {
  const formCopy = buildFormCopy();
  const privacyCopy = buildPrivacy();

  render(
    <ContactDialogProvider
      formCopy={formCopy}
      privacyCopy={privacyCopy}
      closeLabel="Close"
    >
      <ContactDialogTrigger>Open contact</ContactDialogTrigger>
    </ContactDialogProvider>,
  );

  return { formCopy, statusMessages: buildStatusMessages(formCopy) };
};

describe('ContactForm dev scenarios — URL-driven visual states', () => {
  it('dev scenario recoverable renders a recoverable generic_error state without submit', async () => {
    const scenarioUrl = buildScenarioUrl('recoverable');
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy, statusMessages } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const title = document.querySelector(
      '[data-modal="title"]',
    ) as HTMLElement | null;
    expect(title).not.toBeNull();
    expect(title?.textContent).toBe(formCopy.headings.form);

    const text = document.body.textContent ?? '';
    expect(text).toContain(statusMessages.generic);
  });

  it('dev scenario recoverable-rate_limited renders a recoverable rate_limited state without submit', async () => {
    const scenarioUrl = buildScenarioUrl('recoverable-rate_limited');
    window.history.pushState({}, '', scenarioUrl);

    const { statusMessages } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const text = document.body.textContent ?? '';
    expect(text).toContain(statusMessages.rate_limited);
  });

  it('dev scenario recoverable-service_unavailable renders a recoverable service_unavailable state without submit', async () => {
    const scenarioUrl = buildScenarioUrl(
      'recoverable-service_unavailable',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { statusMessages } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const text = document.body.textContent ?? '';
    expect(text).toContain(statusMessages.service_unavailable);
  });

  it('dev scenario recoverable-validation_server shows a server validation_error summary on the form view', async () => {
    const scenarioUrl = buildScenarioUrl('recoverable-validation_server');
    window.history.pushState({}, '', scenarioUrl);

    const { statusMessages } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const text = document.body.textContent ?? '';
    expect(text).toContain(statusMessages.validation_error);
  });

  it('dev scenario recoverable-validation_client shows multiple client-side validation errors on the form view', async () => {
    const scenarioUrl = buildScenarioUrl(
      'recoverable-validation_client',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { statusMessages } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const text = document.body.textContent ?? '';
    expect(text).toContain(statusMessages.validation_error);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-name_required shows only the name required error', async () => {
    const scenarioUrl = buildScenarioUrl('field_errors-name_required');
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-email_invalid shows only the email invalid error', async () => {
    const scenarioUrl = buildScenarioUrl('field_errors-email_invalid');
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-message_required shows only the message required error', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-message_required',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-message_too_short shows only the message too_short error', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-message_too_short',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-message_too_many_links shows only the message too_many_links error', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-message_too_many_links',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-name_too_long shows only the name too_long error', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-name_too_long',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText = formCopy.blocks.name.errors.tooLong;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This test currently fails; it specifies future behaviour for field prefill + validation wiring.
  it('dev scenario field_errors-message_too_long shows only the message too_long error', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-message_too_long',
    );
    window.history.pushState({}, '', scenarioUrl);

    const { formCopy } = renderScenarioDialog();

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const messageErrors = formCopy.blocks.message.errors;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).toContain(messageErrors.tooLong);
    expect(text).not.toContain(messageErrors.tooManyLinks);
  });

  // NOTE: This scenario models a server-driven validation_error where
  // all fields, including token, are invalid.
  it('dev scenario field_errors-all_fields_invalid shows name, email, message, and token errors', async () => {
    const scenarioUrl = buildScenarioUrl(
      'field_errors-all_fields_invalid',
    );
    window.history.pushState({}, '', scenarioUrl);

    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    render(
      <ContactDialogProvider
        formCopy={formCopy}
        privacyCopy={privacyCopy}
        closeLabel="Close"
      >
        <ContactDialogTrigger>Open contact</ContactDialogTrigger>
      </ContactDialogProvider>,
    );

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const messageErrors = formCopy.blocks.message.errors;
    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const tokenMissingText =
      formCopy.blocks.turnstile.summary.missing;

    const text = document.body.textContent ?? '';
    expect(text).toContain(nameErrorText);
    expect(text).toContain(emailErrorText);
    expect(text).toContain(messageErrors.tooShort);
    expect(text).toContain(tokenMissingText);

    const turnstileStatus = document.querySelector(
      '[data-form-turnstile="status"]',
    ) as HTMLElement | null;
    expect(turnstileStatus).not.toBeNull();
    if (!turnstileStatus) return;
    const turnstileHint = turnstileStatus.querySelector(
      '[data-form-hint]',
    ) as HTMLElement | null;
    expect(turnstileHint).not.toBeNull();
    if (!turnstileHint) return;
    expect(turnstileHint.dataset.formHint).toBe('error');
    expect(turnstileHint.textContent ?? '').toContain(tokenMissingText);
  });

  // NOTE: This scenario models a server-driven validation_error where
  // only the Turnstile token is invalid while all fields remain valid.
  it('dev scenario field_errors-token_missing shows only the token missing error while fields stay valid', async () => {
    const scenarioUrl = buildScenarioUrl('field_errors-token_missing');
    window.history.pushState({}, '', scenarioUrl);

    const formCopy = buildFormCopy();
    const privacyCopy = buildPrivacy();

    render(
      <ContactDialogProvider
        formCopy={formCopy}
        privacyCopy={privacyCopy}
        closeLabel="Close"
      >
        <ContactDialogTrigger>Open contact</ContactDialogTrigger>
      </ContactDialogProvider>,
    );

    await waitFor(() => {
      const formPanel = document.querySelector(
        '[data-form="form"]',
      );
      expect(formPanel).not.toBeNull();
    });

    const loadingPanel = document.querySelector('[data-form="loading"]');
    const errorPanel = document.querySelector('[data-form="error"]');
    expect(loadingPanel).toBeNull();
    expect(errorPanel).toBeNull();

    const messageErrors = formCopy.blocks.message.errors;
    const nameErrorText =
      formCopy.blocks.name.errors.required ??
      formCopy.blocks.name.label;
    const emailErrorText =
      formCopy.blocks.email.errors?.invalid ??
      formCopy.blocks.email.label;
    const tokenMissingText =
      formCopy.blocks.turnstile.summary.missing;

    const text = document.body.textContent ?? '';
    expect(text).not.toContain(nameErrorText);
    expect(text).not.toContain(emailErrorText);
    expect(text).toContain(tokenMissingText);
    expect(text).not.toContain(messageErrors.required);
    expect(text).not.toContain(messageErrors.tooShort);
    expect(text).not.toContain(messageErrors.tooManyLinks);

    const turnstileStatus = document.querySelector(
      '[data-form-turnstile="status"]',
    ) as HTMLElement | null;
    expect(turnstileStatus).not.toBeNull();
    if (!turnstileStatus) return;
    const turnstileHint = turnstileStatus.querySelector(
      '[data-form-hint]',
    ) as HTMLElement | null;
    expect(turnstileHint).not.toBeNull();
    if (!turnstileHint) return;
    expect(turnstileHint.dataset.formHint).toBe('error');
    expect(turnstileHint.textContent ?? '').toContain(tokenMissingText);
  });
});
