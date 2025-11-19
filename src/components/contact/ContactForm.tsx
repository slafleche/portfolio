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
import * as Toast from '@radix-ui/react-toast';
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
import ContactFormSuccess from '@/components/contact/ContactFormSuccess';
import * as s from '@/styles/components/contactForm.css';
import { formTokens } from '@/tokens/forms.tokens';
import { Markdown } from '@/components/Markdown';
import { useContactDialog } from '@/components/contact/ContactDialogProvider';
import { DEFAULT_LOCALE } from '@/lib/locales/locale';
import { FormLabel } from './FormLabel';
import type {
  ContactFormProps,
  ContactFormDebugFieldState,
  DebugFieldKey,
  TurnstileState,
} from './contactForm.types';

const DRAFT_STORAGE_PREFIX = 'contact-form-draft';
const DEFAULT_ACTION_URL = '/api/contact';
const DEFAULT_TOKEN = 'mock-turnstile-token';
const TURNSTILE_SCRIPT_SRC =
	'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<void> | null = null;

type ToastTone = 'success' | 'info' | 'error';

type ToastState = {
	open: boolean;
	message: string;
	tone: ToastTone;
	id: number;
};

const loadTurnstileScript = () => {
	if (typeof window === 'undefined') {
		return Promise.reject(
			new Error('Turnstile requires a browser environment.'),
		);
	}
	if (window.turnstile) {
		return Promise.resolve();
	}
	if (turnstileScriptPromise) {
		return turnstileScriptPromise;
	}
	turnstileScriptPromise = new Promise<void>((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>(
			'script[data-turnstile]',
		);
		if (existing) {
			existing.addEventListener('load', () => resolve(), {
				once: true,
			});
			existing.addEventListener(
			 'error',
			 () => {
				 turnstileScriptPromise = null;
				 reject(new Error('Turnstile script failed to load.'));
			 },
			 { once: true },
			);
			return;
		}
		const script = document.createElement('script');
		script.src = TURNSTILE_SCRIPT_SRC;
		script.async = true;
		script.defer = true;
		script.dataset.turnstile = 'true';
		script.onload = () => resolve();
		script.onerror = () => {
			turnstileScriptPromise = null;
			reject(new Error('Turnstile script failed to load.'));
		};
		document.head.appendChild(script);
	});
	return turnstileScriptPromise;
};

type FormValues = ContactFormDraft;

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  message: '',
  token: DEFAULT_TOKEN,
  hp: '',
};

const buildInitialValues = (turnstileEnabled: boolean): FormValues => ({
	...INITIAL_VALUES,
	token: turnstileEnabled ? '' : INITIAL_VALUES.token,
});

const serverStatusToFormStatus = (
  code: ContactFormResponse['code'],
): FormStatusKey => {
  if (code === 'generic_error') return 'generic';
  return code;
};

const statusToToastTone = (status: FormStatusKey): ToastTone => {
  if (status === 'success') {
    return 'success';
  }
  if (
    status === 'validation_error' ||
    status === 'rate_limited' ||
    status === 'service_unavailable' ||
    status === 'not_configured' ||
    status === 'blocked' ||
    status === 'generic'
  ) {
    return 'error';
  }
  return 'info';
};

