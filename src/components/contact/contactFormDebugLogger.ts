'use client';

import { notProd } from '@/lib/runtimeEnv';
import type {
  ContactFormBlockValidationResult,
  ContactFormSubmitStatus,
} from './types/form.types';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

export type ContactFormDebugEventType =
  | 'submit_attempt'
  | 'submit_result';

export type ContactFormDebugSubmitAttemptPayload = {
  name: string;
  email: string;
  messageLength: number;
  tokenPresent: boolean;
  hpValue: string;
};

export type ContactFormDebugInvalidFieldSummary = {
  id: string;
  messageCount: number;
};

export type ContactFormDebugSubmitResultPayload = {
  submitStatus: ContactFormSubmitStatus;
  code: FormServerResponseCode | 'idle';
  invalidFields: ContactFormDebugInvalidFieldSummary[];
};

export type ContactFormDebugEvent =
  | {
      type: 'submit_attempt';
      payload: ContactFormDebugSubmitAttemptPayload;
      timestamp: number;
    }
  | {
      type: 'submit_result';
      payload: ContactFormDebugSubmitResultPayload;
      timestamp: number;
    };

type ContactFormDebugLogger = (event: ContactFormDebugEvent) => void;

let customLogger: ContactFormDebugLogger | null = null;

export const setContactFormDebugLogger = (
  logger: ContactFormDebugLogger | null,
): void => {
  customLogger = logger;
};

const defaultLogger: ContactFormDebugLogger = (event) => {
  // Guard against environments where console is not available.
  if (typeof console === 'undefined') return;
  console.info('[contact][form-debug]', event.type, event.payload);
};

export const logContactFormDebugEvent = (
  type: ContactFormDebugEventType,
  payload:
    | ContactFormDebugSubmitAttemptPayload
    | ContactFormDebugSubmitResultPayload,
): void => {
  if (!notProd()) {
    return;
  }
  const logger = customLogger ?? defaultLogger;
  const timestamp = Date.now();
  if (type === 'submit_attempt') {
    logger({
      type,
      payload: payload as ContactFormDebugSubmitAttemptPayload,
      timestamp,
    });
    return;
  }
  logger({
    type,
    payload: payload as ContactFormDebugSubmitResultPayload,
    timestamp,
  });
};

export const buildInvalidFieldSummary = (
  results: ContactFormBlockValidationResult[],
): ContactFormDebugInvalidFieldSummary[] =>
  results
    .filter((result) => !result.valid)
    .map((result) => ({
      id: result.id,
      messageCount: result.messages.length,
    }));
