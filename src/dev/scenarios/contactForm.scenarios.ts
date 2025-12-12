export type ContactFormScenarioConfig = {
  id: string;
  label: string;
  initialValues?: {
    name?: string;
    email?: string;
    message?: string;
    token?: string;
    honeypot?: string;
  };
  devState?: {
    isSubmitting?: boolean;
    forcedSubmitStatus?:
      | 'success'
      | 'validation_error'
      | 'rate_limited'
      | 'service_unavailable'
      | 'not_configured'
      | 'blocked'
      | 'generic_error';
  };
  variants?: Record<string, ContactFormScenarioConfig>;
};

export const contactFormScenarios: Record<string, ContactFormScenarioConfig> = {
  loading: {
    id: 'loading',
    label: 'Contact form – loading',
    devState: {
      isSubmitting: true,
    },
  },
  success: {
    id: 'success',
    label: 'Contact form – success',
    devState: {
      forcedSubmitStatus: 'success',
    },
  },
  failure: {
    id: 'failure',
    label: 'Contact form – failure (generic)',
    devState: {
      forcedSubmitStatus: 'generic_error',
    },
    variants: {
      blocked: {
        id: 'failure_blocked',
        label: 'Contact form – failure (blocked)',
        devState: {
          forcedSubmitStatus: 'blocked',
        },
      },
      service_unavailable: {
        id: 'failure_service_unavailable',
        label: 'Contact form – failure (service unavailable)',
        devState: {
          forcedSubmitStatus: 'service_unavailable',
        },
      },
    },
  },
};
