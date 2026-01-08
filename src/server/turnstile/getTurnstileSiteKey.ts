import { getTurnstileEnvConfig } from '@/lib/runtimeEnv';

export const getTurnstileSiteKey = (): string | null => {
  const { siteKey } = getTurnstileEnvConfig();
  return siteKey ?? null;
};
