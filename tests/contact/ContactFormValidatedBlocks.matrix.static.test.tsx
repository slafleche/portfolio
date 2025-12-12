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

describe('ContactForm validated blocks — static matrix', () => {
  it('treats all blocks valid as a clean success: no banner, no jump-to-first-issue', async () => {
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
      {
        key: 'message',
        id: 'message',
        validationResult: makeValidation('message', true),
        payload: makePayload(
          'message',
          'This is a sufficiently long message.',
        ),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
          'message',
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
    expect(inlineRegion.textContent ?? '').toBe('');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion).toBeNull();

    expect(queryByTestId('jump-to-first-issue')).toBeNull();
  });

  it('surfaces a single-block validation error when only Name is invalid', async () => {
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
      {
        key: 'message',
        id: 'message',
        validationResult: makeValidation('message', true),
        payload: makePayload(
          'message',
          'This is a sufficiently long message.',
        ),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
          'message',
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
  });

  it('surfaces a single-block validation error when only Email is invalid', async () => {
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
        validationResult: makeValidation('email', false),
        payload: makePayload('email', 'not-an-email'),
      },
      {
        key: 'message',
        id: 'message',
        validationResult: makeValidation('message', true),
        payload: makePayload(
          'message',
          'This is a sufficiently long message.',
        ),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
          'message',
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
      expect(text).toContain('email error');
    });

    expect(submitHelper).not.toHaveBeenCalled();
    expect(queryByTestId('jump-to-first-issue')).not.toBeNull();
  });

  it('surfaces a single-block validation error when only Message is invalid', async () => {
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
      {
        key: 'message',
        id: 'message',
        validationResult: makeValidation('message', false),
        payload: makePayload('message', 'too short'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
          'message',
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
      expect(text).toContain('message error');
    });

    expect(submitHelper).not.toHaveBeenCalled();
    expect(queryByTestId('jump-to-first-issue')).not.toBeNull();
  });

  it('surfaces multiple block validation errors and prioritises the earliest block in order', async () => {
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
        validationResult: makeValidation('email', false),
        payload: makePayload('email', 'not-an-email'),
      },
      {
        key: 'message',
        id: 'message',
        validationResult: makeValidation('message', true),
        payload: makePayload(
          'message',
          'This is a sufficiently long message.',
        ),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const onJumpToFirstIssue = vi.fn();

    const { submit, container, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'name',
          'email',
          'message',
        ],
        onJumpToFirstIssue,
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
      expect(text).toContain('email error');
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();
    if (!jumpButton) return;
    jumpButton.click();
    expect(onJumpToFirstIssue).toHaveBeenCalledWith('name');
  });

  it('treats a verification failure (blocked) as a catastrophic non-field error with no jump-to-first-issue', async () => {
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
      .mockResolvedValue('blocked');

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
    expect(text).toContain('blocked');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain('blocked');

    expect(queryByTestId('jump-to-first-issue')).toBeNull();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });
});
