// Fixtures for runtime-config env usage scanner tests.
// These snippets intentionally use direct process.env access or bare env
// variable names so that scanner rules can be exercised. The tests-domain
// lint rules allow this file as a dedicated fixture.

export const NODE_ENV_DIRECT_SNIPPET = `
  if (process.env.NODE_ENV === 'production') {
    console.log('prod');
  }
`;

export const NODE_ENV_VARIANTS_SNIPPET = `
  const a = process.env['NODE_ENV'];
  const b = process?.env.NODE_ENV;
  const c = process.env?.NODE_ENV;
  const d = process?.env?.['NODE_ENV'];
`;

export const VERCEL_ENV_DIRECT_SNIPPET = `
  const env = process.env.VERCEL_ENV;
  if (env === 'production') {
    console.log('release');
  }
`;

export const VERCEL_ENV_VARIANTS_SNIPPET = `
  const a = process.env['VERCEL_ENV'];
  const b = process?.env.VERCEL_ENV;
  const c = process.env?.VERCEL_ENV;
  const d = process?.env?.['VERCEL_ENV'];
`;

export const BRANCH_ENV_DIRECT_SNIPPET = `
  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.VERCEL_GIT_BRANCH ||
    process.env.BRANCH;
  console.log(branch);
`;

export const BRANCH_ENV_BARE_SNIPPET = `
  const a = VERCEL_GIT_COMMIT_REF;
  const b = VERCEL_GIT_BRANCH;
  const c = BRANCH;
`;

export const TEST_FILE_NODE_ENV_SNIPPET = `
  describe('example', () => {
    it('reads NODE_ENV directly', () => {
      expect(process.env.NODE_ENV).toBeDefined();
    });
  });
`;

export const NON_TEST_NODE_ENV_SNIPPET = `
  if (process.env.NODE_ENV === 'production') {
    console.log('prod');
  }
`;

export const TURNSTILE_SITE_KEY_DIRECT_SNIPPET = `
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  console.log(siteKey);
`;

export const TURNSTILE_SITE_KEY_VARIANTS_SNIPPET = `
  const a = process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
  const b = process?.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const c = process.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const d = process?.env?.['NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
`;

export const TURNSTILE_SECRET_DIRECT_SNIPPET = `
  const secret = process.env.TURNSTILE_SECRET;
  console.log(secret);
`;

export const TURNSTILE_SECRET_VARIANTS_SNIPPET = `
  const a = process.env['TURNSTILE_SECRET'];
  const b = process?.env.TURNSTILE_SECRET;
  const c = process.env?.TURNSTILE_SECRET;
  const d = process?.env?.['TURNSTILE_SECRET'];
`;

export const BREVO_DIRECT_SNIPPET = `
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;
  const prefix = process.env.CONTACT_SUBJECT_PREFIX;
  console.log(apiKey, from, to, prefix);
`;

export const BREVO_VARIANTS_SNIPPET = `
  const apiKeyA = process.env['BREVO_API_KEY'];
  const apiKeyB = process?.env.BREVO_API_KEY;
  const apiKeyC = process.env?.BREVO_API_KEY;
  const apiKeyD = process?.env?.['BREVO_API_KEY'];

  const fromA = process.env['MAIL_FROM'];
  const fromB = process?.env.MAIL_FROM;
  const fromC = process.env?.MAIL_FROM;
  const fromD = process?.env?.['MAIL_FROM'];

  const toA = process.env['MAIL_TO'];
  const toB = process?.env.MAIL_TO;
  const toC = process.env?.MAIL_TO;
  const toD = process?.env?.['MAIL_TO'];

  const prefixA = process.env['CONTACT_SUBJECT_PREFIX'];
  const prefixB = process?.env.CONTACT_SUBJECT_PREFIX;
  const prefixC = process.env?.CONTACT_SUBJECT_PREFIX;
  const prefixD = process?.env?.['CONTACT_SUBJECT_PREFIX'];
`;

