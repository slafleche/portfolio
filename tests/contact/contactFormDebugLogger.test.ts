import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  buildInvalidFieldSummary,
  logContactFormDebugEvent,
  setContactFormDebugLogger,
} from '@/components/contact/contactFormDebugLogger';
import type {
  ContactFormBlockValidationResult,
  ContactFormSubmitStatus,
} from '@/components/contact/types/form.types';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

import { installTestEnv } from '../helpers/testEnvVars';

let restoreEnv: (() => void) | null = null;

beforeEach(() => {
  restoreEnv = installTestEnv();
});

afterEach(() => {
  restoreEnv?.();
  restoreEnv = null;
  setContactFormDebugLogger(null);
});

describe('contactFormDebugLogger', () => {
  it('emits structured attempt and result events when enabled', () => {
    const logger = vi.fn();
    setContactFormDebugLogger(logger);

    logContactFormDebugEvent('submit_attempt', {
      name: 'Alice',
      email: 'alice@example.com',
      messageLength: 42,
      tokenPresent: true,
      hpValue: 'hp',
    });

    const submitStatus: ContactFormSubmitStatus = 'validation_error';
    const code: FormServerResponseCode = 'validation_error';

    logContactFormDebugEvent('submit_result', {
      submitStatus,
      code,
      invalidFields: [
        {
          id: 'message',
          messageCount: 1,
        },
      ],
    });

    expect(logger).toHaveBeenCalledTimes(2);

    const firstEvent = logger.mock.calls[0][0];
    expect(firstEvent.type).toBe('submit_attempt');
    expect(firstEvent.payload).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      messageLength: 42,
      tokenPresent: true,
      hpValue: 'hp',
    });

    const secondEvent = logger.mock.calls[1][0];
    expect(secondEvent.type).toBe('submit_result');
    expect(secondEvent.payload).toEqual({
      submitStatus,
      code,
      invalidFields: [
        {
          id: 'message',
          messageCount: 1,
        },
      ],
    });
  });

  it('buildInvalidFieldSummary summarises invalid fields', () => {
    const results: ContactFormBlockValidationResult[] = [
      {
        id: 'name',
        valid: true,
        messages: [],
      },
      {
        id: 'email',
        valid: false,
        messages: [
          {
            type: 'error',
            code: 'email.invalid',
            text: 'Invalid email',
          },
        ],
      },
      {
        id: 'message',
        valid: false,
        messages: [
          {
            type: 'error',
            code: 'message.too_short',
            text: 'Too short',
          },
          {
            type: 'error',
            code: 'message.required',
            text: 'Required',
          },
        ],
      },
    ];

    const summary = buildInvalidFieldSummary(results);

    expect(summary).toEqual([
      {
        id: 'email',
        messageCount: 1,
      },
      {
        id: 'message',
        messageCount: 2,
      },
    ]);
  });
});
