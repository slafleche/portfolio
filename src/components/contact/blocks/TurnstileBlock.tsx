import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';
import { useFormBlock } from '../formBlocks.context';
import { FormHint } from '@/components/contact/primitives/FormHint';
import type { TurnstileBlockLocale } from '@/lib/locales/form/form.turnstile';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockValidationResult,
  ContactFormBlockContract,
  ContactFormBlockPayload,
} from '../types/form.types';

export type TurnstileBlockProps = Omit<
  ContactFormBlockBaseProps,
  'required'
> & {
  copy: TurnstileBlockLocale;
  turnstileSiteKey: string | null;
};

export type TurnstileState =
  | 'loading'
  | 'ready'
  | 'verified'
  | 'expired'
  | 'error';

const COMPLETED_STATUSES: TurnstileState[] = ['verified'];

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type ExtendedWindow = Window & { turnstile?: Window['turnstile'] };

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Turnstile requires a browser environment.'),
    );
  }
  const extendedWindow = window as ExtendedWindow;
  if (extendedWindow.turnstile) {
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

const buildTurnstileValidationResult = (
  id: string,
  status: TurnstileState,
  copy: TurnstileBlockLocale,
  token: string,
): ContactFormBlockValidationResult => {
  const hasToken = token.trim().length > 0;
  const valid =
    COMPLETED_STATUSES.includes(status) ||
    (hasToken && status !== 'expired' && status !== 'error');
  if (valid) {
    return {
      id,
      valid: true,
      messages: [],
    };
  }

  const code =
    status === 'expired'
      ? 'turnstile.expired'
      : status === 'error'
        ? 'turnstile.error'
        : 'turnstile.missing';

  const text =
    status === 'expired'
      ? copy.summary.expired
      : status === 'error'
        ? copy.summary.error
        : copy.summary.missing;

  return {
    id,
    valid: false,
    messages: [
      {
        type: 'error',
        code,
        text,
        scrollTarget: id,
      },
    ],
  };
};

const buildTurnstileContract = (
  id: string,
  status: TurnstileState,
  copy: TurnstileBlockLocale,
  token: string,
): ContactFormBlockContract<string> => ({
  validate: () =>
    buildTurnstileValidationResult(id, status, copy, token),
  getPayload: (): ContactFormBlockPayload<string> => ({
    id,
    value: token,
  }),
  focus: () => {
    // Placeholder: focus behaviour can be refined once the form orchestrator uses it.
  },
});

	export function TurnstileBlock({
	  id,
	  order,
	  disabled,
	  copy,
	  turnstileSiteKey,
	}: TurnstileBlockProps) {
	  const hasTurnstileConfig = Boolean(turnstileSiteKey);

  const hasInlineTurnstile =
    typeof window !== 'undefined' &&
    Boolean((window as ExtendedWindow).turnstile);

  const [
    status,
    setStatus,
  ] = useState<TurnstileState>('loading');
  const [
    token,
    setToken,
  ] = useState<string>('');

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const shouldRenderTurnstileWidget =
    hasTurnstileConfig || hasInlineTurnstile;

  const registration = useMemo(() => {
    const contract = buildTurnstileContract(
      id,
      status,
      copy,
      token,
    );
    return {
      key: 'turnstile',
      getValue: () => token,
      validate: () => contract.validate().valid,
      getValidationSummary: () => {
        if (COMPLETED_STATUSES.includes(status)) return null;
        if (status === 'expired') return copy.summary.expired;
        if (status === 'error') return copy.summary.error;
        return copy.summary.missing;
      },
      focus: contract.focus,
      // Turnstile participates in validation only via the
      // continuous-validation flow after the first failed submit.
      liveValidation: false,
      getContract: () => contract,
    };
  }, [
    copy,
    id,
    status,
    token,
  ]);

  const { continuousValidation, reportCatastrophic } =
    useFormBlock(registration);

  useEffect(() => {
    if (!token) return;
    if (status === 'verified') return;
    setStatus('verified');
  }, [
    status,
    token,
  ]);

  useEffect(() => {
    if (!shouldRenderTurnstileWidget || !turnstileSiteKey) return;
    let cancelled = false;
    setStatus('loading');
    const mountWidget = async () => {
      if (widgetIdRef.current) {
        return;
      }
      try {
        await loadTurnstileScript();
        if (cancelled) return;
        const extendedWindow = window as ExtendedWindow;
        const turnstileApi = extendedWindow.turnstile;
        const container = widgetRef.current;
        if (!turnstileApi || !container) {
          reportCatastrophic(
            'Turnstile unavailable: missing API or container.',
          );
          throw new Error('Turnstile unavailable');
        }
        if (container.childNodes.length > 0) {
          return;
        }
        const widgetId = turnstileApi.render(container, {
          sitekey: turnstileSiteKey,
          callback: (nextToken: string) => {
            if (cancelled) return;
            setToken(nextToken);
            setStatus('verified');
          },
          'expired-callback': () => {
            if (cancelled) return;
            setToken('');
            setStatus('expired');
          },
          'error-callback': () => {
            if (cancelled) return;
            setStatus('error');
            reportCatastrophic(
              'Turnstile reported an error via error-callback.',
            );
          },
        });
        widgetIdRef.current = widgetId;
        setStatus((previous) =>
          previous === 'verified' ? 'verified' : 'ready',
        );
      } catch {
        if (!cancelled) {
          setStatus('error');
          reportCatastrophic(
            'Turnstile script failed to load or initialise.',
          );
        }
      }
    };
    void mountWidget();
    return () => {
      cancelled = true;
      const extendedWindow = window as ExtendedWindow;
      const turnstileApi = extendedWindow.turnstile;
      if (turnstileApi && widgetIdRef.current) {
        turnstileApi.reset(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [
    reportCatastrophic,
    shouldRenderTurnstileWidget,
    turnstileSiteKey,
  ]);

  const isComplete = COMPLETED_STATUSES.includes(status);
  const summaryText = !isComplete
    ? status === 'expired'
      ? copy.summary.expired
      : status === 'error'
        ? copy.summary.error
        : copy.summary.missing
    : null;
  const helperText = !isComplete ? copy.requiredText : null;
  const disabledText = disabled ? copy.statuses.disabled : null;
  const showError = Boolean(
    summaryText && continuousValidation && !disabled,
  );
  const hintText =
    disabledText ?? (showError ? summaryText : helperText);
  const hintId = `${id}-turnstile-hint`;

  return (
    <div
      id={id}
      data-order={order}
      className={clsx(s.turnstileSection)}
      data-state={status}
      data-disabled={disabled ? 'true' : 'false'}
      aria-disabled={disabled ? 'true' : undefined}
      onClickCapture={
        ((event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }) as MouseEventHandler<HTMLDivElement>
      }
    >
      <div
        ref={widgetRef}
        className={s.turnstileWidget}
        aria-describedby={hintText ? hintId : undefined}
        data-rendered="true"
      >
      </div>
      <input type="hidden" name="token" value={token} />
      {hintText ? (
        <div
          data-form-turnstile="status"
          className={s.turnstileStatus}
        >
          <FormHint
            id={hintId}
            tone={showError ? 'error' : 'helper'}
          >
            {hintText}
          </FormHint>
        </div>
      ) : null}
    </div>
  );
}
