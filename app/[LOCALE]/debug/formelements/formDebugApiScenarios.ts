import type { ContactFormPayload } from '@/modules/contactForm/mockSubmit';

type BannerTone =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

type FieldMode = 'editable' | 'readonly' | 'disabled';

export type ApiScenarioId =
  | 'sending'
  | 'success'
  | 'validation_error'
  | 'rate_limited'
  | 'service_unavailable'
  | 'blocked'
  | 'generic_error'
  | 'not_configured';

export type ApiScenarioStatus =
  | 'sending'
  | 'success'
  | 'validation_error'
  | 'rate_limited'
  | 'service_unavailable'
  | 'blocked'
  | 'generic'
  | 'not_configured';

export type DebugPayload = ContactFormPayload & {
  locale: string;
  metadata: {
    hpFilled: boolean;
    tokenPresent: boolean;
    timestamp: string;
  };
};

export type ApiScenario = {
  id: ApiScenarioId;
  label: string;
  description: string;
  status: ApiScenarioStatus;
  timelineStage: 'build' | 'guards' | 'post' | 'response';
  banner: {
    tone: BannerTone;
    title: string;
    body: string;
  };
  cta: {
    label: string;
    disabled: boolean;
    loading?: boolean;
  };
  fieldMode: FieldMode;
  payload: DebugPayload;
  accessibilityNotes: readonly string[];
  focusManagement: string;
  telemetry: readonly string[];
};

const baseTimestamp = () => new Date().toISOString();

const buildPayload = (
  payload: ContactFormPayload & { locale?: string },
  options?: { hpFilled?: boolean },
): DebugPayload => ({
  name: payload.name,
  email: payload.email,
  message: payload.message,
  token: payload.token,
  hp: payload.hp,
  locale: payload.locale ?? 'en',
  metadata: {
    hpFilled: Boolean(options?.hpFilled),
    tokenPresent: Boolean(payload.token),
    timestamp: baseTimestamp(),
  },
});

