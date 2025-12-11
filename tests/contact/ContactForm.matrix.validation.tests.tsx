import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';
import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import {
  makeMessageBase,
  makeValidationResult,
} from './helpers/messageFactories.helpers';
import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';

const STATUS_MESSAGES: Record<FormStatusKey, string> = {
  sending: 'sending',
  success: 'success',
  generic: 'generic',
  validation_error: 'validation_error',
  rate_limited: 'rate_limited',
  service_unavailable: 'service_unavailable',
  not_configured: 'not_configured',
  blocked: 'blocked',
};

const makeValidation = (
  id: string,
  valid: boolean,
): ContactFormBlockValidationResult =>
  makeValidationResult({
    id,
    valid,
    messages: valid
      ? []
      : [
          makeMessageBase({
            type: 'error',
            text: `${id} error`,
            scrollTarget: id,
          }),
        ],
  });

const makePayload = (
  id: string,
  value: unknown,
): ContactFormBlockPayload<unknown> => ({
  id,
  value,
});

describe('ContactForm matrix — validation vs message centre and jump button', () => {
  it('shows validation banner and jump button when a block is invalid (client-side validation_error)', async () => {
    const blocks = [
      {
        key: 'name',
        id: 'name',
        validationResult: makeValidation('name', false),
        payload: makePayload('name', ''),
      },
      {
        key: 'email',
        id: 'email',
        validationResult: makeValidation('email', true),
        payload: makePayload('email', 'example@example.com'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, queryByTestId, getByRole } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
        ],
      });

    submit();

    await waitFor(() => {
      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      if (!inlineRegion) return;
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain('validation_error');
      expect(text).toContain('name error');
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('shows validation banner and jump button when server-driven validation_error occurs with all blocks locally valid', async () => {
    const blocks = [
      {
        key: 'name',
        id: 'name',
        validationResult: makeValidation('name', true),
        payload: makePayload('name', 'Jane Doe'),
      },
      {
        key: 'email',
        id: 'email',
        validationResult: makeValidation('email', true),
        payload: makePayload('email', 'example@example.com'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('validation_error');

    const { submit, container, queryByTestId, getByRole } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    const inlineRegion = container.querySelector(
      '[role="status"][aria-atomic="true"]',
    ) as HTMLElement | null;
    expect(inlineRegion).not.toBeNull();
    if (!inlineRegion) return;
    const text = inlineRegion.textContent ?? '';
    expect(text).toContain('validation_error');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'validation_error',
    );

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('shows a non-validation banner but no jump button when the form is valid and rate-limited', async () => {
    const blocks = [
      {
        key: 'name',
        id: 'name',
        validationResult: makeValidation('name', true),
        payload: makePayload('name', 'Jane Doe'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('rate_limited');

    const { submit, container, queryByTestId, getByRole } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    const inlineRegion = container.querySelector(
      '[role="status"][aria-atomic="true"]',
    ) as HTMLElement | null;
    expect(inlineRegion).not.toBeNull();
    if (!inlineRegion) return;
    const text = inlineRegion.textContent ?? '';
    expect(text).toContain('rate_limited');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'rate_limited',
    );

    expect(queryByTestId('jump-to-first-issue')).toBeNull();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows a catastrophic banner and no jump button when not_configured is returned', async () => {
    const blocks = [
      {
        key: 'name',
        id: 'name',
        validationResult: makeValidation('name', true),
        payload: makePayload('name', 'Jane Doe'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('not_configured');

    const { submit, container, queryByTestId, getByRole } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    const inlineRegion = container.querySelector(
      '[role="status"][aria-atomic="true"]',
    ) as HTMLElement | null;
    expect(inlineRegion).not.toBeNull();
    if (!inlineRegion) return;
    const text = inlineRegion.textContent ?? '';
    expect(text).toContain('not_configured');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'not_configured',
    );

    expect(queryByTestId('jump-to-first-issue')).toBeNull();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });
});

