import { formTokens } from '@/tokens/forms.tokens';
import type { FormErrorKey } from '@/lib/locales/sections/form.locale';
import type { ContactFormDraft } from '@/modules/contactForm/validation';
import {
	NAME_LIMIT,
	EMAIL_MAX_LENGTH,
	EMAIL_PATTERN,
	URL_PATTERN,
	MESSAGE_URL_LIMIT,
} from '@/modules/contactForm/validation.constants';

export type FieldKey = 'name' | 'email' | 'message' | 'turnstile';

export type FieldConfig<T extends FieldKey = FieldKey> = {
  key: T;
  labelKey?: 'name' | 'email' | 'message';
  control: 'input' | 'textarea' | 'turnstile';
  defaultValue: string;
  inputProps?: Record<string, unknown>;
  validator: (
    value: string,
    draft: Pick<ContactFormDraft, 'name' | 'email' | 'message' | 'token'>,
  ) => FormErrorKey | null;
};

const countUrls = (value: string) => {
  const matches = value.match(URL_PATTERN);
  return matches ? matches.length : 0;
};

export const fieldConfigs: FieldConfig[] = [
  {
    key: 'name',
    labelKey: 'name',
    control: 'input',
    defaultValue: '',
    inputProps: {
      minLength: NAME_LIMIT.min,
      maxLength: NAME_LIMIT.max,
      autoComplete: 'name',
    },
    validator: (value) => {
      if (value.length < NAME_LIMIT.min) {
        return 'form-error-name-required';
      }
      if (value.length > NAME_LIMIT.max) {
        return 'form-error-name-too_long';
      }
      return null;
    },
  },
  {
    key: 'email',
    labelKey: 'email',
    control: 'input',
    defaultValue: '',
    inputProps: {
      type: 'email',
      maxLength: EMAIL_MAX_LENGTH,
      autoComplete: 'email',
    },
    validator: (value) => {
      if (!value.length || !EMAIL_PATTERN.test(value)) {
        return 'form-error-email-invalid';
      }
      return null;
    },
  },
  {
    key: 'message',
    labelKey: 'message',
    control: 'textarea',
    defaultValue: '',
    inputProps: {
      rows: formTokens.message.minRows,
      minLength: formTokens.message.minChars,
      maxLength: formTokens.message.maxChars,
    },
    validator: (value) => {
      if (value.length === 0) {
        return 'form-error-message-required';
      }
      if (value.length < formTokens.message.minChars) {
        return 'form-error-message-too_short';
      }
      if (value.length > formTokens.message.maxChars) {
        return 'form-error-message-too_long';
      }
      if (countUrls(value) > MESSAGE_URL_LIMIT) {
        return 'form-error-message-too_many_links';
      }
      return null;
    },
  },
  {
    key: 'turnstile',
    control: 'turnstile',
    defaultValue: '',
    validator: (_value, draft) =>
      draft.token && draft.token.trim().length > 0
        ? null
        : 'form-error-token-missing',
  },
];
