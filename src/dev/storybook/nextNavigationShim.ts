type MatchMediaFn = typeof window.matchMedia;

const getGlobalPathname = (): string | null => {
  const value = (globalThis as unknown as Record<string, unknown>)
    .__STORYBOOK_PATHNAME__;
  return typeof value === 'string' ? value : null;
};

export const usePathname = (): string => {
  return (
    getGlobalPathname() ??
    (typeof window !== 'undefined' ? window.location.pathname : '/')
  );
};

export const __setStorybookPathname = (pathname: string) => {
  (globalThis as unknown as Record<string, unknown>).__STORYBOOK_PATHNAME__ =
    pathname;
};

export const __forceReducedMotion = () => {
  if (typeof window === 'undefined') return () => {};
  const originalMatchMedia: MatchMediaFn = window.matchMedia.bind(window);

  window.matchMedia = ((query: string) => {
    if (query.includes('prefers-reduced-motion')) {
      const mql: MediaQueryList = {
        media: query,
        matches: true,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      };
      return mql;
    }
    return originalMatchMedia(query);
  }) as MatchMediaFn;

  return () => {
    window.matchMedia = originalMatchMedia;
  };
};

