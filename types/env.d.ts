interface ContactFormEnv {
  BREVO_API_KEY: string;
  MAIL_FROM: string;
  MAIL_TO: string;
  CONTACT_SUBJECT_PREFIX: string;
  BREVO_TIMEOUT_MS?: string;
  BREVO_RETRY_DELAY_MS?: string;
  BREVO_RETRY_JITTER_MS?: string;
  BREVO_HEALTH_TIMEOUT_MS?: string;
}

interface TurnstileEnv {
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;
}

interface PasswordProtectionEnv {
  PRIVATE_LAUNCH_USER?: string;
  PRIVATE_LAUNCH_PASSWORD?: string;
  PRIVATE_STAGING: '0' | '1';
  PRIVATE_RELEASE: '0' | '1';
  PRIVATE_LOCAL: '0' | '1';
}

interface IndexingEnv {
  ALLOW_INDEXING: '0' | '1';
}

interface VercelEnv {
  VERCEL?: '1';
  NODE_ENV: 'development' | 'production' | 'test';
  VERCEL_ENV: 'development' | 'preview' | 'production';
  VERCEL_GIT_REPO_SLUG?: string;
  VERCEL_GIT_COMMIT_REF?: string;
}

declare namespace NodeJS {
  interface ProcessEnv
    extends ContactFormEnv,
      TurnstileEnv,
      PasswordProtectionEnv,
      IndexingEnv,
      VercelEnv {}
}
