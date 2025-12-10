'use client';

import { useMemo } from 'react';
import type {
  ContactFormBlockValidationResult,
  ContactFormSubmitStatus,
} from './types/form.types';
import type {
  MessageBase,
  MessageCentreMessages,
} from './messageCentre.types';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';

export type ContactFormOutcomePriorityMessage = {
  type: MessageBase['type'];
  text: string;
  scrollTarget?: string;
};

export type ContactFormOutcomePriority = {
  message: ContactFormOutcomePriorityMessage | null;
  higherOrderSummary?: string;
  isCatastrophic: boolean;
};

export type ContactFormOutcomeResult = {
  messagesForUi: MessageCentreMessages;
  priority: ContactFormOutcomePriority;
  hasErrors: boolean;
  isCatastrophic: boolean;
};

export type ContactFormOutcomeConfig = {
  statusMessages: Record<FormStatusKey, string>;
  blockOrder?: string[];
};

type OutcomeBuildInput = {
  submitStatus: ContactFormSubmitStatus;
  latestValidationResults: ContactFormBlockValidationResult[];
};

const severityRank = (type: MessageBase['type']): number => {
  switch (type) {
    case 'catastrophic':
      return 3;
    case 'error':
      return 2;
    case 'warning':
      return 1;
    case 'info':
    default:
      return 0;
  }
};

const mapSubmitStatusToStatusKey = (
  submitStatus: ContactFormSubmitStatus,
): FormStatusKey | null => {
  switch (submitStatus) {
    case 'success':
      return null;
    case 'validation_error':
      return 'validation_error';
    case 'rate_limited':
      return 'rate_limited';
    case 'service_unavailable':
      return 'service_unavailable';
    case 'not_configured':
      return 'not_configured';
    case 'blocked':
      return 'blocked';
    case 'generic_error':
      return 'generic';
    case 'idle':
    default:
      return null;
  }
};

export function buildContactFormOutcome(
  input: OutcomeBuildInput,
  config: ContactFormOutcomeConfig,
): ContactFormOutcomeResult {
  const { submitStatus, latestValidationResults } = input;
  const { statusMessages, blockOrder } = config;

  const messagesForUi: MessageCentreMessages = {
    globals: [],
    blocks: [],
    toastFallback: undefined,
  };

  const allMessages: {
    blockId: string;
    message: MessageBase;
  }[] = [];

  latestValidationResults.forEach((result) => {
    result.messages.forEach((message) => {
      allMessages.push({ blockId: result.id, message });
    });

    const blockMessage = result.messages.find((message) =>
      [
        'catastrophic',
        'error',
        'warning',
      ].includes(message.type),
    );
    if (blockMessage) {
      messagesForUi.blocks.push(blockMessage.text);
    }
  });

  let priorityMessage: ContactFormOutcomePriorityMessage | null =
    null;

  if (allMessages.length > 0) {
    let bestIndex = -1;
    let bestRank = -1;
    let bestBlockRank = Number.POSITIVE_INFINITY;

    allMessages.forEach((entry, index) => {
      const rank = severityRank(entry.message.type);
      const blockRank =
        blockOrder && blockOrder.length
          ? (() => {
              const indexInOrder = blockOrder.indexOf(entry.blockId);
              return indexInOrder === -1
                ? blockOrder.length + index
                : indexInOrder;
            })()
          : index;

      if (
        rank > bestRank ||
        (rank === bestRank && blockRank < bestBlockRank)
      ) {
        bestRank = rank;
        bestBlockRank = blockRank;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0) {
      const { message } = allMessages[bestIndex];
      priorityMessage = {
        type: message.type,
        text: message.text,
        scrollTarget: message.scrollTarget,
      };
    }
  }

  const statusKey = mapSubmitStatusToStatusKey(submitStatus);
  const statusSummary =
    statusKey != null ? statusMessages[statusKey] : undefined;

  if (statusSummary) {
    messagesForUi.globals.push(statusSummary);
  }

  if (statusSummary) {
    switch (submitStatus) {
      case 'validation_error':
      case 'rate_limited':
      case 'service_unavailable':
      case 'not_configured':
      case 'blocked':
      case 'generic_error':
        messagesForUi.toastFallback = statusSummary;
        break;
      default:
        break;
    }
  }

  if (
    !priorityMessage &&
    statusSummary &&
    submitStatus !== 'success' &&
    submitStatus !== 'idle'
  ) {
    const type: MessageBase['type'] =
      submitStatus === 'not_configured' ? 'catastrophic' : 'error';
    priorityMessage = {
      type,
      text: statusSummary,
    };
  }

  const hasErrors =
    allMessages.some((entry) =>
      [
        'catastrophic',
        'error',
      ].includes(entry.message.type),
    ) ||
    (!!priorityMessage &&
      [
        'catastrophic',
        'error',
      ].includes(priorityMessage.type));

  const isCatastrophic = priorityMessage?.type === 'catastrophic';

  const priority: ContactFormOutcomePriority = {
    message: priorityMessage,
    higherOrderSummary: messagesForUi.toastFallback,
    isCatastrophic,
  };

  return {
    messagesForUi,
    priority,
    hasErrors,
    isCatastrophic,
  };
}

type UseContactFormOutcomeParams = OutcomeBuildInput & {
  config: ContactFormOutcomeConfig;
};

export function useContactFormOutcome({
  submitStatus,
  latestValidationResults,
  config,
}: UseContactFormOutcomeParams): ContactFormOutcomeResult {
  return useMemo(
    () =>
      buildContactFormOutcome(
        { submitStatus, latestValidationResults },
        config,
      ),
    [
      config,
      latestValidationResults,
      submitStatus,
    ],
  );
}
