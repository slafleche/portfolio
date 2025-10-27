'use client';

import { useEffect } from 'react';

type ConsoleCuriosityProps = {
  title: string;
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
    __curiositySignature?: string;
  }
}

export default function ConsoleCuriosity({
  title,
  test,
  result,
  hint,
  targetHref,
}: ConsoleCuriosityProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window;

    // Split "[tag] rest" → { tag, rest }
    const parseTagged = (msg: string) => {
      const m = msg.match(/^\s*(\[[^\]]+\])\s*(.*)$/);
      if (!m) return { tag: '', rest: msg };
      return { tag: m[1], rest: m[2] };
    };

    // Styles (transparent badges; neutral text that works in light/dark)
    const baseBadge =
      'font-family:ui-monospace, SFMono-Regular, Menlo, monospace; padding:0 4px; border-radius:8px; font-weight:600;';
    const baseText = ''; // allow console theme to control main text color
    const bannerText = 'font-weight:600; font-size:12.5px;'; // larger remainder for first line

    // Tag colors only (no backgrounds)
    const badgeGrey = baseBadge + 'color:#9ca3af;'; // [test]
    const badgeGreen = baseBadge + 'color:#22c55e;'; // [result]
    const badgeHint = baseBadge + 'color:#a78bfa;'; // [hint]

    const logBadgeLine = (
      raw: string,
      mode: 'test' | 'result' | 'hint',
      banner = false,
    ) => {
      const { tag, rest } = parseTagged(raw);
      const badgeStyle =
        mode === 'test'
          ? badgeGrey
          : mode === 'result'
            ? badgeGreen
            : badgeHint;
      const textStyle = (banner ? bannerText : baseText) || '';
      if (tag) {
        // "%c[tag]%c rest"
        console.log(`%c${tag}%c ${rest}`, badgeStyle, textStyle);
      } else {
        console.log(`%c${raw}`, textStyle);
      }
    };

    const signature = `${title}|${test}|${result}|${hint}|${targetHref}`;
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

    const shouldLog =
      w.location.pathname !== targetHref &&
      w.__curiositySignature !== signature;
    if (shouldLog) {
      if (typeof console.groupCollapsed === 'function') {
        console.groupCollapsed(title);
        logBadgeLine(test, 'test', true);
        logBadgeLine(result, 'result');
        logBadgeLine(hint, 'hint');
        console.groupEnd();
      } else {
        logBadgeLine(test, 'test', true);
        logBadgeLine(result, 'result');
        logBadgeLine(hint, 'hint');
      }
      w.__curiosityLogged = true;
      w.__curiositySignature = signature;
    }

    w.curiosity = navigatorFn;
    w.curiosite = navigatorFn;

    return () => {
      if (w.curiosity === navigatorFn) delete w.curiosity;
      if (w.curiosite === navigatorFn) delete w.curiosite;
    };
  }, [
    title,
    test,
    result,
    hint,
    targetHref,
  ]);

  return null;
}
