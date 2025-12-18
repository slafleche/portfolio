import {
  NAME_LIMIT,
  MESSAGE_MAX_LENGTH,
} from '@/modules/contactForm/validation.constants';

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
  /**
   * Optional initial Turnstile visual state for dev scenarios.
   * Only non-catastrophic states with distinct styling are exposed here.
   */
  turnstileState?: 'ready' | 'verified' | 'expired';
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

const LONG_NAME_FOR_VALIDATION = 'X'.repeat(NAME_LIMIT.max + 10);
const LONG_MESSAGE_FOR_VALIDATION = 'X'.repeat(
  MESSAGE_MAX_LENGTH + 10,
);

const composeScenarioIdFromPath = (segments: string[]): string => {
  if (segments.length === 0) return '';
  if (segments.length === 1) return segments[0];

  const [
    root,
    firstVariant,
    ...rest
  ] = segments;

  let id = `${root}-${firstVariant}`;
  if (rest.length === 0) {
    return id;
  }

  for (const segment of rest) {
    id += `__${segment}`;
  }

  return id;
};

export const flattenContactFormScenarios = (
  tree: Record<string, ContactFormScenarioConfig>,
): Record<string, ContactFormScenarioConfig> => {
  const flat: Record<string, ContactFormScenarioConfig> = {};

  const visit = (
    node: ContactFormScenarioConfig,
    path: string[],
  ) => {
    const effectivePath = path.length ? path : [node.id];
    const composedId = composeScenarioIdFromPath(effectivePath);
    if (!composedId) return;
    flat[composedId] = node;

    if (node.variants) {
      Object.values(node.variants).forEach((variant) => {
        if (!variant.id) return;
        visit(variant, [
          ...effectivePath,
          variant.id,
        ]);
      });
    }
  };

  Object.values(tree).forEach((node) => {
    if (!node.id) return;
    visit(node, [node.id]);
  });

  return flat;
};

export const contactFormScenarios: Record<string, ContactFormScenarioConfig> = {
  loading: {
    id: 'loading',
    label: 'Contact form – loading',
    devState: {
      isSubmitting: true,
    },
  },
  disabled: {
    id: 'disabled',
    label: 'Contact form – all fields disabled',
    initialValues: {
      name: 'Jane Doe',
      email: 'example@example.com',
      message:
        'This is a sufficiently long message for validation.',
      token: 'turnstile-token',
      honeypot: '',
    },
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
        id: 'blocked',
        label: 'Contact form – failure (blocked)',
        devState: {
          forcedSubmitStatus: 'blocked',
        },
      },
      service_unavailable: {
        id: 'service_unavailable',
        label: 'Contact form – failure (service unavailable)',
        devState: {
          forcedSubmitStatus: 'service_unavailable',
        },
      },
    },
  },
  recoverable: {
    id: 'recoverable',
    label: 'Contact form – recoverable (generic_error)',
    initialValues: {
      name: 'Jane Doe',
      email: 'example@example.com',
      message:
        'This is a sufficiently long message for validation.',
    },
    devState: {
      isSubmitting: false,
      forcedSubmitStatus: 'generic_error',
    },
    variants: {
      rate_limited: {
        id: 'rate_limited',
        label: 'Contact form – recoverable (rate_limited)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message:
            'This is a sufficiently long message for validation.',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'rate_limited',
        },
      },
      service_unavailable: {
        id: 'service_unavailable',
        label: 'Contact form – recoverable (service_unavailable)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message:
            'This is a sufficiently long message for validation.',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'service_unavailable',
        },
      },
      validation_server: {
        id: 'validation_server',
        label: 'Contact form – recoverable (validation_error, server)',
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      validation_client: {
        id: 'validation_client',
        label: 'Contact form – recoverable (validation_error, client)',
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
    },
  },
  field_errors: {
    id: 'field_errors',
    label: 'Contact form – field error states',
    variants: {
      name_required: {
        id: 'name_required',
        label: 'Contact form – field error (name required)',
        initialValues: {
          name: '',
          email: 'example@example.com',
          message:
            'This is a sufficiently long message for validation.',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      email_invalid: {
        id: 'email_invalid',
        label: 'Contact form – field error (email invalid)',
        initialValues: {
          name: 'Jane Doe',
          email: 'invalid-email',
          message:
            'This is a sufficiently long message for validation.',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      message_required: {
        id: 'message_required',
        label: 'Contact form – field error (message required)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message: '',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      name_too_long: {
        id: 'name_too_long',
        label: 'Contact form – field error (name too long)',
        initialValues: {
          name: LONG_NAME_FOR_VALIDATION,
          email: 'example@example.com',
          message:
            'This is a sufficiently long message for validation.',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      message_too_short: {
        id: 'message_too_short',
        label: 'Contact form – field error (message too short)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message: 'short',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      message_too_many_links: {
        id: 'message_too_many_links',
        label: 'Contact form – field error (message too many links)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message:
            'Links test: https://example1.com https://example2.com https://example3.com',
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      message_too_long: {
        id: 'message_too_long',
        label: 'Contact form – field error (message too long)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message: LONG_MESSAGE_FOR_VALIDATION,
          token: 'turnstile-token',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      token_missing: {
        id: 'token_missing',
        label: 'Contact form – field error (token missing)',
        initialValues: {
          name: 'Jane Doe',
          email: 'example@example.com',
          message:
            'This is a sufficiently long message for validation.',
          token: '',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
      all_fields_invalid: {
        id: 'all_fields_invalid',
        label: 'Contact form – field error (all fields invalid)',
        initialValues: {
          name: '',
          email: 'invalid-email',
          message: 'short',
          token: '',
          honeypot: '',
        },
        devState: {
          isSubmitting: false,
          forcedSubmitStatus: 'validation_error',
        },
      },
    },
  },
};

export const contactFormScenarioMap: Record<
  string,
  ContactFormScenarioConfig
> = flattenContactFormScenarios(contactFormScenarios);
