// Per-page token import whitelists for debug sandboxes.
// Each entry documents a single debug page that is allowed to import
// specific token modules from "@/tokens/*", and why.
//
// By default, debug pages under app/[LOCALE]/debug/ must NOT import tokens.
// Only pages listed here are exempt, and only for the explicit modules
// listed in `allowedTokenImports`.

export const DEBUG_TOKEN_WHITELISTS = [
  {
    filePath: 'app/[LOCALE]/debug/favicons/page.tsx',
    purpose: 'Favicon debug page: exercises favicon token set and asset plan.',
    allowedTokenImports: ['@/tokens/favicon.tokens'],
  },
  {
    filePath:
      'app/[LOCALE]/debug/formelements/SubmissionTimelineSection.tsx',
    purpose:
      'Form elements debug page: exercises form tokens and glassy button tokens.',
    allowedTokenImports: [
      '@/tokens/forms.tokens',
      '@/tokens/glassy.tokens',
    ],
  },
];
