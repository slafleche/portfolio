import { useEffect, useId, useRef } from 'react';

import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';

export type HoneypotBlockProps = {
  copy: HoneypotBlockLocale;
  logInputs?: boolean;
  name?: string;
};

export function HoneypotBlock({
  copy,
  logInputs = false,
  name = 'hp',
}: HoneypotBlockProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasLoggedInitRef = useRef(false);

  useEffect(() => {
    if (!logInputs || hasLoggedInitRef.current) return;
    console.info('[contact][debug][honeypot][init]', {
      value: inputRef.current?.value ?? '',
    });
    hasLoggedInitRef.current = true;
  }, [
    logInputs,
  ]);

  return (
    <div aria-hidden data-visible="sc-only">
      <label htmlFor={inputId}>{copy.label}</label>
      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        onChange={(event) => {
          if (!logInputs) return;
          console.info('[contact][debug][honeypot][change]', {
            value: event.currentTarget.value,
          });
        }}
      />
    </div>
  );
}
