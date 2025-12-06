import type { FormErrorKey } from '@/lib/locales/sections/form.locale';
import type { FormStatusKey } from '@/lib/locales/form/form.status';
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

export type NameValidationReason =
  | 'empty'
  | 'too_short'
  | 'too_long';

export type NameValidationResult =
  | { ok: true }
  | { ok: false; reason: NameValidationReason };

export type EmailValidationReason =
  | 'empty'
  | 'invalid';

export type EmailValidationResult =
  | { ok: true }
  | { ok: false; reason: EmailValidationReason };

export type MessageValidationReason =
  | 'empty'
  | 'too_short'
  | 'too_long'
  | 'too_many_links';

export type MessageValidationResult =
  | { ok: true; urlCount: number }
  | { ok: false; reason: MessageValidationReason; urlCount: number };

export type TokenValidationReason = 'missing';

export type TokenValidationResult =
  | { ok: true }
  | { ok: false; reason: TokenValidationReason };

export type NameFieldData = {
  value: string;
  length: number;
  validation: NameValidationResult;
};

export type EmailFieldData = {
  value: string;
  validation: EmailValidationResult;
};

export type MessageFieldData = {
  value: string;
  length: number;
  remainingCharacters: number;
  urlCount: number;
  validation: MessageValidationResult;
};

export type TokenFieldData = {
  value: string;
  validation: TokenValidationResult;
};

export type ValidationResult = {
  draft: ContactFormDraft;
  errors: FieldErrorMap;
  status: FormStatusKey | null;
};

// Error ownership summary (kept here as a guide for formCopy/formValidation epics):
// - Name: handles 'empty', 'too_short', 'too_long' reasons and maps them to
//   user-facing "required" vs "too long" messages via NameBlockLocale.errors.
// - Email: handles 'empty', 'invalid' reasons and maps them to the
//   "invalid email" message via EmailBlockLocale.errors.invalid.
// - Message: handles 'empty', 'too_short', 'too_long', 'too_many_links' reasons
//   and maps them to "required", "too short (with {min})", "too long", and
//   "too many links" messages via MessageBlockLocale.errors, plus helper/counter
//   text for remaining characters and URL usage.
// - Token (Turnstile): handles 'missing' (and, via status, expired/error)
//   reasons and maps them to TurnstileBlockLocale.summary/status messages.
// - Honeypot: has no user-facing errors; it only acts as a silent spam gate.

export function evaluateNameField(
  value: string | null | undefined,
): NameFieldData {
  const normalized = sanitize(value);
  const length = normalized.length;
  const validation: NameValidationResult = (() => {
    if (length === 0) return { ok: false, reason: 'empty' };
    if (length < NAME_LIMIT.min)
      return { ok: false, reason: 'too_short' };
    if (length > NAME_LIMIT.max)
      return { ok: false, reason: 'too_long' };
    return { ok: true };
  })();
  return {
    value: normalized,
    length,
    validation,
  };
}

export function evaluateEmailField(
  value: string | null | undefined,
): EmailFieldData {
  const normalized = sanitize(value).toLowerCase();
  const validation: EmailValidationResult = (() => {
    if (!normalized.length)
      return { ok: false, reason: 'empty' };
    if (!EMAIL_PATTERN.test(normalized))
      return { ok: false, reason: 'invalid' };
    return { ok: true };
  })();
  return {
    value: normalized,
    validation,
  };
}

export function evaluateMessageField(
  value: string | null | undefined,
): MessageFieldData {
  const normalized = sanitize(value);
  const length = normalized.length;
  const urlCount = countUrls(normalized);
  const remainingCharacters = Math.max(
    0,
    MESSAGE_MAX_LENGTH - length,
  );
  const validation: MessageValidationResult = (() => {
    if (length === 0) {
      return {
        ok: false,
        reason: 'empty',
        urlCount,
      };
    }
    if (length < MESSAGE_MIN_LENGTH) {
      return {
        ok: false,
        reason: 'too_short',
        urlCount,
      };
    }
    if (length > MESSAGE_MAX_LENGTH) {
      return {
        ok: false,
        reason: 'too_long',
        urlCount,
      };
    }
    if (urlCount > MESSAGE_URL_LIMIT) {
      return {
        ok: false,
        reason: 'too_many_links',
        urlCount,
      };
    }
    return { ok: true, urlCount };
  })();
  return {
    value: normalized,
    length,
    remainingCharacters,
    urlCount,
    validation,
  };
}

export function evaluateTokenField(
  value: string | null | undefined,
): TokenFieldData {
  const normalized = sanitize(value);
  const validation: TokenValidationResult = normalized
    ? { ok: true }
    : { ok: false, reason: 'missing' };
  return {
    value: normalized,
    validation,
  };
}

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

  const nameData = evaluateNameField(draft.name);
  if (!nameData.validation.ok) {
    errors.name =
      nameData.validation.reason === 'too_long'
        ? 'form-error-name-too_long'
        : 'form-error-name-required';
  }

  const emailData = evaluateEmailField(draft.email);
  if (!emailData.validation.ok) {
    errors.email = 'form-error-email-invalid';
  }

  const messageData = evaluateMessageField(draft.message);
  if (!messageData.validation.ok) {
    const reason = messageData.validation.reason;
    errors.message =
      reason === 'too_short'
        ? 'form-error-message-too_short'
        : reason === 'too_long'
          ? 'form-error-message-too_long'
          : reason === 'too_many_links'
            ? 'form-error-message-too_many_links'
            : 'form-error-message-required';
  }

  const tokenData = evaluateTokenField(draft.token);
  if (!tokenData.validation.ok) {
    errors.token = 'form-error-token-missing';
  }

  const status: FormStatusKey | null = Object.keys(errors).length
    ? 'validation_error'
    : null;

  return { draft, errors, status };
}
