import type { CSSProperties } from 'react';
import { formTokens } from '@/tokens/forms.tokens';
import * as debugFormStyles from '@/styles/components/debugForm.css';

type DebugParams = Promise<{ LOCALE: string }>;

type Tone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'muted';

const tonePalette: Record<
  Tone,
  { border: string; bg: string; accent: string; text: string }
> = {
  default: {
    border: 'rgba(245,240,255,0.18)',
    bg: 'rgba(255,255,255,0.04)',
    accent: '#f5f0ff',
    text: 'rgba(245,240,255,0.85)',
  },
  info: {
    border: 'rgba(113,179,255,0.45)',
    bg: 'rgba(35,61,96,0.45)',
    accent: '#71b3ff',
    text: '#b7d8ff',
  },
  success: {
    border: 'rgba(77,201,173,0.6)',
    bg: 'rgba(22,54,46,0.45)',
    accent: '#4dc9ad',
    text: '#9de5d2',
  },
  warning: {
    border: 'rgba(255,191,71,0.5)',
    bg: 'rgba(73,56,17,0.5)',
    accent: '#ffbf47',
    text: '#ffdca2',
  },
  error: {
    border: 'rgba(255,125,125,0.5)',
    bg: 'rgba(73,22,29,0.6)',
    accent: '#ff7d7d',
    text: '#ffc0c0',
  },
  muted: {
    border: 'rgba(245,240,255,0.08)',
    bg: 'rgba(8,6,16,0.6)',
    accent: 'rgba(245,240,255,0.5)',
    text: 'rgba(245,240,255,0.6)',
  },
};

type InputPreviewState = {
  id: string;
  stateLabel: string;
  placeholder?: string;
  value?: string;
  helper?: string;
  note?: string;
  error?: string;
  success?: string;
  badge?: string;
  tone?: Tone;
  disabled?: boolean;
  readOnly?: boolean;
  simulatedState?: string;
  debugState?: string;
};

type InputPreviewGroup = {
  id: string;
  title: string;
  owner: string;
  description: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  states: readonly InputPreviewState[];
};

