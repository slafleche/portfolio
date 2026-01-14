import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';
import {
  makeMessageBase,
  makeValidationResult,
} from './helpers/messageFactories.helpers';

const buildFormCopy = () =>
  buildContactFormCopy(
    ((key: string) =>
      enFormCopy[key as keyof typeof enFormCopy]) as unknown as Translator,
  );

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
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
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
        statusMessages,
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
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);
      expect(text).toContain('name error');

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();

      const submitButton = getByRole('button', {
        name: 'Submit',
      });
      expect(submitButton).toBeDisabled();
    });

    expect(submitHelper).not.toHaveBeenCalled();
  });

  it('shows validation banner and jump button when server-driven validation_error occurs with all blocks locally valid', async () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
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
        statusMessages,
        blockOrder: [
          'name',
          'email',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);

      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      const text = inlineRegion?.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion?.textContent ?? '').toContain(
        statusMessages.validation_error,
      );

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();

      const submitButton = getByRole('button', {
        name: 'Submit',
      });
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows a non-validation banner but no jump button when the form is valid and rate-limited', async () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
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
        statusMessages,
        blockOrder: [
          'name',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);

      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      const text = inlineRegion?.textContent ?? '';
      expect(text).toContain(statusMessages.rate_limited);

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion?.textContent ?? '').toContain(
        statusMessages.rate_limited,
      );

      expect(queryByTestId('jump-to-first-issue')).toBeNull();

      const submitButton = getByRole('button', {
        name: 'Submit',
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows a not_configured summary and no jump button when not_configured is returned', async () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
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
        statusMessages,
        blockOrder: [
          'name',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);

      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      const text = inlineRegion?.textContent ?? '';
      expect(text).toContain(statusMessages.not_configured);

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion?.textContent ?? '').toContain(
        statusMessages.not_configured,
      );

      expect(queryByTestId('jump-to-first-issue')).toBeNull();

      const submitButton = getByRole('button', {
        name: 'Submit',
      });
      expect(submitButton).toBeDisabled();
    });
  });
});
