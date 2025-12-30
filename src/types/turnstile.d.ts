declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string | number) => void;
          'expired-callback'?: () => void;
          'unsupported-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export {};
