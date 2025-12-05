import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';
import { useFormBlock } from '../formBlocks.context';
import type { TurnstileBlockLocale } from '@/lib/locales/form/form.turnstile';

export type TurnstileBlockProps = {
  copy: TurnstileBlockLocale;
};

export type TurnstileState =
  | 'bypassed'
  | 'loading'
  | 'ready'
  | 'verified'
  | 'expired'
  | 'error';



const COMPLETED_STATUSES: TurnstileState[] = ['verified', 'bypassed'];

const DEFAULT_TURNSTILE_TOKEN = 'mock-turnstile-token';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (id?: string) => void;
};

type ExtendedWindow = Window & { turnstile?: TurnstileApi };

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

export function TurnstileBlock({
  copy,
}: TurnstileBlockProps) {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
  const turnstileEnabled = Boolean(turnstileSiteKey);

  const [status, setStatus] = useState<TurnstileState>(
    turnstileEnabled ? 'loading' : 'bypassed',
  );
  const [token, setToken] = useState<string>(
    turnstileEnabled ? '' : DEFAULT_TURNSTILE_TOKEN,
  );

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const shouldRenderTurnstileWidget = turnstileEnabled;

  useEffect(() => {
    if (!shouldRenderTurnstileWidget || !turnstileSiteKey) return;
    let cancelled = false;
    setStatus('loading');
    const mountWidget = async () => {
      try {
        await loadTurnstileScript();
        if (cancelled) return;
        const extendedWindow = window as ExtendedWindow;
        const turnstileApi = extendedWindow.turnstile;
        const container = widgetRef.current;
        if (!turnstileApi || !container) {
          throw new Error('Turnstile unavailable');
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
          },
        });
        widgetIdRef.current = widgetId;
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setStatus('error');
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
  }, [shouldRenderTurnstileWidget, turnstileSiteKey]);

  const statusMessage = useMemo(() => {
    if (status === 'expired') return copy.statuses.expired;
    if (status === 'error') return copy.statuses.error;
    return null;
  }, [copy.statuses, status]);

  const validationSummary = useMemo(() => {
    if (COMPLETED_STATUSES.includes(status)) return null;
    if (status === 'expired') return copy.summary.expired;
    if (status === 'error') return copy.summary.error;
    return copy.summary.missing;
  }, [copy.summary, status]);

  useFormBlock(
    useMemo(
      () => ({
        key: 'turnstile',
        getValue: () => token,
        validate: () => COMPLETED_STATUSES.includes(status),
        getValidationSummary: () => validationSummary,
      }),
      [status, token, validationSummary],
    ),
  );

  return (
    <div className={clsx(s.turnstileSection)} data-state={status}>
      <div
        ref={widgetRef}
        className={s.turnstileWidget}
        data-rendered={status !== 'bypassed'}
      >
        {status === 'bypassed' ? (
          <span className={s.turnstilePlaceholder}>{copy.preview}</span>
        ) : null}
      </div>
      <input type="hidden" name="token" value={token} />
      {statusMessage ? (
        <p className={s.turnstileStatus}>{statusMessage}</p>
      ) : null}
    </div>
  );
}
