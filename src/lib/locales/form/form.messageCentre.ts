import type { Translator } from '@/lib/locales/sections/helpers.locale';

import { FORM_STATUS_KEYS, type FormStatusKey } from './form.status';

export type MessageCentreBlockLocale = {
  statuses: Record<FormStatusKey, string>;
  rateLimitedCountdown: string;
};

export const buildMessageCentreLocale = (
  translator: Translator,
): MessageCentreBlockLocale => ({
  statuses: Object.fromEntries(
    Object.entries(FORM_STATUS_KEYS).map(
      ([
        status,
        key,
      ]) => [
        status,
        translator(key),
      ],
    ),
  ) as Record<FormStatusKey, string>,
  rateLimitedCountdown: translator(
    'form-status-rate_limited-countdown',
  ),
});