const inputGroups: readonly InputPreviewGroup[] = [
  {
    id: 'name-field',
    title: 'Name field (text)',
    owner: 'ContactForm',
    description:
      '2-80 characters, trimmed on submit, localized copy pulled from `form.locale`.',
    label: 'Name',
    type: 'text',
    states: [
      {
        id: 'name-idle',
        stateLabel: 'Placeholder idle',
        placeholder: 'Your name',
        helper: 'Minimum 2 characters',
      },
      {
        id: 'name-focus',
        stateLabel: 'Focus (floating label)',
        placeholder: 'Your name',
        simulatedState: 'focus',
        helper: 'Simulated focus ring + keyboard navigation highlight.',
        tone: 'info',
        debugState: 'focus',
      },
      {
        id: 'name-focus-visible',
        stateLabel: 'Focus-visible (keyboard)',
        placeholder: 'Your name',
        helper: 'Use to style strong outlines for keyboard users.',
        tone: 'info',
        debugState: 'focus-visible',
      },
      {
        id: 'name-hover',
        stateLabel: 'Hover accent',
        placeholder: 'Your name',
        helper: 'Hover-only effect preview.',
        tone: 'info',
        debugState: 'hover',
      },
      {
        id: 'name-autofill',
        stateLabel: 'Autofill highlight',
        value: 'Autofilled Sample',
        helper: 'Browser supplied value - show accent background.',
        badge: 'Autofill',
        tone: 'info',
      },
      {
        id: 'name-min-length',
        stateLabel: 'Min length error',
        value: 'S',
        error: 'Please enter at least 2 characters.',
        tone: 'error',
      },
      {
        id: 'name-max-length',
        stateLabel: 'Max length error',
        value:
          'This name is definitely exceeding the allowed length limit just to test overflow behavior in the form field',
        error: 'Names must be under 80 characters.',
        tone: 'error',
      },
      {
        id: 'name-success',
        stateLabel: 'Valid entry',
        value: 'Stephane Lavoie',
        success: 'Looks good.',
        tone: 'success',
      },
      {
        id: 'name-readonly',
        stateLabel: 'Read-only (review)',
        value: 'Readonly preview',
        helper: 'Used during pending submit to lock the field.',
        tone: 'muted',
        readOnly: true,
        debugState: 'readonly',
      },
      {
        id: 'name-disabled',
        stateLabel: 'Disabled while submitting',
        value: 'Pending Name',
        helper: 'Field locks while Brevo request is in flight.',
        badge: 'Submitting',
        disabled: true,
        tone: 'muted',
        debugState: 'disabled',
      },
    ],
  },
  {
    id: 'email-field',
    title: 'Email field',
    owner: 'ContactForm',
    description:
      'Lowercased, RFC-style validation, surface Brevo bounce details in errors.',
    label: 'Email',
    type: 'email',
    states: [
      {
        id: 'email-idle',
        stateLabel: 'Placeholder idle',
        placeholder: 'you@example.com',
        helper: 'We only use this to reply.',
      },
      {
        id: 'email-focus',
        stateLabel: 'Focus',
        placeholder: 'you@example.com',
        simulatedState: 'focus',
        helper: 'Show keyboard focus ring and hint text.',
        tone: 'info',
        debugState: 'focus',
      },
      {
        id: 'email-focus-visible',
        stateLabel: 'Focus-visible (keyboard)',
        placeholder: 'you@example.com',
        helper: 'Keyboard outline preview.',
        tone: 'info',
        debugState: 'focus-visible',
      },
      {
        id: 'email-hover',
        stateLabel: 'Hover accent',
        placeholder: 'you@example.com',
        helper: 'Used to tweak hover border color.',
        tone: 'info',
        debugState: 'hover',
      },
      {
        id: 'email-invalid',
        stateLabel: 'Invalid format',
        value: 'not-an-email',
        error: 'Enter a valid email address.',
        tone: 'error',
      },
      {
        id: 'email-domain',
        stateLabel: 'Domain rejected by Brevo',
        value: 'user@blocked-domain.dev',
        error: 'Brevo rejected this domain. Try a different address.',
        tone: 'warning',
        badge: 'Brevo response',
      },
      {
        id: 'email-success',
        stateLabel: 'Valid entry',
        value: 'hello@studio-tier.one',
        success: 'Great - we will reply here.',
        tone: 'success',
      },
      {
        id: 'email-readonly',
        stateLabel: 'Read-only (pending)',
        value: 'readonly@example.com',
        helper: 'Used when form is locking input.',
        tone: 'muted',
        readOnly: true,
        debugState: 'readonly',
      },
      {
        id: 'email-disabled',
        stateLabel: 'Disabled while sending',
        value: 'locking@state.test',
        helper: 'Frozen until submit resolves.',
        disabled: true,
        tone: 'muted',
        debugState: 'disabled',
      },
    ],
  },
  {
    id: 'message-field',
    title: 'Message textarea',
    owner: 'ContactForm',
    description:
      'Auto-grows, enforces min/max characters, and counts URLs for spam prevention.',
    label: 'Message',
    type: 'textarea',
    states: [
      {
        id: 'message-idle',
        stateLabel: 'Placeholder idle',
        placeholder: 'Tell me about your project...',
        helper: 'Min 40 characters / Max 1200 characters',
      },
      {
        id: 'message-focus',
        stateLabel: 'Focus (floating)',
        placeholder: 'Tell me about your project...',
        helper: 'Focus ring + caret color preview.',
        tone: 'info',
        debugState: 'focus',
      },
      {
        id: 'message-focus-visible',
        stateLabel: 'Focus-visible (keyboard)',
        placeholder: 'Tell me about your project...',
        helper: 'Keyboard focus outline preview.',
        tone: 'info',
        debugState: 'focus-visible',
      },
      {
        id: 'message-hover',
        stateLabel: 'Hover accent',
        placeholder: 'Tell me about your project...',
        helper: 'Hover border preview.',
        tone: 'info',
        debugState: 'hover',
      },
      {
        id: 'message-near-limit',
        stateLabel: 'Near character limit',
        value:
          'Following up on the system audit we discussed last week. Attaching the scope shortly.',
        helper: '24 characters remaining',
        tone: 'warning',
      },
      {
        id: 'message-too-long',
        stateLabel: 'Max length error',
        value:
          'This paragraph intentionally exceeds the maximum message length so that we can prove the counter and validation copy show up correctly inside the debug playground. '.repeat(
            4,
          ),
        error: 'Messages must be under 1200 characters.',
        tone: 'error',
      },
      {
        id: 'message-too-many-links',
        stateLabel: 'Too many links',
        value:
          'Check these out: https://spam-a.example, https://spam-b.example, https://spam-c.example',
        error: 'Limit messages to two links.',
        tone: 'warning',
        badge: 'URL limit',
      },
      {
        id: 'message-restored',
        stateLabel: 'Restored draft',
        value:
          'Draft pulled from session storage so the user can keep typing where they left off.',
        helper: 'Restored automatically for locale = EN.',
        badge: 'Restored',
        tone: 'info',
      },
      {
        id: 'message-readonly',
        stateLabel: 'Read-only during submit',
        value: 'Message is locked until Brevo responds...',
        readOnly: true,
        helper: 'textarea uses `readOnly` while pending.',
        tone: 'muted',
        debugState: 'readonly',
      },
      {
        id: 'message-disabled',
        stateLabel: 'Disabled field',
        value: 'Message control disabled for maintenance',
        helper: 'Use with `disabled` attribute in rare cases.',
        tone: 'muted',
        disabled: true,
        debugState: 'disabled',
      },
    ],
  },
];

