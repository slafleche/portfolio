import { describe, expect,it } from 'vitest';

import {
  type ContactFormOutcomeResult,
  useContactFormOutcome,
} from '@/components/contact/useContactFormOutcome';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

import type { ContactFormFlowSnapshot } from './helpers/flowSnapshot.helpers';
import { makeFlowSnapshot } from './helpers/flowSnapshot.helpers';
import {
  makeMessageBase,
  makeValidationResult,
} from './helpers/messageFactories.helpers';
import {
  type OutcomeHook,
  renderOutcomeHook,
} from './helpers/outcome.harness';

const buildFormCopy = () =>
  buildContactFormCopy(
    ((key: string) =>
      enFormCopy[key as keyof typeof enFormCopy]) as unknown as Translator,
  );

const BLOCK_ORDER = [
  'first',
  'second',
  'token',
];

const useTestOutcome: OutcomeHook<ContactFormOutcomeResult> = (
  snapshot: ContactFormFlowSnapshot,
) => {
  const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
  return useContactFormOutcome({
    submitStatus: snapshot.submitStatus,
    latestValidationResults: snapshot.latestValidationResults,
    config: {
      statusMessages,
      blockOrder: BLOCK_ORDER,
    },
  });
};

describe('ContactFormOutcome', () => {
  it('returns empty messages and no priority for idle state with no validation results', () => {
    const snapshot = makeFlowSnapshot();

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();
    expect(outcome.messagesForUi.globals).toEqual([]);
    expect(outcome.messagesForUi.blocks).toEqual([]);
    expect(outcome.messagesForUi.messageFallback).toBeUndefined();
    expect(outcome.priority.message).toBeNull();
    expect(outcome.hasErrors).toBe(false);
    expect(outcome.isCatastrophic).toBe(false);
  });

  it('builds validation error summaries and selects a priority error message', () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
    const snapshot: ContactFormFlowSnapshot = makeFlowSnapshot({
      submitStatus: 'validation_error',
      latestValidationResults: [
        makeValidationResult({
          id: 'first',
          messages: [
            makeMessageBase({
              type: 'error',
              text: 'First field error',
              scrollTarget: 'first',
            }),
          ],
        }),
        makeValidationResult({
          id: 'second',
          messages: [
            makeMessageBase({
              type: 'error',
              text: 'Second field error',
              scrollTarget: 'second',
            }),
          ],
        }),
      ],
    });

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();

    expect(outcome.messagesForUi.globals).toEqual([
      statusMessages.validation_error,
    ]);
    expect(outcome.messagesForUi.blocks).toEqual([
      'First field error',
      'Second field error',
    ]);
    expect(outcome.messagesForUi.messageFallback).toBe(
      statusMessages.validation_error,
    );

    expect(outcome.priority.message).not.toBeNull();
    if (!outcome.priority.message) return;

    expect(outcome.priority.message.type).toBe('error');
    expect(outcome.priority.message.text).toBe('First field error');
    expect(outcome.priority.message.scrollTarget).toBe('first');
    expect(outcome.priority.higherOrderSummary).toBe(
      statusMessages.validation_error,
    );
    expect(outcome.hasErrors).toBe(true);
    expect(outcome.isCatastrophic).toBe(false);
  });

  it('uses block order as a tiebreaker when severity is equal', () => {
    const snapshot: ContactFormFlowSnapshot = makeFlowSnapshot({
      submitStatus: 'validation_error',
      latestValidationResults: [
        makeValidationResult({
          id: 'second',
          messages: [
            makeMessageBase({
              type: 'error',
              text: 'Second field error',
            }),
          ],
        }),
        makeValidationResult({
          id: 'first',
          messages: [
            makeMessageBase({
              type: 'error',
              text: 'First field error',
            }),
          ],
        }),
      ],
    });

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();

    expect(outcome.priority.message).not.toBeNull();
    if (!outcome.priority.message) return;

    expect(outcome.priority.message.text).toBe('First field error');
  });

  it('treats not_configured as catastrophic when there are no block messages', () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
    const snapshot: ContactFormFlowSnapshot = makeFlowSnapshot({
      submitStatus: 'not_configured',
      latestValidationResults: [],
    });

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();

    expect(outcome.messagesForUi.globals).toEqual([
      statusMessages.not_configured,
    ]);
    expect(outcome.messagesForUi.blocks).toEqual([]);
    expect(outcome.messagesForUi.messageFallback).toBe(
      statusMessages.not_configured,
    );

    expect(outcome.priority.message).not.toBeNull();
    if (!outcome.priority.message) return;

    expect(outcome.priority.message.type).toBe('urgent');
    expect(outcome.priority.message.text).toBe(
      statusMessages.not_configured,
    );
    expect(outcome.hasErrors).toBe(true);
    expect(outcome.isCatastrophic).toBe(true);
  });

  it('treats blocked as catastrophic when there are no block messages', () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
    const snapshot: ContactFormFlowSnapshot = makeFlowSnapshot({
      submitStatus: 'blocked',
      latestValidationResults: [],
    });

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();

    expect(outcome.messagesForUi.globals).toEqual([
      statusMessages.blocked,
    ]);
    expect(outcome.messagesForUi.blocks).toEqual([]);
    expect(outcome.messagesForUi.messageFallback).toBe(
      statusMessages.blocked,
    );

    expect(outcome.priority.message).not.toBeNull();
    if (!outcome.priority.message) return;

    expect(outcome.priority.message.type).toBe('urgent');
    expect(outcome.priority.message.text).toBe(
      statusMessages.blocked,
    );
    expect(outcome.hasErrors).toBe(true);
    expect(outcome.isCatastrophic).toBe(true);
  });

  it('maps non-success server statuses to global summaries and messageCentre fallback', () => {
    const statusMessages = buildFormCopy().blocks.messageCentre.statuses;
    const nonSuccessStatuses: ContactFormFlowSnapshot['submitStatus'][] =
      [
        'rate_limited',
        'service_unavailable',
        'generic_error',
      ];

    nonSuccessStatuses.forEach((status) => {
      const snapshot = makeFlowSnapshot({
        submitStatus: status,
        latestValidationResults: [],
      });

      const { getLatestOutcome, rerenderWithSnapshot } =
        renderOutcomeHook(useTestOutcome, snapshot);

      const outcome = getLatestOutcome();

      const expectedSummary =
        status === 'generic_error'
          ? statusMessages.generic
          : statusMessages[status];

      expect(outcome.messagesForUi.globals).toEqual([
        expectedSummary,
      ]);
      expect(outcome.messagesForUi.messageFallback).toBe(
        expectedSummary,
      );

      expect(outcome.priority.message).not.toBeNull();
      if (!outcome.priority.message) return;

      expect(outcome.priority.message.type).toBe('error');
      expect(outcome.priority.message.text).toBe(expectedSummary);
      expect(outcome.hasErrors).toBe(true);
      expect(outcome.isCatastrophic).toBe(false);

      rerenderWithSnapshot(
        makeFlowSnapshot({
          submitStatus: 'idle',
          latestValidationResults: [],
        }),
      );
    });
  });

  it('treats success with no error messages as a non-error, non-catastrophic state', () => {
    const snapshot: ContactFormFlowSnapshot = makeFlowSnapshot({
      submitStatus: 'success',
      latestValidationResults: [],
    });

    const { getLatestOutcome } = renderOutcomeHook(
      useTestOutcome,
      snapshot,
    );

    const outcome = getLatestOutcome();

    expect(outcome.messagesForUi.globals).toEqual([]);
    expect(outcome.messagesForUi.blocks).toEqual([]);
    expect(outcome.messagesForUi.messageFallback).toBeUndefined();
    expect(outcome.priority.message).toBeNull();
    expect(outcome.hasErrors).toBe(false);
    expect(outcome.isCatastrophic).toBe(false);
  });
});
