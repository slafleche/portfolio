type TurnstileApiOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  'unsupported-callback'?: () => void;
  // Allow extra options (theme, appearance, etc.) without typing them all.
  [key: string]: unknown;
};

type ExtendedWindow = Window;

type TurnstileHarnessMode = 'autoVerify' | 'manual';

type TurnstileSiteKeyVariant =
  | 'alwaysPass'
  | 'alwaysBlock'
  | 'forceChallenge';

const CLOUDFLARE_TEST_SITE_KEYS: Record<
  TurnstileSiteKeyVariant,
  string
> = {
  alwaysPass: '1x00000000000000000000AA',
  alwaysBlock: '2x00000000000000000000AB',
  forceChallenge: '3x00000000000000000000FF',
};

const CLOUDFLARE_TEST_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

export type TurnstileHarnessOptions = {
  mode?: TurnstileHarnessMode;
  siteKeyVariant?: TurnstileSiteKeyVariant;
};

type EnvHarness = {
  installEnvOverrides: (
    overrides: Record<string, string>,
  ) => () => void;
  getRuntimeEnv: () => {
    nodeEnv: string;
  };
};

  const envHarness: EnvHarness = {
    // Import at runtime to avoid coupling tests to module resolution ordering.
    installEnvOverrides: (overrides) => {
      const { installEnvOverrides } = require('../../helpers/runtimeEnvHarness') as {
        installEnvOverrides: (
          overrides: Record<string, string>,
      ) => () => void;
      };
      return installEnvOverrides(overrides);
    },
    getRuntimeEnv: () => {
      const { getRuntimeEnv } = require('../../helpers/runtimeEnvHarness') as {
        getRuntimeEnv: () => {
          nodeEnv: string;
      };
    };
    return getRuntimeEnv();
  },
};

export type TurnstileHarnessController = {
  /**
   * Simulate the user successfully completing the Turnstile
   * challenge. Calls the configured callback with a dummy token.
   */
  verify: () => void;
  /**
   * Simulate the token expiring after having been valid. Calls the
   * configured expired-callback.
   */
  expire: () => void;
  /**
   * Simulate Turnstile reporting a non-catastrophic error via
   * error-callback.
   */
  fail: () => void;
  /**
   * Access the last options object TurnstileBlock passed to render,
   * for assertions in tests (for example, checking sitekey).
   */
  getLastOptions: () => TurnstileApiOptions | null;
  /**
   * Access the last container element the widget was rendered into,
   * for “exactly one widget rendered” style assertions.
   */
  getLastWidgetContainer: () => HTMLElement | null;
  /**
   * Restore NEXT_PUBLIC_TURNSTILE_SITE_KEY and window.turnstile to
   * their original values.
   */
  restore: () => void;
};

export function enableTurnstileHarness(
  options: TurnstileHarnessOptions = {},
): TurnstileHarnessController {
  const mode: TurnstileHarnessMode = options.mode ?? 'autoVerify';
  const siteKeyVariant: TurnstileSiteKeyVariant =
    options.siteKeyVariant ?? 'alwaysPass';

  const hasWindow = typeof window !== 'undefined';

  const {
    nodeEnv,
  } = envHarness.getRuntimeEnv();

  let originalTurnstile: Window['turnstile'] | undefined;
  let restoreEnv: (() => void) | null = null;

  let lastOptions: TurnstileApiOptions | null = null;
  let lastContainer: HTMLElement | null = null;
  let widgetCount = 0;

  if (hasWindow) {
    const extendedWindow = window as ExtendedWindow;
    originalTurnstile = extendedWindow.turnstile;

    restoreEnv = envHarness.installEnvOverrides({
      NEXT_PUBLIC_TURNSTILE_SITE_KEY:
        CLOUDFLARE_TEST_SITE_KEYS[siteKeyVariant],
    });

    const mockTurnstile: NonNullable<Window['turnstile']> = {
      render: (container, renderOptions) => {
        lastOptions = renderOptions;
        lastContainer =
          typeof container === 'string'
            ? (document.querySelector(container) as HTMLElement | null)
            : container;

        widgetCount += 1;

        if (lastContainer) {
          const marker = document.createElement('div');
          marker.dataset.testid = 'turnstile-instance';
          lastContainer.appendChild(marker);
        }

        if (
          mode === 'autoVerify' &&
          nodeEnv !== 'production' &&
          typeof renderOptions.callback === 'function'
        ) {
          renderOptions.callback(CLOUDFLARE_TEST_TOKEN);
        }

        return `harness-widget-${widgetCount}`;
      },
      reset: () => {
        // No-op for tests; TurnstileBlock already calls reset on unmount.
      },
    };

    extendedWindow.turnstile = mockTurnstile;
  }

  const verify = () => {
    if (lastOptions && typeof lastOptions.callback === 'function') {
      lastOptions.callback(CLOUDFLARE_TEST_TOKEN);
    }
  };

  const expire = () => {
    if (
      lastOptions &&
      typeof lastOptions['expired-callback'] === 'function'
    ) {
      lastOptions['expired-callback']();
    }
  };

  const fail = () => {
    if (
      lastOptions &&
      typeof lastOptions['error-callback'] === 'function'
    ) {
      lastOptions['error-callback']();
    }
  };

  const getLastOptions = () => lastOptions;
  const getLastWidgetContainer = () => lastContainer;

  const restore = () => {
    if (restoreEnv) {
      restoreEnv();
    }

    if (!hasWindow) return;

    const extendedWindow = window as ExtendedWindow;

    if (typeof originalTurnstile === 'undefined') {
      delete extendedWindow.turnstile;
    } else {
      extendedWindow.turnstile = originalTurnstile;
    }
  };

  return {
    verify,
    expire,
    fail,
    getLastOptions,
    getLastWidgetContainer,
    restore,
  };
}