type DefensePreview = {
  id: string;
  label: string;
  description: string;
  tone?: Tone;
  badge?: string;
  fieldLabel: string;
  value: string;
  placeholder?: string;
  helper?: string;
  hiddenInProd?: boolean;
};

const defensePreviews: readonly DefensePreview[] = [
  {
    id: 'hp-empty',
    label: 'Honeypot empty (human path)',
    description:
      'Hidden `company` input stays blank, so submit continues normally.',
    tone: 'success',
    badge: 'Hidden in prod',
    fieldLabel: 'Company (leave blank)',
    value: '',
    placeholder: '(this must stay empty)',
    helper: 'Debug view exposes it so we can style focus rings.',
    hiddenInProd: true,
  },
  {
    id: 'hp-filled',
    label: 'Honeypot filled (bot path)',
    description:
      'Server returns `success` but silently skips Brevo to avoid validating spam.',
    tone: 'warning',
    fieldLabel: 'Company (leave blank)',
    value: 'Bad Actor LLC',
    helper: 'Use DevTools to set any non-empty value to reproduce.',
    hiddenInProd: true,
  },
  {
    id: 'token-present',
    label: 'Turnstile token present',
    description:
      'Default mock token injected client-side until we wire the real widget.',
    tone: 'info',
    badge: 'Mock',
    fieldLabel: 'turnstile-token',
    value: 'mock-turnstile-token',
    helper: 'Posted alongside form payload.',
  },
  {
    id: 'token-missing',
    label: 'Turnstile token missing',
    description:
      'Client validation blocks submit and surfaces `form-error-token-missing` copy.',
    tone: 'error',
    fieldLabel: 'turnstile-token',
    value: '',
    placeholder: '(missing)',
    helper: 'Replicate by clearing the hidden input via DevTools.',
  },
  {
    id: 'token-expired',
    label: 'Turnstile token expired server-side',
    description:
      'API responds with `generic_error`; UI prompts user to refresh.',
    tone: 'warning',
    fieldLabel: 'turnstile-token',
    value: 'expired-turnstile-token',
    helper: 'Server should request a new token and retry.',
  },
  {
    id: 'token-refresh',
    label: 'Token refresh failure',
    description:
      'Widget failed to re-issue a token; show inline warning plus retry button.',
    tone: 'error',
    fieldLabel: 'turnstile-token',
    value: '',
    placeholder: '(refresh failed)',
    helper: 'Expose fallback CTA for manual retry.',
  },
];

type StatusCard = {
  id: string;
  label: string;
  description: string;
  tone?: Tone;
  badge?: string;
};

const statusCards: readonly StatusCard[] = [
  {
    id: 'status-idle',
    label: 'Idle (pristine)',
    description: 'No interaction yet; CTA stays disabled.',
    tone: 'muted',
  },
  {
    id: 'status-dirty',
    label: 'Dirty state',
    description: 'User started typing; validation kicks in on blur.',
    tone: 'info',
  },
  {
    id: 'status-validation',
    label: 'Validation error',
    description:
      'Inline errors shown and focus loops back to the first invalid field.',
    tone: 'error',
  },
  {
    id: 'status-sending',
    label: 'Sending',
    description:
      'CTA shows spinner, inputs lock, aria-live announces "Sending your message...".',
    tone: 'info',
    badge: 'aria-live=polite',
  },
  {
    id: 'status-success',
    label: 'Success',
    description:
      'Brevo returned 2xx - show success banner, clear draft + inputs.',
    tone: 'success',
  },
  {
    id: 'status-generic',
    label: 'Generic error',
    description:
      'Unexpected failure; show fallback copy and keep draft so user can retry.',
    tone: 'warning',
  },
];

