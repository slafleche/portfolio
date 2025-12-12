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
};

export const contactFormScenarioMap: Record<
  string,
  ContactFormScenarioConfig
> = flattenContactFormScenarios(contactFormScenarios);
