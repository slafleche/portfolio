import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { verifyTurnstileToken } from '@/server/turnstile/verifyTurnstileToken';
import { withEnvOverrides } from '../helpers/runtimeEnvHarness';

const ORIGINAL_ENV = { ...process.env } as NodeJS.ProcessEnv;

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns missing-secret without calling fetch when secret is absent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await withEnvOverrides(
      {
        TURNSTILE_SECRET: '',
      },
      () => verifyTurnstileToken('token-123'),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([
      'missing-secret',
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns missing-secret without calling fetch when secret is empty string', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: '',
      },
      () => verifyTurnstileToken('token-123'),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([
      'missing-secret',
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns missing-token without calling fetch when token is null or undefined', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const nullResult = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: 'test-secret',
      },
      () => verifyTurnstileToken(null),
    );
    expect(nullResult.ok).toBe(false);
    expect(nullResult.errorCodes).toEqual([
      'missing-token',
    ]);

    const undefinedResult = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: 'test-secret',
      },
      () => verifyTurnstileToken(undefined),
    );
    expect(undefinedResult.ok).toBe(false);
    expect(undefinedResult.errorCodes).toEqual([
      'missing-token',
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends correct POST request and returns ok on successful verification', async () => {
    const secret = '1x0000000000000000000000000000000AA';
    const token = 'XXXX.DUMMY.TOKEN.XXXX';
    const remoteIp = '203.0.113.10';

    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: secret,
      },
      () => verifyTurnstileToken(token, remoteIp),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [
      url,
      init,
    ] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toContain(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    );
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'content-type': 'application/x-www-form-urlencoded',
    });

    const body = init.body as URLSearchParams;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect(body.get('secret')).toBe(secret);
    expect(body.get('response')).toBe(token);
    expect(body.get('remoteip')).toBe(remoteIp);

    expect(result).toEqual({ ok: true });
  });

  it('omits remoteip from request when remoteIp argument is null', async () => {
    const secret = '1x0000000000000000000000000000000AA';
    const token = 'XXXX.DUMMY.TOKEN.XXXX';

    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: secret,
      },
      () => verifyTurnstileToken(token, null),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [
      ,
      init,
    ] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = init.body as URLSearchParams;
    expect(body.get('remoteip')).toBeNull();
  });

  it('forwards error-codes array on failed verification', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        success: false,
        'error-codes': [
          'invalid-input-response',
        ],
      }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET:
          '2x0000000000000000000000000000000AA',
      },
      () => verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX'),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([
      'invalid-input-response',
    ]);
  });

  it('returns empty errorCodes array when verification fails without error-codes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: false }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: 'no-error-codes-secret',
      },
      () => verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX'),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([]);
  });

  it('forwards timeout-or-duplicate error code for the dummy timeout secret', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        success: false,
        'error-codes': [
          'timeout-or-duplicate',
        ],
      }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET:
          '3x0000000000000000000000000000000AA',
      },
      () => verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX'),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([
      'timeout-or-duplicate',
    ]);
  });

  it('maps network / unexpected errors to network-error and logs without leaking secrets or tokens', async () => {
    const secret = '1x0000000000000000000000000000000AA';
    const token = 'XXXX.DUMMY.TOKEN.XXXX';

    const fetchError = new Error('network down');
    const fetchMock = vi.fn().mockRejectedValue(fetchError);
    vi.stubGlobal('fetch', fetchMock);

    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await withEnvOverrides(
      {
        TURNSTILE_BYPASS: '',
        TURNSTILE_SECRET: secret,
      },
      () => verifyTurnstileToken(token),
    );

    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual([
      'network-error',
    ]);
    expect(
      Object.prototype.hasOwnProperty.call(result, 'secret'),
    ).toBe(false);
    expect(
      Object.prototype.hasOwnProperty.call(result, 'token'),
    ).toBe(false);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const [
      message,
      error,
    ] = consoleSpy.mock.calls[0] ?? [];
    expect(String(message)).toContain(
      '[contact][turnstile] verification failed',
    );
    expect(error).toBe(fetchError);

    const logged = `${String(message)} ${String(error)}`;
    expect(logged).not.toContain(secret);
    expect(logged).not.toContain(token);
  });
});
