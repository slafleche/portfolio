import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';

import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';
import { enFormTranslator } from './helpers/enFormTranslator';
import {
  makeMessageBase,
  makeValidationResult,
} from './helpers/messageFactories.helpers';

const buildFormCopy = () => buildContactFormCopy(enFormTranslator);

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
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
        statusMessages,
        blockOrder: [
          'name',
          'email',
          'message',
        ],
      });

    submit();

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);

      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      expect(inlineRegion?.textContent ?? '').toBe('');

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion).toBeNull();

      expect(queryByTestId('jump-to-first-issue')).toBeNull();
    });
  });

  it('surfaces a single-block validation error when only Name is invalid', async () => {
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
        statusMessages,
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
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);
      expect(text).toContain('name error');

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();
  });

  it('surfaces a single-block validation error when only Email is invalid', async () => {
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
        statusMessages,
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
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);
      expect(text).toContain('email error');

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();
    });

    expect(submitHelper).not.toHaveBeenCalled();
    expect(queryByTestId('jump-to-first-issue')).not.toBeNull();
  });

  it('surfaces a single-block validation error when only Message is invalid', async () => {
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
        statusMessages,
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
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);
      expect(text).toContain('message error');

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();
    });

    expect(submitHelper).not.toHaveBeenCalled();
    expect(queryByTestId('jump-to-first-issue')).not.toBeNull();
  });

  it('surfaces multiple block validation errors and prioritises the earliest block in order', async () => {
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
        statusMessages,
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
      if (!inlineRegion) {
        throw new Error('Expected inline status region to render.');
      }
      const text = inlineRegion.textContent ?? '';
      expect(text).toContain(statusMessages.validation_error);
      expect(text).toContain('name error');
      expect(text).toContain('email error');

      const jumpButton = queryByTestId('jump-to-first-issue');
      expect(jumpButton).not.toBeNull();
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();
    if (!jumpButton) {
      throw new Error(
        'Expected jump-to-first-issue control to render.',
      );
    }
    jumpButton.click();
    expect(onJumpToFirstIssue).toHaveBeenCalledWith('name');
  });

  it('treats a verification failure (blocked) as a catastrophic non-field error with no jump-to-first-issue', async () => {
    const formCopy = buildFormCopy();
    const statusMessages = formCopy.blocks.messageCentre.statuses;
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
      expect(text).toContain(statusMessages.blocked);

      const messageCentreRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(messageCentreRegion?.textContent ?? '').toContain(
        statusMessages.blocked,
      );

      expect(queryByTestId('jump-to-first-issue')).toBeNull();
    });

    const submitButton = getByRole('button', {
      name: formCopy.submitLabel,
    });
    expect(submitButton).toBeDisabled();
  });
});
