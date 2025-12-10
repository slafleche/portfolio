import type { FormStatusKey } from '@/lib/locales/sections/form.locale';

export type FormServerResponseCode =
  | 'success'
  | 'validation_error'
  | 'rate_limited'
  | 'service_unavailable'
  | 'not_configured'
  | 'blocked'
  | 'generic_error';

export type ContactFormPayload = {
  name: string;
  email: string;
  message: string;
  token: string;
  hp: string;
};

export type ContactFormResponse = {
  ok: boolean;
  code: FormServerResponseCode;
  message: string;
  retryAfterSeconds?: number;
};

const DEFAULT_STATUS_MESSAGES: Record<FormStatusKey, string> = {
  sending: 'Sending your message…',
  success: 'Message sent — thank you!',
  generic:
    "We couldn't send your message right now. Please try again.",
  validation_error: 'Please check the fields and try again.',
  rate_limited: 'Too many attempts. Please wait a minute.',
  service_unavailable:
    'Service is unavailable. Please try again shortly.',
  not_configured:
    'Email service not configured yet. Try again later.',
  blocked: "We couldn't send your message right now.",
};

const resolveMessage = (
  key: FormStatusKey,
  overrides?: Partial<Record<FormStatusKey, string>>,
) => overrides?.[key] ?? DEFAULT_STATUS_MESSAGES[key];

type MockSubmitOptions = {
  simulate?:
    | Exclude<FormServerResponseCode, 'generic_error'>
    | 'generic_error';
  messages?: Partial<Record<FormStatusKey, string>>;
};

const parseSimulationHint = (
  message: string,
): MockSubmitOptions['simulate'] | null => {
  const match = message.match(/\b#simulate=([a-z_]+)\b/i);
  if (!match) return null;
  const [
    ,
    raw,
  ] = match;
  const value = raw.toLowerCase();
  switch (value) {
    case 'success':
    case 'validation_error':
    case 'rate_limited':
    case 'service_unavailable':
    case 'not_configured':
    case 'blocked':
    case 'generic_error':
      return value;
    default:
      return null;
  }
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function mockSubmit(
  payload: ContactFormPayload,
  options?: MockSubmitOptions,
): Promise<ContactFormResponse> {
  const delay = 800 + Math.random() * 400;
  await wait(delay);

  if (payload.hp && payload.hp.trim().length > 0) {
    const message = resolveMessage('success', options?.messages);
    return {
      ok: true,
      code: 'success',
      message,
    };
  }

  const hinted = parseSimulationHint(payload.message);
  const code =
    options?.simulate ??
    hinted ??
    ('success' satisfies FormServerResponseCode);

  if (code === 'success') {
    return {
      ok: true,
      code: 'success',
      message: resolveMessage('success', options?.messages),
    };
  }

  const lookupKey: FormStatusKey =
    code === 'generic_error' ? 'generic' : code;

  return {
    ok: false,
    code,
    message: resolveMessage(lookupKey, options?.messages),
    ...(code === 'rate_limited' ? { retryAfterSeconds: 60 } : {}),
  };
}