const isBrowser = () => typeof window !== 'undefined';

  const buildErrorMap = (copy: ContactFormCopy) =>
    ({
      'form-error-name-required': copy.errors.name.required,
      'form-error-name-too_long': copy.errors.name.tooLong,
      'form-error-email-invalid': copy.errors.email.invalid,
      'form-error-message-required': copy.errors.message.required,
      'form-error-message-too_short': copy.errors.message.tooShort,
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
  privacyCopy,
  formRef = null,
  onSubmitted,
  debugState,
  locale = DEFAULT_LOCALE,
  toastDebugScenario,
  onSuccessStateChange,
}: ContactFormProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileEnabled = Boolean(turnstileSiteKey);
  const formId = useId();
  const [
    values,
    setValues,
  ] = useState<FormValues>(() => ({
    ...buildInitialValues(turnstileEnabled),
    ...(debugState?.values ?? {}),
  }));
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
  const [
    rateLimitSecondsLeft,
    setRateLimitSecondsLeft,
  ] = useState<number | null>(null);
  const [
    toastState,
    setToastState,
  ] = useState<ToastState>({
    open: false,
    message: '',
    tone: 'info',
    id: 0,
  });
  const toastDebugKeyRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const baseMessageHeight = useRef<number | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileState>(
    turnstileEnabled ? 'loading' : 'bypassed',
  );
  const debugTurnstileRef = useRef<string | null>(null);

  const {
    isPrivacyOpen,
    openPrivacy,
    closePrivacy,
    isOpen,
  } = useContactDialog();
  const shouldRenderTurnstileWidget =
    turnstileEnabled && !debugState?.turnstileSimulation;
  const showTurnstileSection = turnstileEnabled || Boolean(debugState);
  const shouldHideFormBody = status === 'success';
  const dialogWasOpenRef = useRef(isOpen);

  const realFlowDebugEnabled =
    !debugState &&
    (process.env.NEXT_PUBLIC_CONTACT_DEBUG_LOGS === 'true' ||
      process.env.NODE_ENV !== 'production');

  const focusLogsEnabled =
    Boolean(debugState?.logFocusEvents) || realFlowDebugEnabled;

  const telemetryLogsEnabled =
    Boolean(debugState?.enableTelemetryLogs) || realFlowDebugEnabled;

  useEffect(() => {
    onSuccessStateChange?.(shouldHideFormBody);
  }, [onSuccessStateChange, shouldHideFormBody]);


  const resolvedFieldErrors: FieldErrorMap =
    debugState?.fieldErrors ?? fieldErrors;

  const resolvedIsSubmitting = debugState
    ? Boolean(debugState.isSubmitting)
    : isSubmitting;

  const resolvedHasAttemptedSubmit = debugState
    ? debugState.hasAttemptedSubmit ?? Boolean(debugState.fieldErrors)
    : hasAttemptedSubmit;

  const resolvedFieldStates = useMemo(
    () =>
      debugState?.fieldStates ??
      ({} as Partial<Record<DebugFieldKey, ContactFormDebugFieldState>>),
    [debugState?.fieldStates],
  );

  const liveFieldLocks = useMemo(() => {
    const submittingLock =
      resolvedIsSubmitting || status === 'sending';
    const statusLock =
      status === 'blocked' ||
      status === 'rate_limited' ||
      status === 'not_configured' ||
      status === 'success';
    return {
      readOnly: submittingLock,
      disabled: statusLock,
    };
  }, [resolvedIsSubmitting, status]);

  const computedFieldStates = useMemo(() => {
    const next: Partial<
      Record<DebugFieldKey, ContactFormDebugFieldState>
    > = {};
    (
      ['name', 'email', 'message'] as DebugFieldKey[]
    ).forEach((field) => {
      const base = resolvedFieldStates[field];
      const readOnly = liveFieldLocks.readOnly || base?.readOnly;
      const disabled = liveFieldLocks.disabled || base?.disabled;
      if (readOnly || disabled || base?.dataDebug) {
        next[field] = {
          readOnly: Boolean(readOnly),
          disabled: Boolean(disabled),
          dataDebug: base?.dataDebug,
        };
      }
    });
    return next;
  }, [liveFieldLocks, resolvedFieldStates]);

  const resolvedInlineErrors =
    debugState?.inlineErrors ?? ({} as Partial<Record<DebugFieldKey, string>>);

  const resolvedInlineHelpers =
    debugState?.inlineHelpers ?? ({} as Partial<Record<DebugFieldKey, string>>);

  const storageKey = useMemo(() => DRAFT_STORAGE_PREFIX, []);

  const storageKeyRef = useRef(storageKey);
  useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (!shouldRenderTurnstileWidget) {
      return;
    }
    let cancelled = false;

    const mountTurnstile = async () => {
      setTurnstileStatus('loading');
      try {
        await loadTurnstileScript();
        if (
          cancelled ||
          !turnstileContainerRef.current ||
          typeof window === 'undefined'
        ) {
          setTurnstileStatus('error');
          return;
        }
        const turnstileApi = window.turnstile;
        if (!turnstileApi) {
          setTurnstileStatus('error');
          return;
        }

        const container: HTMLElement = turnstileContainerRef.current;
        const widgetId = turnstileApi.render(container, {
          sitekey: turnstileSiteKey as string,
          callback: (token: string) => {
            setValues((prev) => ({ ...prev, token }));
            setTurnstileStatus('verified');
          },
          'expired-callback': () => {
            setValues((prev) => ({ ...prev, token: '' }));
            setTurnstileStatus('expired');
          },
          'error-callback': () => {
            setTurnstileStatus('error');
          },
        });
        turnstileWidgetIdRef.current = widgetId;
        setTurnstileStatus('ready');
      } catch {
        if (!cancelled) {
          setTurnstileStatus('error');
        }
      }
    };

    void mountTurnstile();

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        const turnstileApi = window.turnstile;
        if (turnstileApi && turnstileWidgetIdRef.current) {
          turnstileApi.reset(turnstileWidgetIdRef.current);
        }
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [
    shouldRenderTurnstileWidget,
    turnstileSiteKey,
    setValues,
  ]);

  useEffect(() => {
    const simulation = debugState?.turnstileSimulation ?? null;
    if (simulation === debugTurnstileRef.current) return;
    debugTurnstileRef.current = simulation;
    if (!simulation) {
      return;
    }
    setValues((prev) => ({ ...prev, token: '' }));
    setTurnstileStatus(simulation === 'expired' ? 'expired' : 'ready');
  }, [debugState?.turnstileSimulation, setValues]);

  const resetFormState = useCallback(() => {
    const nextValues = buildInitialValues(turnstileEnabled);
    setValues(nextValues);
    setFieldErrors(validateDraft(nextValues).errors);
    setStatus(null);
    setStatusMessage('');
    setHasAttemptedSubmit(false);
    setIsSubmitting(false);
    if (turnstileEnabled) {
      setTurnstileStatus(
        debugState?.turnstileSimulation === 'expired'
          ? 'expired'
          : 'ready',
      );
      if (typeof window !== 'undefined') {
        const turnstileApi = window.turnstile;
        if (turnstileApi && turnstileWidgetIdRef.current) {
          turnstileApi.reset(turnstileWidgetIdRef.current);
        }
      }
    } else {
      setTurnstileStatus('bypassed');
    }
    if (isBrowser()) {
      window.sessionStorage.removeItem(storageKeyRef.current);
    }
  }, [turnstileEnabled, debugState?.turnstileSimulation]);

  useEffect(() => {
    if (debugState) return;
    const wasOpen = dialogWasOpenRef.current;
    if (wasOpen && !isOpen) {
      resetFormState();
    }
    dialogWasOpenRef.current = isOpen;
  }, [debugState, isOpen, resetFormState]);

  const showToast = useCallback(
    (nextStatus: FormStatusKey, message: string) => {
      if (nextStatus === 'success') return;
      setToastState((prev) => ({
        open: true,
        message,
        tone: statusToToastTone(nextStatus),
        id: prev.id + 1,
      }));
    },
    [],
  );

  const handleToastOpenChange = useCallback((nextOpen: boolean) => {
    setToastState((prev) => ({
      ...prev,
      open: nextOpen,
    }));
  }, []);

  useEffect(() => {
    if (!toastDebugScenario) {
      toastDebugKeyRef.current = null;
      return;
    }
    const normalized =
      typeof toastDebugScenario === 'string'
        ? { code: toastDebugScenario }
        : toastDebugScenario;
    const key = `${normalized.code}:${normalized.message ?? ''}`;
    if (toastDebugKeyRef.current === key) {
      return;
    }
    toastDebugKeyRef.current = key;
    const nextStatus = serverStatusToFormStatus(normalized.code);
    const toastMessage =
      normalized.message ??
      copy.statuses[nextStatus] ??
      copy.statuses.generic;
    showToast(nextStatus, toastMessage);
  }, [toastDebugScenario, copy.statuses, showToast]);

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
      showToast(nextStatus, nextMessage);

      if (
        response.ok &&
        response.code === 'success' &&
        isBrowser()
      ) {
        window.sessionStorage.removeItem(storageKeyRef.current);
      }
      if (
        response.ok &&
        response.code !== 'success' &&
        !options?.preserveValues
      ) {
        resetFormState();
      }
      if (response.code === 'rate_limited') {
        const { retryAfterSeconds } = response;
        if (typeof retryAfterSeconds === 'number') {
          setRateLimitSecondsLeft(retryAfterSeconds);
        } else {
          setRateLimitSecondsLeft(null);
        }
      } else {
        setRateLimitSecondsLeft(null);
      }
    },
    [
      copy.statuses,
      resetFormState,
      showToast,
      storageKeyRef,
      setRateLimitSecondsLeft,
    ],
  );

  const describeElement = useCallback(
    (element: HTMLElement | null) =>
      element
        ? `${element.tagName.toLowerCase()}#${element.id || 'no-id'}`
        : 'none',
    [],
  );

  const logFocusEvent = useCallback(
    (label: string, element: HTMLElement | null) => {
      if (!focusLogsEnabled) return;
      console.debug('[ContactForm][debug][focus]', label, {
        element,
        descriptor: describeElement(element),
        values,
      });
    },
    [focusLogsEnabled, describeElement, values],
  );

  const logStatusFocus = useCallback(
    (label: string) => {
      logFocusEvent(label, statusRef.current);
    },
    [logFocusEvent],
  );

  const logTelemetryEvent = useCallback(
    (event: string, detail?: unknown) => {
      if (!telemetryLogsEnabled) return;
      console.debug('[ContactForm][debug][telemetry]', event, detail ?? null);
    },
    [telemetryLogsEnabled],
  );


  const submitViaApi = useCallback(
    async (
      payload: ContactFormPayload,
    ): Promise<ContactFormResponse> => {
      if (typeof window === 'undefined') {
        throw new Error(
          'Contact form submissions require a browser environment.',
        );
      }
      const target =
        actionUrl.startsWith('http://') ||
        actionUrl.startsWith('https://')
          ? new URL(actionUrl)
          : new URL(actionUrl, window.location.origin);
      target.searchParams.set('locale', locale);
      const response = await fetch(target.toString(), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ContactFormResponse;
      return data;
    },
    [actionUrl, locale],
  );

  const shouldScrollStatus = debugState?.scrollStatusIntoView ?? false;

  useEffect(() => {
    if (!shouldScrollStatus) return;
    if (!status || !statusRef.current) return;
    statusRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [shouldScrollStatus, status]);

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
        logTelemetryEvent(response.code, response);
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
        logTelemetryEvent(
          debugState.statusState.status,
          debugState.statusState,
        );
        setStatus(debugState.statusState.status);
        setStatusMessage(nextMessage);
      }
      return;
    }

    debugStatusKeyRef.current = null;
  }, [applyResponse, copy.statuses, debugState, logTelemetryEvent]);

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
    setRateLimitSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (status !== 'rate_limited') {
      setRateLimitSecondsLeft(null);
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'rate_limited') return;
    if (rateLimitSecondsLeft === null) return;
    if (rateLimitSecondsLeft <= 0) {
      resetStatus();
      return;
    }
    const timer = window.setTimeout(() => {
      setRateLimitSecondsLeft((prev) =>
        prev && prev > 0 ? prev - 1 : null,
      );
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [rateLimitSecondsLeft, resetStatus, status]);

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
    [
      resetStatus,
      status,
    ],
  );

  useLayoutEffect(() => {
    syncMessageHeight();
  }, [
    syncMessageHeight,
    values.message,
  ]);

  useEffect(() => {
    if (!isOpen || isPrivacyOpen) return;
    nameInputRef.current?.focus({ preventScroll: true });
  }, [isOpen, isPrivacyOpen]);

  const handleBlur = useCallback(() => {
    setFieldErrors(validateDraft(values).errors);
  }, [values]);

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

  const handleTurnstileReset = useCallback(() => {
    if (!shouldRenderTurnstileWidget) return;
    setValues((prev) => ({ ...prev, token: '' }));
    setTurnstileStatus('ready');
    if (typeof window !== 'undefined') {
      const turnstileApi = window.turnstile;
      if (turnstileApi && turnstileWidgetIdRef.current) {
        turnstileApi.reset(turnstileWidgetIdRef.current);
      }
    }
  }, [setValues, shouldRenderTurnstileWidget]);

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
        logTelemetryEvent('validation_error', validation.errors);
        const firstInvalid = (
          ['name', 'email', 'message'] as FieldName[]
        ).find((field) => validation.errors[field]);
        if (firstInvalid) {
          const target =
            firstInvalid === 'name'
              ? nameInputRef.current
              : firstInvalid === 'email'
                ? emailInputRef.current
                : messageRef.current;
          logFocusEvent('focus:first-invalid', target);
        }
        return;
      }

      const payload: ContactFormPayload = {
        name: validation.draft.name,
        email: validation.draft.email,
        message: validation.draft.message,
        token:
          validation.draft.token ||
          (turnstileEnabled ? '' : DEFAULT_TOKEN),
        hp: validation.draft.hp,
      };

      // Honeypot short-circuit
      if (payload.hp.trim().length > 0) {
        logTelemetryEvent('blocked', payload);
        const response: ContactFormResponse = {
          ok: true,
          code: 'success',
          message: copy.statuses.success,
        };
        applyResponse(response);
        logStatusFocus('focus:status-success');
        if (onSubmitted) {
          onSubmitted(response);
        }
        return;
      }

      setIsSubmitting(true);
      setStatus('sending');
      setStatusMessage(copy.statuses.sending);
      showToast('sending', copy.statuses.sending);
      logTelemetryEvent('start', payload);
      const shouldUseMockTransport =
        !actionUrl || actionUrl === 'mock';

      try {
        const response = shouldUseMockTransport
          ? await mockSubmit(payload, {
              messages: copy.statuses,
            })
          : await submitViaApi(payload);

        applyResponse(response);
        logTelemetryEvent(response.code, response);
        logStatusFocus(`focus:status-${response.code}`);

        if (onSubmitted) {
          onSubmitted(response);
        }
      } catch (error) {
        console.error('[ContactForm] submit failed', error);
        setStatus('generic');
        setStatusMessage(copy.statuses.generic);
        showToast('generic', copy.statuses.generic);
        logTelemetryEvent('generic_error', error);
        logStatusFocus('focus:status-generic');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      logTelemetryEvent,
      logFocusEvent,
      logStatusFocus,
      applyResponse,
      copy.statuses,
      isSubmitting,
      onSubmitted,
      values,
      turnstileEnabled,
      actionUrl,
      submitViaApi,
      showToast,
    ],
  );

  const getErrorMessage = useCallback(
    (key?: FieldErrorMap[keyof FieldErrorMap]) =>
      key ? errorMessageMap[key] : '',
    [
      errorMessageMap,
    ],
  );

  const tokenErrorMessage =
    resolvedHasAttemptedSubmit && resolvedFieldErrors.token
      ? getErrorMessage(resolvedFieldErrors.token)
      : '';

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
    return Math.max(0, maxChars - values.message.length);
  }, [
    values.message.length,
  ]);

  const turnstileStatusMessage = useMemo(() => {
    switch (turnstileStatus) {
      case 'loading':
        return copy.turnstile.loading;
      case 'ready':
        return copy.turnstile.ready;
      case 'verified':
        return copy.turnstile.verified;
      case 'expired':
        return copy.turnstile.expired;
      case 'error':
        return copy.turnstile.error;
      case 'bypassed':
      default:
        return turnstileEnabled ? null : copy.turnstile.disabled;
    }
  }, [copy.turnstile, turnstileEnabled, turnstileStatus]);

  const rateLimitCountdownLabel = useMemo(() => {
    if (rateLimitSecondsLeft === null) return null;
    const seconds = Math.max(0, rateLimitSecondsLeft);
    const template = copy.rateLimitedCountdown;
    if (template.includes('{seconds}')) {
      return template.replace('{seconds}', seconds.toString());
    }
    return `${copy.statuses.rate_limited} (${seconds}s)`;
  }, [
    copy.rateLimitedCountdown,
    copy.statuses.rate_limited,
    rateLimitSecondsLeft,
  ]);

  const derivedButtonState = useMemo(() => {
    if (resolvedIsSubmitting) {
      return {
        label: copy.statuses.sending,
        disabled: true,
        ariaBusy: true,
        dataDebug: 'sending',
      };
    }

    if (
      turnstileEnabled &&
      !values.token &&
      status !== 'success' &&
      status !== 'blocked' &&
      status !== 'rate_limited' &&
      status !== 'not_configured'
    ) {
      return {
        label: copy.turnstile.buttonPending,
        disabled: true,
        ariaBusy: false,
        dataDebug: 'turnstilePending',
      };
    }

    if (turnstileEnabled && turnstileStatus === 'error') {
      return {
        label: copy.turnstile.buttonError,
        disabled: true,
        ariaBusy: false,
        dataDebug: 'turnstileError',
      };
    }

    if (status === 'rate_limited') {
      return {
        label: rateLimitCountdownLabel ?? copy.statuses.rate_limited,
        disabled: true,
        ariaBusy: false,
        dataDebug: 'locked',
      };
    }

    if (
      status &&
      (status === 'success' ||
        status === 'blocked' ||
        status === 'not_configured')
    ) {
      return {
        label:
          status === 'success' || status === 'blocked'
            ? copy.statuses.success
            : copy.statuses.not_configured,
        disabled: true,
        ariaBusy: false,
        dataDebug: 'locked',
      };
    }

    return {
      label: copy.submitLabel,
      disabled: false,
      ariaBusy: false,
      dataDebug: undefined,
    };
  }, [
    copy.statuses,
    copy.submitLabel,
    copy.turnstile.buttonPending,
    copy.turnstile.buttonError,
    resolvedIsSubmitting,
    status,
    turnstileEnabled,
    turnstileStatus,
    values.token,
    rateLimitCountdownLabel,
  ]);

  const canResetTurnstile =
    shouldRenderTurnstileWidget &&
    (turnstileStatus === 'expired' || turnstileStatus === 'error');

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
    : s.status;

  const privacyUpdated =
    typeof privacyCopy.updated === 'string'
      ? privacyCopy.updated.trim()
      : '';

  const toastToneClass =
    toastState.tone === 'success'
      ? s.toastSuccess
      : toastState.tone === 'error'
        ? s.toastError
        : s.toastInfo;

  const effectiveStatusMessage = useMemo<string>(() => {
    if (status === 'rate_limited' && rateLimitCountdownLabel) {
      return rateLimitCountdownLabel;
    }
    return statusMessage;
  }, [rateLimitCountdownLabel, status, statusMessage]);

  return (
    <Toast.Provider duration={6000} swipeDirection="down">
      <form
        ref={formRef}
        className={s.form}
        noValidate
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        action={actionUrl}
      >
        <div
          className={s.statusWrapper}
          data-visible={status ? 'true' : 'false'}
        >
          {status === 'success' ? (
            <div
              ref={statusRef}
              className={s.statusSuccessStandalone}
              role="status"
              aria-live="assertive"
              aria-atomic="true"
              tabIndex={-1}
            >
              <ContactFormSuccess
                title={copy.statuses.success}
                description={copy.successBody}
              />
            </div>
          ) : status ? (
            <div
              ref={statusRef}
              className={clsx(statusClassName)}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              tabIndex={-1}
            >
              <span className={s.statusText}>
                {effectiveStatusMessage}
              </span>
            </div>
          ) : null}
        </div>
        {!shouldHideFormBody ? (
          <>
            <fieldset className={s.fieldset}>
              <legend className={s.legend}>{copy.heading}</legend>

          <div className={s.fieldGroup}>
            <FormLabel
              htmlFor={nameFieldId}
              label={copy.labels.name}
              required
            />
            <input
              id={nameFieldId}
              name="name"
              className={s.input}
              ref={nameInputRef}
              value={values.name}
              onChange={(event) =>
                handleChange('name', event.target.value)
              }
              onBlur={handleBlur}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              readOnly={computedFieldStates.name?.readOnly ?? false}
              disabled={computedFieldStates.name?.disabled ?? false}
              data-debug={computedFieldStates.name?.dataDebug}
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
            <FormLabel
              htmlFor={emailFieldId}
              label={copy.labels.email}
              required
            />
            <input
              id={emailFieldId}
              name="email"
              className={s.input}
              ref={emailInputRef}
              value={values.email}
              onChange={(event) =>
                handleChange('email', event.target.value)
              }
              onBlur={handleBlur}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              readOnly={computedFieldStates.email?.readOnly ?? false}
              disabled={computedFieldStates.email?.disabled ?? false}
              data-debug={computedFieldStates.email?.dataDebug}
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
            <FormLabel
              htmlFor={messageFieldId}
              label={copy.labels.message}
              required
            />
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
              minLength={formTokens.message.minChars}
              maxLength={formTokens.message.maxChars}
              readOnly={computedFieldStates.message?.readOnly ?? false}
              disabled={computedFieldStates.message?.disabled ?? false}
              data-debug={computedFieldStates.message?.dataDebug}
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

        <div
          aria-hidden="true"
          className={
            debugState?.revealHoneypot ? undefined : s.visuallyHidden
          }
          style={
            debugState?.revealHoneypot
              ? {
                  marginBottom: 12,
                  padding: '8px 12px',
                  border: '1px dotted rgba(255,214,102,0.8)',
                  backgroundColor: 'rgba(255,214,102,0.1)',
                  borderRadius: 8,
                  opacity: 0.7,
                }
              : undefined
          }
        >
          <label htmlFor={honeypotFieldId}>
            {debugState?.revealHoneypot
              ? `${copy.honeypotLabel} (debug honeypot)`
              : copy.honeypotLabel}
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

        <input
          type="hidden"
          name="token"
          value={values.token}
        />

        {showTurnstileSection ? (
          <div className={s.turnstileSection} data-state={turnstileStatus}>
            <div
              ref={turnstileContainerRef}
              className={s.turnstileWidget}
              data-rendered={shouldRenderTurnstileWidget ? 'true' : 'false'}
            >
              {!shouldRenderTurnstileWidget ? (
                <span className={s.turnstilePlaceholder}>
                  {turnstileSiteKey
                    ? copy.turnstile.preview
                    : copy.turnstile.disabled}
                </span>
              ) : null}
            </div>
            {(tokenErrorMessage || turnstileStatusMessage) && (
              <p className={s.turnstileStatus}>
                {tokenErrorMessage || turnstileStatusMessage}
                {canResetTurnstile ? (
                  <button
                    type="button"
                    className={s.turnstileReset}
                    onClick={handleTurnstileReset}
                  >
                    Retry
                  </button>
                ) : null}
              </p>
            )}
          </div>
        ) : null}

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
            disabled={derivedButtonState.disabled}
            data-debug={derivedButtonState.dataDebug}
            aria-busy={
              derivedButtonState.ariaBusy ? 'true' : undefined
            }
          >
            {derivedButtonState.label}
          </button>
        </div>
      </>
        ) : null}
      </form>
      {toastState.message ? (
        <Toast.Root
          key={toastState.id}
          className={clsx(s.toastRoot, toastToneClass)}
          open={toastState.open}
          onOpenChange={handleToastOpenChange}
          aria-live="off"
          role="presentation"
        >
          <Toast.Title className={s.toastTitle}>
            {toastState.message}
          </Toast.Title>
          <Toast.Close
            className={s.toastClose}
            aria-label={copy.privacy.closeLabel}
          >
            ×
          </Toast.Close>
        </Toast.Root>
      ) : null}
      <Toast.Viewport className={s.toastViewport} />
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
    </Toast.Provider>
  );
}
