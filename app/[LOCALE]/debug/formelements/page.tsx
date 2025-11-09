type DebugParams = Promise<{ LOCALE: string }>;

type BreakdownRow = {
  label: string;
  states: readonly string[];
  notes?: string;
  owner?: string;
};

type BreakdownSection = {
  title: string;
  intro: string;
  rows: BreakdownRow[];
};

const breakdown: BreakdownSection[] = [
  {
    title: 'Input primitives',
    intro:
      'Single-page contact form fields, showing validation, autofill, async locks, and anti-spam plumbing.',
    rows: [
      {
        label: 'Name field (text)',
        owner: 'ContactForm',
        states: [
          'placeholder idle',
          'focus with floating label',
          'autofill highlight',
          'min-length error',
          'max-length error',
          'success confirmation',
          'keyboard-only navigation',
          'disabled while submitting',
        ],
        notes:
          'Mirror validation copy from `form.locale` so design + localization stay in sync.',
      },
      {
        label: 'Email field',
        owner: 'ContactForm',
        states: [
          'idle placeholder',
          'focus + keyboard shortcuts',
          'autofill / paste detection',
          'invalid format (RFC check)',
          'domain-level validation error',
          'success feedback',
          'disabled while sending',
        ],
        notes:
          'Show how we surface Brevo-side “hard bounce” hints if API rejects the address.',
      },
      {
        label: 'Message textarea',
        owner: 'ContactForm',
        states: [
          'empty placeholder',
          'auto-grow expansion',
          'markdown-style formatting hints',
          'character counter near limit',
          'max length exceeded',
          'too many links detected',
          'draft restored from session storage',
          'read-only during submit',
        ],
        notes:
          'Needs a sticky counter + inline error callout so QA can verify `formTokens.message` limits.',
      },
      {
        label: 'Hidden defenses (honeypot + Turnstile token)',
        owner: 'ContactForm + /api/contact',
        states: [
          'honeypot empty (human)',
          'honeypot filled (bot → silent success)',
          'token present (default mock)',
          'token missing (client validation)',
          'token expired (server-side)',
          'token refresh failure UI',
        ],
        notes:
          'Expose these as inspector-only rows; no visual chrome but the debug page should narrate expected behavior.',
      },
    ],
  },
  {
    title: 'Submission pipeline',
    intro:
      'State machine from local validation through Brevo delivery, covering UI locks and API contracts.',
    rows: [
      {
        label: 'Client status machine',
        owner: 'ContactForm',
        states: [
          'idle (no attempts)',
          'dirty fields',
          'validation_error (inline focus traps)',
          'sending (CTA spinner + aria-live)',
          'success reset (fields cleared, draft cleared)',
          'generic error fallback',
        ],
        notes:
          'Document accessibility hooks (aria-live, focus return) so we can test them while wiring UI.',
      },
      {
        label: 'Draft persistence',
        owner: 'ContactForm',
        states: [
          'nothing stored',
          'partial draft saved per locale',
          'session storage cleared after success',
          'storage unavailable (quota/private mode)',
        ],
        notes:
          'Debug page should explain how to trigger each scenario (e.g., disable storage in DevTools).',
      },
      {
        label: 'Submission controls',
        owner: 'ContactForm',
        states: [
          'CTA enabled (valid form)',
          'CTA disabled (invalid/empty)',
          'CTA loading spinner',
          'CTA keyboard submission (Enter/Ctrl+Enter)',
          'Retry button surfaced after failure',
        ],
      },
      {
        label: 'Brevo request builder',
        owner: '/api/contact',
        states: [
          'prepare payload (name/email/message/token)',
          'inject site metadata (locale, source)',
          'environment guard missing api key',
          'honeypot short-circuit (skip Brevo)',
          'request timeout handling',
        ],
        notes:
          'List headers we plan to send so the debug view doubles as API documentation.',
      },
      {
        label: 'Brevo response mapping',
        owner: '/api/contact + ContactForm',
        states: [
          'success (2xx/202)',
          'validation_error (400 payload issue)',
          'rate_limited (429 + Retry-After)',
          'service_unavailable (5xx/timeout)',
          'blocked (Brevo anti-spam)',
          'generic_error (network/parse failure)',
          'not_configured (missing env)',
        ],
        notes:
          'Each state ties back to `FormStatusKey`; include copy keys we expect to render.',
      },
    ],
  },
  {
    title: 'Feedback & messaging',
    intro:
      'Inline helper text, banners, and privacy disclosures that wrap the submission flow.',
    rows: [
      {
        label: 'Helper text + field errors',
        owner: 'ContactForm + form.locale',
        states: [
          'neutral helper line',
          'inline validation error per field',
          'success microcopy',
          'linkified helper (privacy mention)',
          'RTL / localization stress test',
        ],
      },
      {
        label: 'Status banners',
        owner: 'ContactForm',
        states: [
          'success toast',
          'validation summary banner',
          'generic error banner with retry link',
          'rate limit warning with countdown hint',
          'service outage inline alert',
        ],
        notes:
          'Map each banner to the Brevo response codes so QA can verify copy + iconography.',
      },
      {
        label: 'Privacy modal + markdown',
        owner: 'ContactDialogProvider + Markdown',
        states: [
          'trigger button hover/focus',
          'modal open with scroll lock',
          'markdown rendering (lists, bold, links)',
          'localized content swap',
          'close + return focus',
        ],
      },
      {
        label: 'Accessibility + announcements',
        owner: 'ContactForm',
        states: [
          'aria-live polite for success',
          'assertive for errors',
          'focus ring contrasts',
          'high-contrast mode',
          'reduced motion transitions',
        ],
      },
    ],
  },
  {
    title: 'Edge cases & integrations',
    intro:
      'Non-happy paths we still need to visualize to validate the Brevo integration end-to-end.',
    rows: [
      {
        label: 'Transport failures',
        owner: '/api/contact',
        states: [
          'network error thrown',
          'DNS failure / fetch reject',
          'timeout abort controller',
          'Brevo 5xx with retry advice',
        ],
      },
      {
        label: 'Environment switches',
        owner: 'ContactForm + /api/contact',
        states: [
          'dev mock submit (default)',
          'Brevo live mode (env var present)',
          'missing env (render not_configured)',
          'preview deployments with stub key',
        ],
      },
      {
        label: 'Rate limit & abuse signals',
        owner: '/api/contact',
        states: [
          'per-IP limit reached',
          'Brevo limit headers parsed',
          'cooldown countdown in UI',
          'honeypot triggered metrics',
        ],
      },
      {
        label: 'Telemetry + logging',
        owner: '/api/contact + monitoring',
        states: [
          'structured log (success)',
          'structured log (error with Brevo message)',
          'PII-scrubbed analytics event',
          'alert on repeated failures',
        ],
        notes:
          'The debug page can just spell out the event names + payload fields until we wire actual dashboards.',
      },
    ],
  },
];

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
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
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
              color: 'rgba(245,240,255,0.75)',
            }}
          >
            Temporary staging area for upcoming inputs, selects, toggles,
            and helper copy. All real UI will land later—this is just
            placeholder text to ensure routing works.
          </p>
        </header>

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {breakdown.map((section) => (
            <article
              key={section.title}
              style={{
                padding: 28,
                borderRadius: 18,
                border: '1px solid rgba(245,240,255,0.18)',
                backgroundColor: 'rgba(6,4,18,0.55)',
                backdropFilter: 'blur(14px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 6px',
                    fontSize: 22,
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(245,240,255,0.75)',
                    lineHeight: 1.5,
                  }}
                >
                  {section.intro}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {row.label}
                      </div>
                      {row.owner ? (
                        <span
                          style={{
                            fontSize: 13,
                            letterSpacing: 0.3,
                            textTransform: 'uppercase',
                            color: 'rgba(245,240,255,0.6)',
                          }}
                        >
                          {row.owner}
                        </span>
                      ) : null}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: 'rgba(245,240,255,0.8)',
                        lineHeight: 1.6,
                      }}
                    >
                      {row.states.join(' · ')}
                    </p>
                    {row.notes ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: 'rgba(245,240,255,0.6)',
                        }}
                      >
                        {row.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