const draftCards: readonly StatusCard[] = [
  {
    id: 'draft-empty',
    label: 'No draft stored',
    description: 'Session storage key absent before first keystroke.',
    tone: 'muted',
  },
  {
    id: 'draft-partial',
    label: 'Partial draft saved per locale',
    description: 'Name/email/message persisted under `contact-form-draft:{locale}`.',
    tone: 'info',
  },
  {
    id: 'draft-cleared',
    label: 'Cleared after success',
    description: 'Once Brevo responds OK, remove the draft entry.',
    tone: 'success',
  },
  {
    id: 'draft-denied',
    label: 'Storage unavailable',
    description:
      'Private mode or quota errors fall back to volatile React state; surface toast.',
    tone: 'warning',
  },
];

const requestCards: readonly StatusCard[] = [
  {
    id: 'req-build',
    label: 'Build payload',
    description:
      'Trim strings, lowercase email, attach locale + pathname so Brevo template can mention context.',
  },
  {
    id: 'req-env',
    label: 'Environment guard',
    description:
      'If `BREVO_API_KEY` or template IDs are missing, short-circuit with `not_configured`.',
    tone: 'warning',
  },
  {
    id: 'req-honeypot',
    label: 'Honeypot short-circuit',
    description:
      'If hp value present, skip Brevo, pretend success, and increment honeypot metric.',
    tone: 'info',
  },
  {
    id: 'req-timeout',
    label: 'Timeout + retries',
    description:
      'Abort fetch after 8s and surface `service_unavailable`; optionally queue retry on the server.',
    tone: 'error',
  },
];

const responseCards: readonly StatusCard[] = [
  {
    id: 'resp-success',
    label: 'success',
    description: 'Brevo responded 2xx; show success banner.',
    tone: 'success',
  },
  {
    id: 'resp-validation',
    label: 'validation_error',
    description: '400 from Brevo (bad email) -> inline error callouts.',
    tone: 'error',
  },
  {
    id: 'resp-rate',
    label: 'rate_limited',
    description: '429 from Brevo; disable CTA and show retry-after hint.',
    tone: 'warning',
  },
  {
    id: 'resp-service',
    label: 'service_unavailable',
    description: '5xx/timeout; show outage banner.',
    tone: 'warning',
  },
  {
    id: 'resp-blocked',
    label: 'blocked',
    description: 'Brevo flagged message as spam - display neutral error.',
    tone: 'warning',
  },
  {
    id: 'resp-generic',
    label: 'generic_error',
    description:
      'Network or unexpected JSON parse failure; show fallback text.',
    tone: 'muted',
  },
  {
    id: 'resp-not-configured',
    label: 'not_configured',
    description:
      'Only happens on preview env when secrets missing; show configuration banner.',
    tone: 'info',
  },
];

type CTAState = {
  id: string;
  label: string;
  buttonLabel: string;
  helper: string;
  tone?: Tone;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  debugState?: string;
};

const ctaStates: readonly CTAState[] = [
  {
    id: 'cta-disabled',
    label: 'CTA disabled (invalid)',
    buttonLabel: 'Send message',
    helper: 'Default state until fields pass validation.',
    disabled: true,
    tone: 'muted',
    debugState: 'disabled',
  },
  {
    id: 'cta-enabled',
    label: 'CTA enabled (valid form)',
    buttonLabel: 'Send message',
    helper: 'Primary style, ready to submit.',
    tone: 'success',
    debugState: 'ready',
  },
  {
    id: 'cta-focus-visible',
    label: 'CTA focus-visible',
    buttonLabel: 'Send message',
    helper: 'Keyboard focus outline preview.',
    tone: 'info',
    debugState: 'focus-visible',
  },
  {
    id: 'cta-loading',
    label: 'CTA sending',
    buttonLabel: 'Sending...',
    helper: 'Spinner lives inside button; prevents double submits.',
    disabled: true,
    loading: true,
    tone: 'info',
    debugState: 'focus',
  },
  {
    id: 'cta-retry',
    label: 'CTA retry after error',
    buttonLabel: 'Try again',
    helper: 'Secondary style when previous attempt failed.',
    tone: 'warning',
    variant: 'secondary',
    debugState: 'hover',
  },
  {
    id: 'cta-active',
    label: 'CTA active press',
    buttonLabel: 'Send message',
    helper: 'Shows pressed state for pointer users.',
    tone: 'info',
    debugState: 'active',
  },
];

type BannerPreview = {
  id: string;
  title: string;
  body: string;
  tone: Tone;
  badge?: string;
};

