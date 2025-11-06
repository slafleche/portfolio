'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import type {
  ContactFormCopy,
  FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import {
  type ContactFormDraft,
  type FieldName,
  type FieldErrorMap,
  validateDraft,
} from '@/modules/contactForm/validation';
import {
  mockSubmit,
  type ContactFormPayload,
  type ContactFormResponse,
} from '@/modules/contactForm/mockSubmit';
import { sharedStrings } from '@/lib/sharedStrings';
import * as s from '@/styles/components/contactForm.css';
import { formTokens } from '@/tokens/forms.tokens';

type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  locale: string;
  privacyHref?: string;
  onSubmitted?: (response: ContactFormResponse) => void;
};

const DRAFT_STORAGE_PREFIX = 'contact-form-draft';
const DEFAULT_ACTION_URL = '/api/contact';
const DEFAULT_TOKEN = 'mock-turnstile-token';

type FormValues = ContactFormDraft;

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  message: '',
  token: DEFAULT_TOKEN,
  hp: '',
};

const serverStatusToFormStatus = (
  code: ContactFormResponse['code'],
): FormStatusKey => {
  if (code === 'generic_error') return 'generic';
  return code;
};

const isBrowser = () => typeof window !== 'undefined';

const buildErrorMap = (copy: ContactFormCopy) =>
  ({
    'form-error-name-required': copy.errors.name.required,
    'form-error-name-too_long': copy.errors.name.tooLong,
    'form-error-email-invalid': copy.errors.email.invalid,
    'form-error-message-required': copy.errors.message.required,
    'form-error-message-too_long': copy.errors.message.tooLong,
    'form-error-message-too_many_links':
      copy.errors.message.tooManyLinks,
    'form-error-token-missing': copy.errors.token.missing,
  }) as const;

const formatCounter = (template: string, remaining: number) =>
  template.replace('{count}', remaining.toString());

