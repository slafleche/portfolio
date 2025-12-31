'use client'; // if using Next.js App Router

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface WindowSizeContextType {
  width: number | null;
  height: number | null;
  layoutTick: number;
}

const WindowSizeContext = createContext<
  WindowSizeContextType | undefined
>(undefined);

const getViewportSize = (): Omit<
  WindowSizeContextType,
  'layoutTick'
> => {
  if (typeof window === 'undefined') {
    return {
      width: null,
      height: null,
    };
  }
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
};

export function WindowSizeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    size,
    setSize,
  ] = useState<WindowSizeContextType>(() => ({
    ...getViewportSize(),
    layoutTick: 0,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize((prev) => ({
        ...getViewportSize(),
        layoutTick: prev.layoutTick + 1,
      }));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      updateSize();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('focus', updateSize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('focus', updateSize);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, []);

  return (
    <WindowSizeContext.Provider value={size}>
      {children}
    </WindowSizeContext.Provider>
  );
}

export function useWindowSize() {
  const ctx = useContext(WindowSizeContext);
  if (ctx === undefined) {
    throw new Error(
      'useWindowSize must be used within a WindowSizeProvider',
    );
  }
  return ctx;
}
