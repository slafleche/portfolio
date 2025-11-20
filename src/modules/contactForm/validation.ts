import type {
  FormErrorKey,
  FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import {
  NAME_LIMIT,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  URL_PATTERN,
  MESSAGE_URL_LIMIT,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
} from './validation.constants';

export type RawContactFormInput = {
  name?: string | null;
  email?: string | null;
  message?: string | null;
  token?: string | null;
  hp?: string | null;
};

export type ContactFormDraft = {
  name: string;
  email: string;
  message: string;
  token: string;
  hp: string;
};

export type FieldName = 'name' | 'email' | 'message' | 'token';

export type FieldErrorMap = Partial<
  Record<FieldName, FormErrorKey>
>;

export type ValidationResult = {
  draft: ContactFormDraft;
  errors: FieldErrorMap;
  status: FormStatusKey | null;
};

const sanitize = (value?: string | null): string =>
  value ? value.trim() : '';

const clampLength = (value: string, max: number): string => {
  if (value.length <= max) return value;
  return value.slice(0, max);
};

const countUrls = (value: string): number => {
  const matches = value.match(URL_PATTERN);
  return matches ? matches.length : 0;
};

export function normalizeInput(
  input: RawContactFormInput,
): ContactFormDraft {
  const name = clampLength(
    sanitize(input.name),
    NAME_LIMIT.max,
  );
  const email = clampLength(
    sanitize(input.email).toLowerCase(),
    EMAIL_MAX_LENGTH,
  );
  const message = clampLength(
    sanitize(input.message),
    MESSAGE_MAX_LENGTH,
  );
  const token = sanitize(input.token);
  const hp = sanitize(input.hp);

  return {
    name,
    email,
    message,
    token,
    hp,
  };
}

export function validateDraft(
  raw: RawContactFormInput,
): ValidationResult {
  const draft = normalizeInput(raw);
  const errors: FieldErrorMap = {};

  if (draft.name.length < NAME_LIMIT.min) {
    errors.name = 'form-error-name-required';
  } else if (draft.name.length > NAME_LIMIT.max) {
    errors.name = 'form-error-name-too_long';
  }

  if (!draft.email.length || !EMAIL_PATTERN.test(draft.email)) {
    errors.email = 'form-error-email-invalid';
  }

  const minMessageLength = MESSAGE_MIN_LENGTH;
  if (draft.message.length === 0) {
    errors.message = 'form-error-message-required';
  } else if (draft.message.length < minMessageLength) {
    errors.message = 'form-error-message-too_short';
  } else if (draft.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = 'form-error-message-too_long';
  } else if (countUrls(draft.message) > MESSAGE_URL_LIMIT) {
    errors.message = 'form-error-message-too_many_links';
  }

  if (!draft.token) {
    errors.token = 'form-error-token-missing';
  }

  const status: FormStatusKey | null = Object.keys(errors).length
    ? 'validation_error'
    : null;

  return { draft, errors, status };
}