export default function ContactForm({
  copy,
  actionUrl = DEFAULT_ACTION_URL,
  locale,
  privacyHref = sharedStrings.privacyPolicyUrl,
  onSubmitted,
}: ContactFormProps) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [status, setStatus] = useState<FormStatusKey | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] =
    useState(false);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const baseMessageHeight = useRef<number | null>(null);

  const errorMessageMap = useMemo(
    () => buildErrorMap(copy),
    [copy],
  );

  const storageKey = useMemo(
    () => `${DRAFT_STORAGE_PREFIX}:${locale}`,
    [locale],
  );

  // Restore session draft
  useEffect(() => {
    if (!isBrowser()) return;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FormValues>;
      setValues((prev) => ({
        ...prev,
        name: parsed.name ?? prev.name,
        email: parsed.email ?? prev.email,
        message: parsed.message ?? prev.message,
      }));
    } catch {
      // Ignore restore failures
    }
  }, [storageKey]);

  // Persist draft
  useEffect(() => {
    if (!isBrowser()) return;
    const draftPayload = {
      name: values.name,
      email: values.email,
      message: values.message,
    };
    const hasContent = Object.values(draftPayload).some(
      (value) => value.trim().length > 0,
    );
    try {
      if (hasContent) {
        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify(draftPayload),
        );
      } else {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore persistence failures
    }
  }, [storageKey, values.email, values.message, values.name]);

  const resetStatus = useCallback(() => {
    setStatus(null);
    setStatusMessage('');
  }, []);

  const syncMessageHeight = useCallback(() => {
    const textarea = messageRef.current;
    if (!textarea) return;
    if (baseMessageHeight.current === null) {
      baseMessageHeight.current = textarea.scrollHeight;
    }
    textarea.style.height = 'auto';
    const minimum =
      baseMessageHeight.current ?? textarea.scrollHeight;
    const nextHeight = Math.max(textarea.scrollHeight, minimum);
    textarea.style.height = `${nextHeight}px`;
  }, []);

  const handleChange = useCallback(
    (field: FieldName | 'hp', value: string) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        const validation = validateDraft(next);
        setFieldErrors(validation.errors);
        if (status) {
          resetStatus();
        }
        return next;
      });
    },
    [resetStatus, status],
  );

  useLayoutEffect(() => {
    syncMessageHeight();
  }, [syncMessageHeight, values.message]);

  const handleBlur = useCallback(() => {
    setFieldErrors(validateDraft(values).errors);
  }, [values]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;
      setHasAttemptedSubmit(true);
      const validation = validateDraft(values);
      const hasErrors = Object.keys(validation.errors).length > 0;

      if (hasErrors) {
        setFieldErrors(validation.errors);
        setStatus('validation_error');
        setStatusMessage(copy.statuses.validation_error);
        return;
      }

      const payload: ContactFormPayload = {
        name: validation.draft.name,
        email: validation.draft.email,
        message: validation.draft.message,
        token: validation.draft.token || DEFAULT_TOKEN,
        hp: validation.draft.hp,
      };

      // Honeypot short-circuit
      if (payload.hp.trim().length > 0) {
        setStatus('success');
        setStatusMessage(copy.statuses.success);
        setValues({ ...INITIAL_VALUES });
        setFieldErrors({});
        setHasAttemptedSubmit(false);
        if (isBrowser()) {
          window.sessionStorage.removeItem(storageKey);
        }
        if (onSubmitted) {
          onSubmitted({
            ok: true,
            code: 'success',
            message: copy.statuses.success,
          });
        }
        return;
      }

      setIsSubmitting(true);
      setStatus('sending');
      setStatusMessage(copy.statuses.sending);

      try {
        const response = await mockSubmit(payload, {
          messages: copy.statuses,
        });

        const nextStatus = serverStatusToFormStatus(response.code);
        const nextMessage =
          copy.statuses[nextStatus] ?? response.message;

        setStatus(nextStatus);
        setStatusMessage(nextMessage);

        if (response.ok) {
          setValues({ ...INITIAL_VALUES });
          setFieldErrors({});
          setHasAttemptedSubmit(false);
          if (isBrowser()) {
            window.sessionStorage.removeItem(storageKey);
          }
        }

        if (onSubmitted) {
          onSubmitted(response);
        }
      } catch (error) {
        console.error('[ContactForm] submit failed', error);
        setStatus('generic');
        setStatusMessage(copy.statuses.generic);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      copy.statuses,
      isSubmitting,
      onSubmitted,
      storageKey,
      values,
    ],
  );

  const getErrorMessage = useCallback(
    (key?: FieldErrorMap[keyof FieldErrorMap]) =>
      key ? errorMessageMap[key] : '',
    [errorMessageMap],
  );

  const shouldShowError = useCallback(
    (field: FieldName) =>
      hasAttemptedSubmit && Boolean(fieldErrors[field]),
    [fieldErrors, hasAttemptedSubmit],
  );

  const remainingCharacters = useMemo(() => {
    const maxChars = formTokens.message.maxChars;
    return Math.max(0, maxChars - values.message.length);
  }, [values.message.length]);

  const messageCounterId = `${formId}-message-counter`;
  const nameFieldId = `${formId}-name`;
  const emailFieldId = `${formId}-email`;
  const messageFieldId = `${formId}-message`;
  const honeypotFieldId = `${formId}-hp`;

  const nameErrorId =
    shouldShowError('name') && fieldErrors.name
      ? `${nameFieldId}-error`
      : undefined;
  const emailErrorId =
    shouldShowError('email') && fieldErrors.email
      ? `${emailFieldId}-error`
      : undefined;
  const messageErrorId =
    shouldShowError('message') && fieldErrors.message
      ? `${messageFieldId}-error`
      : undefined;

  const describedBy = (
    ...ids: Array<string | undefined>
  ): string | undefined => {
    const valid = ids.filter(Boolean);
    return valid.length ? valid.join(' ') : undefined;
  };

  const statusClassName = status
    ? status === 'success'
      ? s.statusSuccess
      : status === 'generic' || status === 'sending'
        ? s.statusGeneric
        : s.statusError
    : s.visuallyHidden;

  const statusBanner = (
    <div
      className={clsx(statusClassName)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={s.statusText}>{statusMessage}</span>
    </div>
  );

  return (
    <form
      className={s.form}
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      action={actionUrl}
    >
      {statusBanner}
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>{copy.heading}</legend>

        <div className={s.fieldGroup}>
          <label className={s.labelRow} htmlFor={nameFieldId}>
            <span>{copy.labels.name}</span>
            <span aria-hidden="true" className={s.required}>
              *
            </span>
          </label>
          <input
            id={nameFieldId}
            name="name"
            className={s.input}
            value={values.name}
            onChange={(event) =>
              handleChange('name', event.target.value)
            }
            onBlur={handleBlur}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            data-error={Boolean(
              shouldShowError('name') && fieldErrors.name,
            )}
            aria-invalid={
              shouldShowError('name') && fieldErrors.name
                ? 'true'
                : undefined
            }
            aria-describedby={describedBy(nameErrorId)}
          />
          {shouldShowError('name') && fieldErrors.name ? (
            <p id={nameErrorId} className={s.errorText}>
              {getErrorMessage(fieldErrors.name)}
            </p>
          ) : null}
        </div>

        <div className={s.fieldGroup}>
          <label className={s.labelRow} htmlFor={emailFieldId}>
            <span>{copy.labels.email}</span>
            <span aria-hidden="true" className={s.required}>
              *
            </span>
          </label>
          <input
            id={emailFieldId}
            name="email"
            className={s.input}
            value={values.email}
            onChange={(event) =>
              handleChange('email', event.target.value)
            }
            onBlur={handleBlur}
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            data-error={Boolean(
              shouldShowError('email') && fieldErrors.email,
            )}
            aria-invalid={
              shouldShowError('email') && fieldErrors.email
                ? 'true'
                : undefined
            }
            aria-describedby={describedBy(emailErrorId)}
          />
          {shouldShowError('email') && fieldErrors.email ? (
            <p id={emailErrorId} className={s.errorText}>
              {getErrorMessage(fieldErrors.email)}
            </p>
          ) : null}
        </div>

        <div className={s.fieldGroup}>
          <label
            className={s.labelRow}
            htmlFor={messageFieldId}
          >
            <span>{copy.labels.message}</span>
            <span aria-hidden="true" className={s.required}>
              *
            </span>
          </label>
          <textarea
            id={messageFieldId}
            name="message"
            className={s.textarea}
            value={values.message}
            ref={messageRef}
            onChange={(event) =>
              handleChange('message', event.target.value)
            }
            onBlur={handleBlur}
            rows={formTokens.message.minRows}
            maxLength={formTokens.message.maxChars}
            data-error={Boolean(
              shouldShowError('message') && fieldErrors.message,
            )}
            aria-invalid={
              shouldShowError('message') && fieldErrors.message
                ? 'true'
                : undefined
            }
            aria-describedby={describedBy(
              messageErrorId,
              messageCounterId,
            )}
          />
          <div className={s.helperRow}>
            {shouldShowError('message') && fieldErrors.message ? (
              <p id={messageErrorId} className={s.errorText}>
                {getErrorMessage(fieldErrors.message)}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            <p id={messageCounterId} className={s.counter}>
              {formatCounter(
                copy.counterTemplate,
                remainingCharacters,
              )}
            </p>
          </div>
        </div>
      </fieldset>

      <div aria-hidden="true" className={s.visuallyHidden}>
        <label htmlFor={honeypotFieldId}>
          {copy.honeypotLabel}
        </label>
        <input
          id={honeypotFieldId}
          name="hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.hp}
          onChange={(event) =>
            handleChange('hp', event.target.value)
          }
        />
      </div>

      <input type="hidden" name="token" value={values.token} />

      <p className={s.privacy}>
        {copy.privacy.text}{' '}
        <a
          className={s.privacyLink}
          href={privacyHref}
          target="_blank"
          rel="noreferrer"
        >
          {copy.privacy.linkLabel}
        </a>
      </p>

      <div className={s.buttonRow}>
        <button
          type="submit"
          className={s.submitButton}
          disabled={isSubmitting}
        >
          {copy.submitLabel}
        </button>
      </div>
    </form>
  );
}
