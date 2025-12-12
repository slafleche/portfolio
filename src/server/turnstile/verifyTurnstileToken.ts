type VerificationResponse = {
  success: boolean;
  ['error-codes']?: string[];
};

export type TurnstileVerificationResult = {
  ok: boolean;
  errorCodes?: string[];
  reason?: string;
};

const TURNSTILE_ENDPOINT =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    return {
      ok: false,
      errorCodes: [
        'missing-secret',
      ],
    };
  }

  if (!token) {
    return {
      ok: false,
      errorCodes: [
        'missing-token',
      ],
    };
  }

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);
  if (remoteIp) {
    params.set('remoteip', remoteIp);
  }

  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  };

  try {
    const response = await fetch(TURNSTILE_ENDPOINT, requestInit);
    const data = (await response.json()) as VerificationResponse;
    if (data.success) {
      return { ok: true };
    }
    return {
      ok: false,
      errorCodes: data['error-codes'] ?? [],
    };
  } catch (error) {
    console.error('[contact][turnstile] verification failed', error);
    return {
      ok: false,
      errorCodes: [
        'network-error',
      ],
    };
  }
}
