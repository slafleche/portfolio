import { useId } from 'react';
import * as s from '@/styles/components/forms.css';
import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';

export type HoneypotBlockProps = {
  copy: HoneypotBlockLocale;
  name?: string;
};

export function HoneypotBlock({
  copy,
  name = 'hp',
}: HoneypotBlockProps) {
  const inputId = useId();

  return (
    <div aria-hidden className={s.visuallyHidden}>
      <label htmlFor={inputId}>{copy.label}</label>
      <input
        id={inputId}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