export const apiScenarios: readonly ApiScenario[] = [
  {
    id: 'sending',
    label: 'Sending (pending)',
    description:
      'Form locked while POST /api/contact is in flight.',
    status: 'sending',
    timelineStage: 'post',
    banner: {
      tone: 'info',
      title: 'Sending message…',
      body: 'Please wait a moment while we contact Brevo.',
    },
    cta: {
      label: 'Sending…',
      disabled: true,
      loading: true,
    },
    fieldMode: 'readonly',
    payload: buildPayload({
      name: 'Pending Sender',
      email: 'pending@example.com',
      message:
        'This payload is locked until we hear back from the API.',
      token: 'turnstile-token',
      hp: '',
    }),
    accessibilityNotes: [
      'aria-live region announces “Sending message…” once.',
      'CTA has `aria-disabled="true"` plus spinner label.',
    ],
    focusManagement: 'Keep focus on CTA so assistive tech hears progress.',
    telemetry: [
      'log event: contact.submit.start',
      'metric: contact.submit.duration (timer start)',
    ],
  },
  {
    id: 'success',
    label: 'Success (2xx)',
    description: 'Brevo accepted the payload and queued the email.',
    status: 'success',
    timelineStage: 'response',
    banner: {
      tone: 'success',
      title: 'Message sent — thank you!',
      body: 'We will reply as soon as possible.',
    },
    cta: {
      label: 'Message sent',
      disabled: true,
    },
    fieldMode: 'editable',
    payload: buildPayload({
      name: 'Contact Success',
      email: 'success@example.com',
      message:
        'Thanks for reviewing the successful submission scenario.',
      token: 'turnstile-token',
      hp: '',
    }),
    accessibilityNotes: [
      'Success banner uses `role="status"` with polite live region.',
      'Focus shifts to the banner so screen readers hear the confirmation.',
    ],
    focusManagement: 'Move focus to the banner, then back to heading on dismiss.',
    telemetry: [
      'log event: contact.submit.success',
      'metric: contact.submit.duration (timer stop)',
    ],
  },
  {
    id: 'validation_error',
    label: 'Validation error',
    description:
      'Server-side validation failed; user must correct inputs.',
    status: 'validation_error',
    timelineStage: 'response',
    banner: {
      tone: 'error',
      title: 'Fix highlighted fields',
      body: 'Double-check the inputs below and try again.',
    },
    cta: {
      label: 'Try again',
      disabled: false,
    },
    fieldMode: 'editable',
    payload: buildPayload({
      name: 'S',
      email: 'invalid-email',
      message: 'Short',
      token: '',
      hp: '',
    }),
    accessibilityNotes: [
      'Focus returns to first invalid field (name).',
      'Each error id is referenced via aria-describedby.',
    ],
    focusManagement: 'Send focus to the first invalid control.',
    telemetry: [
      'log event: contact.submit.validation_error',
      'metric: contact.submit.failure.count (reason=validation)',
    ],
  },
  {
    id: 'rate_limited',
    label: 'Rate limited',
    description: 'Too many submissions in a short window.',
    status: 'rate_limited',
    timelineStage: 'response',
    banner: {
      tone: 'warning',
      title: 'Too many attempts',
      body: 'Please wait before trying again.',
    },
    cta: {
      label: 'Retry in 60s',
      disabled: true,
    },
    fieldMode: 'readonly',
    payload: buildPayload({
      name: 'Cooldown Sample',
      email: 'cooldown@example.com',
      message: 'We pause submissions for a minute when rate limits trip.',
      token: 'turnstile-token',
      hp: '',
    }),
    accessibilityNotes: [
      'Banner explains rate limit and next retry window.',
      'CTA exposes `aria-disabled` plus countdown in the label.',
    ],
    focusManagement: 'Keep focus on CTA so countdown announcements are heard.',
    telemetry: [
      'log event: contact.submit.rate_limited',
      'metric: contact.submit.cooldown.active = 1',
    ],
  },
  {
    id: 'service_unavailable',
    label: 'Service unavailable',
    description: 'Brevo outage or network failure.',
    status: 'service_unavailable',
    timelineStage: 'response',
    banner: {
      tone: 'warning',
      title: 'Service is unavailable',
      body: 'Please try again shortly.',
    },
    cta: {
      label: 'Retry send',
      disabled: false,
    },
    fieldMode: 'readonly',
    payload: buildPayload({
      name: 'Outage Tester',
      email: 'outage@example.com',
      message:
        'Keep the payload around so the user can hit retry when Brevo recovers.',
      token: 'turnstile-token',
      hp: '',
    }),
    accessibilityNotes: [
      'Banner tone is warning but not an ARIA alert to avoid repeated interruptions.',
      'CTA regains focus so user can retry quickly.',
    ],
    focusManagement: 'Return focus to CTA after banner announcement.',
    telemetry: [
      'log event: contact.submit.service_unavailable',
      'metric: brevo.errors.service_unavailable++',
    ],
  },
  {
    id: 'blocked',
    label: 'Blocked (honeypot)',
    description:
      'Honeypot or Turnstile guard tripped; treat as silent success.',
    status: 'blocked',
    timelineStage: 'guards',
    banner: {
      tone: 'muted',
      title: 'Looks good',
      body:
        'We accepted the message, but the send was skipped due to automated entry.',
    },
    cta: {
      label: 'Message sent',
      disabled: true,
    },
    fieldMode: 'disabled',
    payload: buildPayload(
      {
        name: 'Automation Bot',
        email: 'bot@example.com',
        message: 'Filled automatically',
        token: 'turnstile-token',
        hp: 'Bad Actor LLC',
      },
      { hpFilled: true },
    ),
    accessibilityNotes: [
      'UI mirrors success to avoid tipping off bots.',
      'No focus shift—keep the form disabled.',
    ],
    focusManagement: 'Leave focus where it was; no announcement besides polite banner.',
    telemetry: [
      'log event: contact.submit.blocked',
      'metric: contact.submit.honeypot_tripped++',
    ],
  },
  {
    id: 'generic_error',
    label: 'Generic error',
    description: 'Unexpected exception while calling Brevo.',
    status: 'generic',
    timelineStage: 'response',
    banner: {
      tone: 'error',
      title: "We couldn't send your message",
      body: 'Please try again or email us directly.',
    },
    cta: {
      label: 'Retry send',
      disabled: false,
    },
    fieldMode: 'editable',
    payload: buildPayload({
      name: 'Retry Candidate',
      email: 'retry@example.com',
      message:
        'Keep the payload around so it can be retried immediately.',
      token: 'turnstile-token',
      hp: '',
    }),
    accessibilityNotes: [
      'Banner uses `role="alert"` so the failure is read immediately.',
      'Focus shifts to banner, then back to first field when user dismisses.',
    ],
    focusManagement: 'Move focus to banner, then to first field when user presses retry.',
    telemetry: [
      'log event: contact.submit.generic_error',
      'metric: brevo.errors.generic++',
    ],
  },
  {
    id: 'not_configured',
    label: 'Not configured',
    description:
      'Environment variables missing; block submit client-side.',
    status: 'not_configured',
    timelineStage: 'guards',
    banner: {
      tone: 'warning',
      title: 'Email service unavailable',
      body: 'This environment is not wired to Brevo yet.',
    },
    cta: {
      label: 'Unavailable',
      disabled: true,
    },
    fieldMode: 'disabled',
    payload: buildPayload({
      name: '',
      email: '',
      message: '',
      token: '',
      hp: '',
    }),
    accessibilityNotes: [
      'Explain configuration issue in the banner, not inline errors.',
      'Form controls expose `aria-disabled="true"` so screen readers know it is locked.',
    ],
    focusManagement: 'Send focus to the banner so the warning is announced.',
    telemetry: [
      'log event: contact.submit.not_configured',
      'metric: contact.submit.blocked_env++',
    ],
  },
] as const;
