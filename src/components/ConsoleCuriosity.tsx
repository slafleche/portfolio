'use client';

import { useEffect } from 'react';

type ConsoleCuriosityProps = {
  test: string;
  result: string;
  hint: string;
  targetHref: string;
};

declare global {
  interface Window {
    curiosity?: () => void;
    curiosite?: () => void;
    __curiosityLogged?: boolean;
  }
}

export default function ConsoleCuriosity({
  test,
  result,
  hint,
  targetHref,
}: ConsoleCuriosityProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window;
    const logOnce = () => {
      if (!w.__curiosityLogged && w.location.pathname !== targetHref) {
        console.log(test);
        console.log(result);
        console.log(hint);
        w.__curiosityLogged = true;
      }
    };
    logOnce();
    const navigatorFn = () => {
      try {
        w.location.href = targetHref;
      } catch (err) {
        console.error(
          'Navigation to',
          targetHref,
          'was blocked or failed. Please open the page manually.',
          err,
        );
      }
    };
    w.curiosity = navigatorFn;
    w.curiosite = navigatorFn;
    return () => {
      if (w.curiosity === navigatorFn) {
        delete w.curiosity;
      }
      if (w.curiosite === navigatorFn) {
        delete w.curiosite;
      }
    };
  }, [
    test,
    result,
    hint,
    targetHref,
  ]);

  return null;
}
