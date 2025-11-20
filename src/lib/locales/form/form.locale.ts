import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { buildNameBlockLocale, type NameBlockLocale } from './form.name';
import { buildEmailBlockLocale, type EmailBlockLocale } from './form.email';
import { buildMessageBlockLocale, type MessageBlockLocale } from './form.message';
import { buildTurnstileBlockLocale, type TurnstileBlockLocale } from './form.turnstile';

/**
 * Eventually this file will hold only the sparse form-level copy we still need
 * once every block has its own helper.
 */
export type FormBlockLocales = {
  name: NameBlockLocale;
  email: EmailBlockLocale;
  message: MessageBlockLocale;
  turnstile: TurnstileBlockLocale;
};

export const buildFormBlockLocales = (
  translator: Translator,
): FormBlockLocales => ({
  name: buildNameBlockLocale(translator),
  email: buildEmailBlockLocale(translator),
  message: buildMessageBlockLocale(translator),
  turnstile: buildTurnstileBlockLocale(translator),
});
