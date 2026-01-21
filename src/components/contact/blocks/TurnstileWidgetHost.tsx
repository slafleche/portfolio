import { memo, useEffect, useRef } from 'react';

export type TurnstileWidgetSize = 'compact' | 'normal';

type ExtendedWindow = Window & { turnstile?: Window['turnstile'] };

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

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

export type TurnstileWidgetHostProps = {
  siteKey: string;
  size: TurnstileWidgetSize;
  onLoading?: () => void;
  onReady?: () => void;
  onToken: (token: string) => void;
  onExpired: () => void;
  onError: (errorCode?: string | number) => void;
};

export const TurnstileWidgetHost = memo(function TurnstileWidgetHost({
  siteKey,
  size,
  onLoading,
  onReady,
  onToken,
  onExpired,
  onError,
}: TurnstileWidgetHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const mountWidget = async () => {
      try {
        onLoading?.();
        await loadTurnstileScript();
        if (cancelled) return;

        const extendedWindow = window as ExtendedWindow;
        const turnstileApi = extendedWindow.turnstile;
        if (!turnstileApi || !container) {
          onError('unavailable');
          return;
        }

        if (widgetIdRef.current) {
          return;
        }

        if (container.childNodes.length > 0) {
          container.replaceChildren();
        }

        const widgetId = turnstileApi.render(container, {
          sitekey: siteKey,
          size,
          callback: (token: string) => {
            if (cancelled) return;
            onToken(token);
          },
          'expired-callback': () => {
            if (cancelled) return;
            onExpired();
          },
          'error-callback': (errorCode?: string | number) => {
            if (cancelled) return;
            onError(errorCode);
          },
        });

        widgetIdRef.current = widgetId;
        onReady?.();
      } catch {
        if (!cancelled) {
          onError('load_failed');
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
      container?.replaceChildren();
      widgetIdRef.current = null;
    };
  }, [
    onError,
    onExpired,
    onLoading,
    onReady,
    onToken,
    siteKey,
    size,
  ]);

  return <div ref={containerRef} />;
});
