import { useId } from 'react';
import type { ChangeEventHandler } from 'react';
import * as s from '@/styles/components/forms.css';
import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';

export type HoneypotBlockProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  copy: HoneypotBlockLocale;
  name?: string;
};

export function HoneypotBlock({
  value,
  onChange,
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
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
