import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';
import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';
import {
  makeMessageBase,
  makeValidationResult,
} from './helpers/messageFactories.helpers';

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

describe('Contact form shell harness', () => {
  it('runs the full happy path: valid blocks → submit helper → success summary in message centre', async () => {
    const blocks = [
      {
        key: 'first',
        id: 'first',
        validationResult: makeValidation('first', true),
        payload: makePayload('first', 'value-1'),
      },
      {
        key: 'second',
        id: 'second',
        validationResult: makeValidation('second', true),
        payload: makePayload('second', 'value-2'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container } = renderContactFormShellHarness({
      blocks,
      submitHelper,
      statusMessages: STATUS_MESSAGES,
      blockOrder: [
        'first',
        'second',
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
  });

  it('surfaces validation errors from blocks and flow as inline and toast summaries', async () => {
    const blocks = [
      {
        key: 'first',
        id: 'first',
        validationResult: makeValidation('first', false),
        payload: makePayload('first', 'value-1'),
      },
    ];

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const onJumpToFirstIssue = vi.fn();

    const { submit, container, getByRole, queryByTestId } =
      renderContactFormShellHarness({
        blocks,
        submitHelper,
        statusMessages: STATUS_MESSAGES,
        blockOrder: [
          'first',
        ],
        onJumpToFirstIssue,
      });

    submit();

    await waitFor(() => {
      // MessageCentreBlock sets data-visible="true" when messages exist.
      const statusWrapper = container.querySelector(
        '[data-visible="true"]',
      );
      expect(statusWrapper).not.toBeNull();
    });

    const inlineRegion = container.querySelector(
      '[role="status"][aria-atomic="true"]',
    ) as HTMLElement | null;
    expect(inlineRegion).not.toBeNull();
    if (!inlineRegion) return;

    const inlineText = inlineRegion.textContent ?? '';
    expect(inlineText).toContain('validation_error');
    expect(inlineText).toContain('first error');

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'validation_error',
    );

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).not.toBeNull();
    if (!jumpButton) return;

    jumpButton.click();
    expect(onJumpToFirstIssue).toHaveBeenCalledWith('first');
  });

  it('treats a no-blocks configuration as not_configured and surfaces a catastrophic-style summary', async () => {
    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const { submit, container, getByRole, queryByTestId } =
      renderContactFormShellHarness({
        blocks: [],
        submitHelper,
        statusMessages: STATUS_MESSAGES,
      });

    submit();

    await waitFor(() => {
      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      if (!inlineRegion) return;
      expect(inlineRegion.textContent ?? '').toContain(
        'not_configured',
      );
    });

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'not_configured',
    );

    expect(submitHelper).not.toHaveBeenCalled();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).toBeNull();
  });

  it('surfaces non-success server statuses via the message centre when validation passes', async () => {
    const blocks = [
      {
        key: 'first',
        id: 'first',
        validationResult: makeValidation('first', true),
        payload: makePayload('first', 'value-1'),
      },
    ];

    const nonSuccessStatuses: ContactFormFlowSubmitHelper[] = [
      vi.fn().mockResolvedValue('rate_limited'),
      vi.fn().mockResolvedValue('service_unavailable'),
      vi.fn().mockResolvedValue('blocked'),
      vi.fn().mockResolvedValue('generic_error'),
    ];

    const expectedSummaries = [
      'rate_limited',
      'service_unavailable',
      'blocked',
      'generic',
    ];

    for (
      let index = 0;
      index < nonSuccessStatuses.length;
      index += 1
    ) {
      const submitHelper = nonSuccessStatuses[index];
      const expectedSummary = expectedSummaries[index];

      const { submit, container, unmount } =
        renderContactFormShellHarness({
          blocks,
          submitHelper,
          statusMessages: STATUS_MESSAGES,
          blockOrder: [
            'first',
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
      const inlineText = inlineRegion.textContent ?? '';
      expect(inlineText).toContain(expectedSummary);

      const toastRegion = container.querySelector(
        '[role="status"]:not([aria-atomic])',
      );
      expect(toastRegion?.textContent ?? '').toContain(
        expectedSummary,
      );

      unmount();
    }
  });
});