const bannerPreviews: readonly BannerPreview[] = [
  {
    id: 'banner-success',
    title: 'Success banner',
    body: 'Message sent - thank you! I will reply within two business days.',
    tone: 'success',
  },
  {
    id: 'banner-validation',
    title: 'Validation summary',
    body: 'Please review the highlighted fields before sending your message.',
    tone: 'error',
  },
  {
    id: 'banner-generic',
    title: 'Generic error',
    body: "We couldn't send your message. Please try again in a moment.",
    tone: 'warning',
  },
  {
    id: 'banner-rate-limit',
    title: 'Rate limited',
    body: 'Too many attempts. Wait 60 seconds before trying again.',
    tone: 'warning',
    badge: 'Retry-After header',
  },
  {
    id: 'banner-service',
    title: 'Service unavailable',
    body: 'Brevo is temporarily unavailable. Your draft is still safe.',
    tone: 'info',
  },
];

const privacyMarkdown = `When you use this contact form, I collect:

- Your name
- Your email address
- Your message

I only use this information to reply. It's never added to marketing lists or shared with anyone else.`;

const accessibilityChecklist: readonly {
  id: string;
  label: string;
  description: string;
}[] = [
  {
    id: 'a11y-focus',
    label: 'Visible focus',
    description: 'Ensure high-contrast focus outlines for every interactive element.',
  },
  {
    id: 'a11y-live',
    label: 'Aria live regions',
    description:
      'Status banner + CTA use `aria-live` to announce sending/success/error copy.',
  },
  {
    id: 'a11y-esc',
    label: 'Dialog escape hatch',
    description:
      'Contact dialog closes via Escape and returns focus to trigger button.',
  },
  {
    id: 'a11y-motion',
    label: 'Reduced motion',
    description: 'Respect `prefers-reduced-motion` for spinners and transitions.',
  },
];

const logPreviews: readonly {
  id: string;
  label: string;
  tone?: Tone;
  lines: readonly string[];
}[] = [
  {
    id: 'log-success',
    label: 'Structured log (success)',
    tone: 'success',
    lines: [
      '{',
      '  "level": "info",',
      '  "event": "contact.submit.success",',
      '  "locale": "en",',
      '  "brevoMessageId": "abc123",',
      '  "durationMs": 842',
      '}',
    ],
  },
  {
    id: 'log-failure',
    label: 'Structured log (failure)',
    tone: 'warning',
    lines: [
      '{',
      '  "level": "error",',
      '  "event": "contact.submit.failure",',
      '  "code": "rate_limited",',
      '  "retryAfter": 60,',
      '  "ipHash": "1a2b3c",',
      '  "brevoRequestId": "req_789"',
      '}',
    ],
  },
];

const telemetryPreviews: readonly StatusCard[] = [
  {
    id: 'metric-success',
    label: 'Metric: contact.submit.success',
    description:
      'Increment on every Brevo 2xx; dimensions = locale, path, clientHint.',
    tone: 'success',
  },
  {
    id: 'metric-failure',
    label: 'Metric: contact.submit.failure',
    description:
      'Logs failure code so alerts can fire if error or rate limits spike.',
    tone: 'warning',
  },
  {
    id: 'metric-honeypot',
    label: 'Metric: contact.honeypot.triggered',
    description: 'Silent success counter to monitor bot traffic volume.',
    tone: 'info',
  },
];

const sectionTitleStyle = {
  fontSize: 26,
  margin: '0 0 8px',
};

const sectionIntroStyle = {
  margin: '0 0 20px',
  color: formTokens.counter.text.color.css(),
  lineHeight: 1.5,
};

const badgeStyle = {
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 12,
  letterSpacing: 0.6,
  textTransform: 'uppercase' as const,
};

const helperTextStyle = {
  margin: '8px 0 0',
  fontSize: 14,
  color: formTokens.counter.text.color.css(),
  lineHeight: 1.5,
};

