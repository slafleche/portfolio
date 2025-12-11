import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { ContactFormDraft } from '@/modules/contactForm/validation';

const ORIGINAL_ENV = { ...process.env };

const buildDraft = (): ContactFormDraft => ({
  name: 'Test Sender',
  email: 'example@example.com',
  message: 'Hello from a test payload with enough length.',
  token: 'turnstile-token',
  hp: '',
});

const assignBaseEnv = () => {
  process.env = {
    ...ORIGINAL_ENV,
    BREVO_API_KEY: 'test-key',
    MAIL_FROM: 'portfolio@example.com',
    MAIL_TO: 'owner@example.com',
    BREVO_TIMEOUT_MS: '5',
    BREVO_RETRY_DELAY_MS: '1',
    BREVO_RETRY_JITTER_MS: '0',
  } as NodeJS.ProcessEnv;
};

const createAbortError = () => {
  const error = new Error('Request aborted');
  error.name = 'AbortError';
  return error;
};

describe('deliverContactMessage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useRealTimers();
    assignBaseEnv();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('returns ok on successful Brevo delivery', async () => {
    const successfulFetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal('fetch', successfulFetch);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(successfulFetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
    expect(result.retries).toBe(0);
    expect(result.retryReasons).toEqual([]);
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0]).toMatchObject({
      attempt: 1,
      status: 202,
    });
  });

  it('retries once on non-timeout network errors', async () => {
    const networkError = new Error('network down');
    const failingFetch = vi
      .fn()
      .mockRejectedValue(networkError);
    vi.stubGlobal('fetch', failingFetch);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(failingFetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual(['network']);
    expect(result.attempts).toHaveLength(2);
    expect(
      result.attempts.every((attempt) => attempt.aborted === false),
    ).toBe(true);
    expect(
      result.attempts.every((attempt) => attempt.status === undefined),
    ).toBe(true);
  });

  it('retries 5xx responses once before succeeding', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'down' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual(['server']);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0]).toMatchObject({
      status: 500,
      retryReason: 'server',
    });
    expect(result.attempts[1].status).toBe(202);
  });

  it('retries 429 responses once before succeeding', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'rate limited' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual(['network']);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0]).toMatchObject({
      status: 429,
      retryReason: 'network',
    });
    expect(result.attempts[1].status).toBe(202);
  });

  it('does not retry on Brevo 400 validation errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'invalid parameters' }),
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.retries).toBe(0);
    expect(result.retryReasons).toEqual([]);
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].status).toBe(400);
    expect(result.attempts[0].retryReason).toBeUndefined();
    expect(result.attempts[0].errorSummary).toContain('invalid');
  });

  it('does not retry on other Brevo 4xx errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'forbidden' }),
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.retries).toBe(0);
    expect(result.retryReasons).toEqual([]);
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].status).toBe(403);
    expect(result.attempts[0].retryReason).toBeUndefined();
    expect(result.attempts[0].errorSummary).toContain('forbidden');
  });

  it('retries 5xx even when error payload is not valid JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('invalid json');
        },
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual(['server']);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0]).toMatchObject({
      status: 500,
      retryReason: 'server',
    });
    expect(result.attempts[0].errorSummary).toBeUndefined();
    expect(result.attempts[1].status).toBe(202);
  });

  it('summarises plain-string error payloads and still retries 5xx', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => 'upstream gateway failed',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
      } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual(['server']);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0].status).toBe(502);
    expect(result.attempts[0].errorSummary).toContain('gateway failed');
    expect(result.attempts[1].status).toBe(202);
  });

  it('retries once and reports timeout failures', async () => {
    const abortingFetch = vi.fn().mockImplementation(
      (_: string, init: RequestInit = {}) =>
        new Promise((_resolve, reject) => {
          const signal = init.signal;
          if (!signal) {
            reject(new Error('Missing abort signal'));
            return;
          }
          if (signal.aborted) {
            reject(createAbortError());
            return;
          }
          signal.addEventListener(
            'abort',
            () => {
              reject(createAbortError());
            },
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', abortingFetch);

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());

    expect(abortingFetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.retries).toBe(1);
    expect(result.retryReasons).toEqual([
      'timeout',
    ]);
    expect(result.attempts).toHaveLength(2);
    expect(
      result.attempts.every((attempt) => attempt.aborted),
    ).toBe(true);
    expect(
      result.attempts.every(
        (attempt) => attempt.status === undefined,
      ),
    ).toBe(true);
  });

  it('returns not configured when Brevo env vars are missing', async () => {
    process.env.BREVO_API_KEY = '';
    delete process.env.MAIL_FROM;
    delete process.env.MAIL_TO;

    const { deliverContactMessage } = await import(
      '@/server/contact/deliverContactMessage'
    );

    const result = await deliverContactMessage(buildDraft());
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toMatch(
      /not configured/i,
    );
    expect(result.attempts).toHaveLength(0);
    expect(result.retries).toBe(0);
  });
});
