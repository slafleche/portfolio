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
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import * as Dialog from '@radix-ui/react-dialog';
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
import * as s from '@/styles/components/contactForm.css';
import { formTokens } from '@/tokens/forms.tokens';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { Markdown } from '@/components/Markdown';
import { useContactDialog } from '@/components/contact/ContactDialogProvider';

type DebugFieldKey = Exclude<FieldName, 'token'>;

export type ContactFormDebugFieldState = {
  readOnly?: boolean;
  disabled?: boolean;
  dataDebug?: string;
};

export type ContactFormDebugState = {
  values?: Partial<FormValues>;
  fieldErrors?: FieldErrorMap;
  inlineErrors?: Partial<Record<DebugFieldKey, string>>;
  inlineHelpers?: Partial<Record<DebugFieldKey, string>>;
  statusState?: {
    status: FormStatusKey;
    message?: string;
  };
  responseSimulation?: ContactFormResponse;
  isSubmitting?: boolean;
  hasAttemptedSubmit?: boolean;
  fieldStates?: Partial<Record<DebugFieldKey, ContactFormDebugFieldState>>;
  button?: {
    label?: string;
    disabled?: boolean;
    dataDebug?: string;
    ariaBusy?: boolean;
  };
};

type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  locale: string;
  privacyCopy: PrivacyCopy;
  privacyHref?: string;
  onSubmitted?: (response: ContactFormResponse) => void;
  debugState?: ContactFormDebugState;
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
  privacyCopy,
  onSubmitted,
  debugState,
}: ContactFormProps) {
  const formId = useId();
  const [
    values,
    setValues,
  ] = useState<FormValues>(INITIAL_VALUES);
  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrorMap>(
    () => validateDraft(INITIAL_VALUES).errors,
  );
  const [
    status,
    setStatus,
  ] = useState<FormStatusKey | null>(null);
  const [
    statusMessage,
    setStatusMessage,
  ] = useState<string>('');
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);
  const [
    hasAttemptedSubmit,
    setHasAttemptedSubmit,
  ] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const baseMessageHeight = useRef<number | null>(null);

  const {
    isPrivacyOpen,
    openPrivacy,
    closePrivacy,
  } = useContactDialog();

  const resolvedValues: FormValues = debugState?.values
    ? {
        ...INITIAL_VALUES,
        ...debugState.values,
      }
    : values;

  const resolvedFieldErrors: FieldErrorMap =
    debugState?.fieldErrors ?? fieldErrors;

  const resolvedIsSubmitting = debugState
    ? Boolean(debugState.isSubmitting)
    : isSubmitting;

  const resolvedHasAttemptedSubmit = debugState
    ? debugState.hasAttemptedSubmit ?? Boolean(debugState.fieldErrors)
    : hasAttemptedSubmit;

  const resolvedFieldStates =
    debugState?.fieldStates ?? ({} as Partial<Record<DebugFieldKey, ContactFormDebugFieldState>>);

  const resolvedInlineErrors =
    debugState?.inlineErrors ?? ({} as Partial<Record<DebugFieldKey, string>>);

  const resolvedInlineHelpers =
    debugState?.inlineHelpers ?? ({} as Partial<Record<DebugFieldKey, string>>);

  const resolvedButton = debugState?.button;

  const storageKey = useMemo(
    () => `${DRAFT_STORAGE_PREFIX}:${locale}`,
    [
      locale,
    ],
  );

  const storageKeyRef = useRef(storageKey);
  useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);

  const applyResponse = useCallback(
    (
      response: ContactFormResponse,
      options?: { preserveValues?: boolean },
    ) => {
      const nextStatus = serverStatusToFormStatus(response.code);
      const nextMessage =
        copy.statuses[nextStatus] ?? response.message;

      setStatus(nextStatus);
      setStatusMessage(nextMessage);

      if (response.ok && !options?.preserveValues) {
        setValues({ ...INITIAL_VALUES });
        setFieldErrors({});
        setHasAttemptedSubmit(false);
        if (isBrowser()) {
          window.sessionStorage.removeItem(
            storageKeyRef.current,
          );
        }
      }
    },
    [
      copy.statuses,
    ],
  );

  const debugStatusKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!debugState) {
      debugStatusKeyRef.current = null;
      return;
    }

    if (debugState.responseSimulation) {
      const response = debugState.responseSimulation;
      const key = `response:${response.code}:${response.message}:${response.ok}`;
      if (debugStatusKeyRef.current !== key) {
        debugStatusKeyRef.current = key;
        applyResponse(response, { preserveValues: true });
      }
      return;
    }

    if (debugState.statusState) {
      const key = `state:${debugState.statusState.status}:${debugState.statusState.message ?? ''
        }`;
      if (debugStatusKeyRef.current !== key) {
        debugStatusKeyRef.current = key;
        const nextMessage =
          debugState.statusState.message ??
          copy.statuses[debugState.statusState.status];
        setStatus(debugState.statusState.status);
        setStatusMessage(nextMessage);
      }
      return;
    }

    debugStatusKeyRef.current = null;
  }, [applyResponse, copy.statuses, debugState]);

  const errorMessageMap = useMemo(
    () => buildErrorMap(copy),
    [
      copy,
    ],
  );

  // Restore session draft
  useEffect(() => {
    if (debugState) return;
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
  }, [debugState, storageKey]);

  // Persist draft
  useEffect(() => {
    if (debugState) return;
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
  }, [
    debugState,
    storageKey,
    values.email,
    values.message,
    values.name,
  ]);

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
      if (debugState) return;
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
    [
      debugState,
      resetStatus,
      status,
    ],
  );

  useLayoutEffect(() => {
    syncMessageHeight();
  }, [
    syncMessageHeight,
    resolvedValues.message,
  ]);

  const handleBlur = useCallback(() => {
    if (debugState) return;
    setFieldErrors(validateDraft(values).errors);
  }, [
    debugState,
    values,
  ]);

  const handlePrivacyLinkClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      openPrivacy();
    },
    [openPrivacy],
  );

  const handlePrivacyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openPrivacy();
      } else {
        closePrivacy();
      }
    },
    [closePrivacy, openPrivacy],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (debugState) return;
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
        const response: ContactFormResponse = {
          ok: true,
          code: 'success',
          message: copy.statuses.success,
        };
        applyResponse(response);
        if (onSubmitted) {
          onSubmitted(response);
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

        applyResponse(response);

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
      applyResponse,
      copy.statuses,
      debugState,
      isSubmitting,
      onSubmitted,
      values,
    ],
  );

  const getErrorMessage = useCallback(
    (key?: FieldErrorMap[keyof FieldErrorMap]) =>
      key ? errorMessageMap[key] : '',
    [
      errorMessageMap,
    ],
  );

  const shouldShowError = useCallback(
    (field: FieldName) =>
      resolvedHasAttemptedSubmit &&
      Boolean(resolvedFieldErrors[field]),
    [
      resolvedFieldErrors,
      resolvedHasAttemptedSubmit,
    ],
  );

  const remainingCharacters = useMemo(() => {
    const maxChars = formTokens.message.maxChars;
    return Math.max(0, maxChars - resolvedValues.message.length);
  }, [
    resolvedValues.message.length,
  ]);

  const messageCounterId = `${formId}-message-counter`;
  const nameFieldId = `${formId}-name`;
  const emailFieldId = `${formId}-email`;
  const messageFieldId = `${formId}-message`;
  const honeypotFieldId = `${formId}-hp`;

  const nameErrorId =
    shouldShowError('name') && resolvedFieldErrors.name
      ? `${nameFieldId}-error`
      : undefined;
  const nameHelperId = resolvedInlineHelpers.name
    ? `${nameFieldId}-helper`
    : undefined;
  const emailErrorId =
    shouldShowError('email') && resolvedFieldErrors.email
      ? `${emailFieldId}-error`
      : undefined;
  const emailHelperId = resolvedInlineHelpers.email
    ? `${emailFieldId}-helper`
    : undefined;
  const messageErrorId =
    shouldShowError('message') && resolvedFieldErrors.message
      ? `${messageFieldId}-error`
      : undefined;
  const messageHelperId = resolvedInlineHelpers.message
    ? `${messageFieldId}-helper`
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

  const privacyUpdated =
    typeof privacyCopy.updated === 'string'
      ? privacyCopy.updated.trim()
      : '';

  return (
    <>
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
              value={resolvedValues.name}
              onChange={(event) =>
                handleChange('name', event.target.value)
              }
              onBlur={handleBlur}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              readOnly={resolvedFieldStates.name?.readOnly ?? false}
              disabled={resolvedFieldStates.name?.disabled ?? false}
              data-debug={resolvedFieldStates.name?.dataDebug}
              data-error={Boolean(
                shouldShowError('name') && resolvedFieldErrors.name,
              )}
              aria-invalid={
                shouldShowError('name') && resolvedFieldErrors.name
                  ? 'true'
                  : undefined
              }
              aria-describedby={describedBy(nameHelperId, nameErrorId)}
            />
            {shouldShowError('name') && resolvedFieldErrors.name ? (
              <p id={nameErrorId} className={s.errorText}>
                {resolvedInlineErrors.name ??
                  getErrorMessage(resolvedFieldErrors.name)}
              </p>
            ) : null}
            {!shouldShowError('name') &&
            resolvedInlineHelpers.name ? (
              <p id={nameHelperId} className={s.counter}>
                {resolvedInlineHelpers.name}
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
              value={resolvedValues.email}
              onChange={(event) =>
                handleChange('email', event.target.value)
              }
              onBlur={handleBlur}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              readOnly={resolvedFieldStates.email?.readOnly ?? false}
              disabled={resolvedFieldStates.email?.disabled ?? false}
              data-debug={resolvedFieldStates.email?.dataDebug}
              data-error={Boolean(
                shouldShowError('email') && resolvedFieldErrors.email,
              )}
              aria-invalid={
                shouldShowError('email') && resolvedFieldErrors.email
                  ? 'true'
                  : undefined
              }
              aria-describedby={describedBy(emailHelperId, emailErrorId)}
            />
            {shouldShowError('email') && resolvedFieldErrors.email ? (
              <p id={emailErrorId} className={s.errorText}>
                {resolvedInlineErrors.email ??
                  getErrorMessage(resolvedFieldErrors.email)}
              </p>
            ) : null}
            {!shouldShowError('email') &&
            resolvedInlineHelpers.email ? (
              <p id={emailHelperId} className={s.counter}>
                {resolvedInlineHelpers.email}
              </p>
            ) : null}
          </div>

          <div className={s.fieldGroup}>
            <label className={s.labelRow} htmlFor={messageFieldId}>
              <span>{copy.labels.message}</span>
              <span aria-hidden="true" className={s.required}>
                *
              </span>
            </label>
            <textarea
              id={messageFieldId}
              name="message"
              className={s.textarea}
              value={resolvedValues.message}
              ref={messageRef}
              onChange={(event) =>
                handleChange('message', event.target.value)
              }
              onBlur={handleBlur}
              rows={formTokens.message.minRows}
              minLength={formTokens.message.minChars}
              maxLength={formTokens.message.maxChars}
              readOnly={resolvedFieldStates.message?.readOnly ?? false}
              disabled={resolvedFieldStates.message?.disabled ?? false}
              data-debug={resolvedFieldStates.message?.dataDebug}
              data-error={Boolean(
                shouldShowError('message') &&
                  resolvedFieldErrors.message,
              )}
              aria-invalid={
                shouldShowError('message') &&
                resolvedFieldErrors.message
                  ? 'true'
                  : undefined
              }
              aria-describedby={describedBy(
                messageErrorId,
                messageHelperId,
                messageCounterId,
              )}
            />
            <div className={s.helperRow}>
              {shouldShowError('message') &&
              resolvedFieldErrors.message ? (
                <p id={messageErrorId} className={s.errorText}>
                  {resolvedInlineErrors.message ??
                    getErrorMessage(resolvedFieldErrors.message)}
                </p>
              ) : resolvedInlineHelpers.message ? (
                <p id={messageHelperId} className={s.counter}>
                  {resolvedInlineHelpers.message}
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
          value={resolvedValues.hp}
          onChange={(event) =>
            handleChange('hp', event.target.value)
          }
        />
      </div>

      <input
        type="hidden"
        name="token"
        value={resolvedValues.token}
      />

        <p className={s.privacy}>
          {copy.privacy.text}{' '}
          <button
            type="button"
            className={s.privacyLink}
            onClick={handlePrivacyLinkClick}
            aria-haspopup="dialog"
          >
            {copy.privacy.linkLabel}
          </button>
        </p>

        <div className={s.buttonRow}>
        <button
          type="submit"
          className={s.submitButton}
          disabled={
            resolvedButton?.disabled ?? resolvedIsSubmitting
          }
          data-debug={resolvedButton?.dataDebug}
          aria-busy={
            resolvedButton?.ariaBusy || resolvedIsSubmitting
              ? 'true'
              : undefined
          }
        >
          {resolvedButton?.label ?? copy.submitLabel}
        </button>
      </div>
      </form>
      <Dialog.Root
        open={isPrivacyOpen}
        onOpenChange={handlePrivacyOpenChange}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={s.privacyOverlay} />
          <Dialog.Content className={s.privacyDialog}>
            <div className={s.privacyPanel}>
              <Dialog.Title className={s.privacyTitle}>
                {privacyCopy.title}
              </Dialog.Title>
              {privacyUpdated ? (
                <p className={s.privacyUpdated}>{privacyUpdated}</p>
              ) : null}
              <Dialog.Description asChild>
                <Markdown
                  source={privacyCopy.content}
                  className={s.privacyBody}
                />
              </Dialog.Description>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={s.privacyCloseIcon}
                  aria-label={copy.privacy.closeLabel}
                >
                  ×
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