export default async function FormElementsDebugPage({
  params,
}: {
  params: DebugParams;
}) {
  const { LOCALE } = await params;

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '64px 24px 96px',
        color: '#f5f0ff',
        background:
          'radial-gradient(circle at top, rgba(113,73,255,0.22), rgba(15,10,30,0.95))',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        <header>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: 4,
              fontSize: 12,
              color: 'rgba(245,240,255,0.6)',
              marginBottom: 12,
            }}
          >
            /{LOCALE}/debug/formelements
          </p>
          <h1
            style={{
              fontSize: 48,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Form Elements Playground
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              lineHeight: 1.6,
              color: 'rgba(245,240,255,0.8)',
            }}
          >
            Every contact-form state lives here so we can iterate on tokens,
            helpers, and Brevo-specific flows in isolation. Copy/paste these
            previews into Storybook stories as we wire real styles.
          </p>
        </header>

        <section>
          <h2 style={sectionTitleStyle}>Input field gallery</h2>
          <p style={sectionIntroStyle}>
            Core inputs rendered in every UX/validation state. Tweak measurements
            and colors in one place, verify against this matrix, then port to the
            production dialog. Each card sets <code>data-debug="state"</code> on
            the control so you can copy/paste the attribute into Storybook or even
            real pages when you need to inspect a state.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {inputGroups.map((group) => (
              <article
                key={group.id}
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(245,240,255,0.18)',
                  padding: 28,
                  backgroundColor: 'rgba(6,4,18,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 22,
                      }}
                    >
                      {group.title}
                    </h3>
                    <span
                      style={{
                        ...badgeStyle,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {group.owner}
                    </span>
                  </div>
                  <p style={helperTextStyle}>{group.description}</p>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                  }}
                >
                  {group.states.map((state) => {
                    const tone = tonePalette[state.tone ?? 'default'];
                    const inputId = `${group.id}-${state.id}`;
                    const commonInputProps = {
                      id: inputId,
                      name: inputId,
                      placeholder: state.placeholder,
                      defaultValue: state.value,
                      disabled: state.disabled,
                      readOnly: state.readOnly,
                      'data-debug': state.debugState,
                    };
                    return (
                      <div
                        key={state.id}
                        data-simulated-state={state.simulatedState}
                        style={{
                          border: `1px solid ${tone.border}`,
                          borderRadius: 16,
                          padding: 16,
                          backgroundColor: tone.bg,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <strong>{state.stateLabel}</strong>
                          {state.badge ? (
                            <span
                              style={{
                                ...badgeStyle,
                                backgroundColor: tone.accent,
                                color: '#120a24',
                              }}
                            >
                              {state.badge}
                            </span>
                          ) : null}
                          {state.debugState ? (
                            <code className={debugFormStyles.code}>
                              data-debug=&quot;{state.debugState}&quot;
                            </code>
                          ) : null}
                        </div>
                        <label htmlFor={inputId}>{group.label}</label>
                        {group.type === 'textarea' ? (
                          <textarea
                            {...commonInputProps}
                            rows={4}
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(245,240,255,0.25)',
                              padding: '10px 12px',
                              backgroundColor: 'rgba(5,4,12,0.75)',
                              color: '#f5f0ff',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                            }}
                          />
                        ) : (
                          <input
                            {...commonInputProps}
                            type={group.type}
                            style={{
                              width: '100%',
                              borderRadius: 10,
                              border: '1px solid rgba(245,240,255,0.25)',
                              padding: '10px 12px',
                              backgroundColor: 'rgba(5,4,12,0.85)',
                              color: '#f5f0ff',
                            }}
                          />
                        )}
                        {state.helper ? (
                          <p style={helperTextStyle}>{state.helper}</p>
                        ) : null}
                        {state.success ? (
                          <p
                            style={{
                              ...helperTextStyle,
                              color: tonePalette.success.text,
                            }}
                          >
                            {state.success}
                          </p>
                        ) : null}
                        {state.error ? (
                          <p
                            style={{
                              ...helperTextStyle,
                              color: tonePalette.error.text,
                            }}
                          >
                            {state.error}
                          </p>
                        ) : null}
                        {state.note ? (
                          <p
                            style={{
                              ...helperTextStyle,
                              color: 'rgba(245,240,255,0.65)',
                              fontStyle: 'italic',
                            }}
                          >
                            {state.note}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Form defenses</h2>
          <p style={sectionIntroStyle}>
            Honeypot + Turnstile token states surfaced in the open so we can
            style them before hiding inside the real dialog.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {defensePreviews.map((defense) => {
              const tone = tonePalette[defense.tone ?? 'default'];
              const inputId = `defense-${defense.id}`;
              return (
                <article
                  key={defense.id}
                  style={{
                    border: `1px dashed ${tone.border}`,
                    borderRadius: 16,
                    padding: 18,
                    backgroundColor: tone.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <strong>{defense.label}</strong>
                    {defense.badge ? (
                      <span
                        style={{
                          ...badgeStyle,
                          backgroundColor: tone.accent,
                          color: '#120a24',
                        }}
                      >
                        {defense.badge}
                      </span>
                    ) : null}
                  </div>
                  <p style={helperTextStyle}>{defense.description}</p>
                  <label
                    htmlFor={inputId}
                    style={{
                      fontSize: 13,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,255,0.65)',
                    }}
                  >
                    {defense.fieldLabel}
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    defaultValue={defense.value}
                    placeholder={defense.placeholder}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid rgba(245,240,255,0.3)',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(4,3,10,0.85)',
                      color: '#f5f0ff',
                    }}
                  />
                  {defense.helper ? (
                    <p style={helperTextStyle}>{defense.helper}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Submission pipeline</h2>
          <p style={sectionIntroStyle}>
            Each tile mirrors a state in the React state machine or API handler
            so we never lose track of a Brevo code path.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {statusCards.map((card) => {
              const tone = tonePalette[card.tone ?? 'default'];
              return (
                <article
                  key={card.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    borderRadius: 14,
                    padding: 16,
                    backgroundColor: tone.bg,
                    minHeight: 140,
                  }}
                >
                  <strong>{card.label}</strong>
                  {card.badge ? (
                    <span
                      style={{
                        ...badgeStyle,
                        backgroundColor: tone.accent,
                        color: '#120a24',
                        marginLeft: 8,
                      }}
                    >
                      {card.badge}
                    </span>
                  ) : null}
                  <p style={helperTextStyle}>{card.description}</p>
                </article>
              );
            })}
          </div>

          <h3
            style={{
              marginTop: 32,
              marginBottom: 12,
            }}
          >
            Draft persistence
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {draftCards.map((card) => {
              const tone = tonePalette[card.tone ?? 'default'];
              return (
                <article
                  key={card.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    borderRadius: 14,
                    padding: 16,
                    backgroundColor: tone.bg,
                    minHeight: 130,
                  }}
                >
                  <strong>{card.label}</strong>
                  <p style={helperTextStyle}>{card.description}</p>
                </article>
              );
            })}
          </div>

          <p style={helperTextStyle}>
            Mirrors the production stack: same max width, same tokens, and
            <code> data-debug</code> hooks so you can freeze any state.
          </p>
          <div className={debugFormStyles.stack}>
            <article className={debugFormStyles.block}>
              <p className={debugFormStyles.eyebrow}>Timeline</p>
              <h4 className={debugFormStyles.title}>
                Submission pipeline
              </h4>
              <ol className={debugFormStyles.list}>
                {requestCards.map((card, index) => {
                  const tone = tonePalette[card.tone ?? 'default'];
                  return (
                    <li
                      key={card.id}
                      className={debugFormStyles.accentListItem}
                      style={{
                        borderLeftColor:
                          tone.accent ??
                          formTokens.field.borders.color.css(),
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          color: formTokens.label.text.color.css(),
                        }}
                      >
                        Step {index + 1}
                      </span>
                      <strong>{card.label}</strong>
                      <p
                        className={debugFormStyles.helperText}
                        style={{ margin: 0 }}
                      >
                        {card.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </article>

            <article className={debugFormStyles.block}>
              <p className={debugFormStyles.eyebrow}>Responses</p>
              <h4 className={debugFormStyles.title}>Brevo codes</h4>
              <div className={debugFormStyles.list}>
                {responseCards.map((card) => {
                  const tone = tonePalette[card.tone ?? 'default'];
                  return (
                    <div
                      key={card.id}
                      className={debugFormStyles.accentListItem}
                      style={{
                        borderLeftColor:
                          tone.accent ??
                          formTokens.field.borders.color.css(),
                      }}
                    >
                      <strong>{card.label}</strong>
                      <p
                        className={debugFormStyles.helperText}
                        style={{ margin: 0 }}
                      >
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className={debugFormStyles.block}>
              <p className={debugFormStyles.eyebrow}>Controls</p>
              <h4 className={debugFormStyles.title}>CTA states</h4>
              <p
                className={debugFormStyles.helperText}
                style={{ marginTop: 0 }}
              >
                Buttons reuse the contact form tokens. Set
                <code> data-debug</code> to freeze hover/focus/disabled states
                without interacting.
              </p>
              <div className={debugFormStyles.ctaList}>
                {ctaStates.map((cta) => {
                  const tone = tonePalette[cta.tone ?? 'default'];
                  const buttonStyle: CSSProperties = {
                    opacity: cta.disabled ? 0.55 : 1,
                    cursor: cta.disabled ? 'not-allowed' : 'pointer',
                  };
                  if (cta.variant === 'secondary') {
                    buttonStyle.backgroundColor = 'transparent';
                    buttonStyle.color =
                      formTokens.field.text.color.css();
                    buttonStyle.border = `${formTokens.field.borders.width.css()} solid ${formTokens.field.borders.color.css()}`;
                  }
                  return (
                    <div
                      key={cta.id}
                      className={debugFormStyles.ctaRow}
                      style={{
                        borderLeftColor:
                          tone.accent ??
                          formTokens.field.borders.color.css(),
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <strong>{cta.label}</strong>
                        {cta.debugState ? (
                          <code className={debugFormStyles.code}>
                            data-debug=&quot;{cta.debugState}&quot;
                          </code>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={cta.disabled}
                        data-variant={cta.variant ?? 'primary'}
                        data-debug={cta.debugState}
                        className={debugFormStyles.ctaButton}
                        style={buttonStyle}
                      >
                        {cta.loading ? (
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: '2px solid rgba(255,255,255,0.18)',
                              borderTopColor:
                                formTokens.field.text.color.css(),
                            }}
                          />
                        ) : null}
                        {cta.buttonLabel}
                      </button>
                      <p
                        className={debugFormStyles.helperText}
                        style={{ margin: 0 }}
                      >
                        {cta.helper}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Feedback, banners & privacy</h2>
          <p style={sectionIntroStyle}>
            Helper text, inline validation, and privacy messaging ready for
            vanilla-extract hooks.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {bannerPreviews.map((banner) => {
              const tone = tonePalette[banner.tone];
              return (
                <article
                  key={banner.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    borderRadius: 16,
                    padding: 18,
                    backgroundColor: tone.bg,
                    minHeight: 130,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <strong>{banner.title}</strong>
                    {banner.badge ? (
                      <span
                        style={{
                          ...badgeStyle,
                          backgroundColor: tone.accent,
                          color: '#120a24',
                        }}
                      >
                        {banner.badge}
                      </span>
                    ) : null}
                  </div>
                  <p style={helperTextStyle}>{banner.body}</p>
                </article>
              );
            })}
          </div>

          <article
            style={{
              marginTop: 24,
              borderRadius: 18,
              border: '1px solid rgba(245,240,255,0.18)',
              padding: 24,
              backgroundColor: 'rgba(6,4,18,0.6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            <div>
              <h3
                style={{
                  margin: '0 0 12px',
                }}
              >
                Privacy modal (Markdown preview)
              </h3>
              <div
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(245,240,255,0.1)',
                  padding: 16,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  lineHeight: 1.6,
                }}
              >
                {privacyMarkdown
                  .split('\n')
                  .filter((line) => line.trim().length > 0)
                  .map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      style={{
                        margin: index === 0 ? '0 0 8px' : '0 0 6px',
                      }}
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
            <div>
              <h3
                style={{
                  margin: '0 0 12px',
                }}
              >
                Accessibility checklist
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: 'rgba(245,240,255,0.8)',
                  lineHeight: 1.6,
                }}
              >
                {accessibilityChecklist.map((item) => (
                  <li key={item.id}>
                    <strong>{item.label} - </strong>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Edge cases & telemetry</h2>
          <p style={sectionIntroStyle}>
            Textual previews for logging, metrics, and operational states so we
            know what to emit once the Brevo client replaces the mock submitter.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {logPreviews.map((log) => {
              const tone = tonePalette[log.tone ?? 'default'];
              return (
                <article
                  key={log.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    borderRadius: 16,
                    padding: 18,
                    backgroundColor: tone.bg,
                  }}
                >
                  <strong>{log.label}</strong>
                  <pre
                    style={{
                      marginTop: 12,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo',
                      fontSize: 13,
                      lineHeight: 1.6,
                      backgroundColor: 'rgba(0,0,0,0.25)',
                      padding: 12,
                      borderRadius: 10,
                      overflowX: 'auto',
                    }}
                  >
                    {log.lines.join('\n')}
                  </pre>
                </article>
              );
            })}
          </div>

          <h3
            style={{
              marginTop: 32,
              marginBottom: 12,
            }}
          >
            Metrics to emit
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {telemetryPreviews.map((metric) => {
              const tone = tonePalette[metric.tone ?? 'default'];
              return (
                <article
                  key={metric.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    borderRadius: 14,
                    padding: 16,
                    backgroundColor: tone.bg,
                  }}
                >
                  <strong>{metric.label}</strong>
                  <p style={helperTextStyle}>{metric.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
