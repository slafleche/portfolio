'use client';

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

let explicitEnabled: boolean | null = null;
let customLogger: ContactFormDebugLogger | null = null;

const isProduction = process.env.NODE_ENV === 'production';

const resolveEnvEnabled = (): boolean => {
  if (isProduction) return false;
  const value = process.env.NEXT_PUBLIC_CONTACT_FORM_DEBUG;
  if (!value) return false;
  const normalised = value.trim().toLowerCase();
  return normalised === '1' || normalised === 'true';
};

export const isContactFormDebugEnabled = (): boolean => {
  if (explicitEnabled !== null) {
    return explicitEnabled;
  }
  return resolveEnvEnabled();
};

export const setContactFormDebugEnabled = (
  enabled: boolean | null,
): void => {
  explicitEnabled = enabled;
};

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
  if (!isContactFormDebugEnabled()) {
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

