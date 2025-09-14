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
}

const WindowSizeContext = createContext<WindowSizeContextType | undefined>(
  undefined,
);

export function WindowSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<WindowSizeContextType>({
    width: null,
    height: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    handleResize(); // set initial
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
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
    throw new Error('useWindowSize must be used within a WindowSizeProvider');
  }
  return ctx;
}
