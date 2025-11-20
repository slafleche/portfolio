import { useId } from 'react';
import type { ChangeEventHandler } from 'react';
import * as s from '@/styles/components/forms.css';
import type { HoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';

export type HoneypotBlockProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  copy: HoneypotBlockLocale;
  name?: string;
  reveal?: boolean;
};

export function HoneypotBlock({
  value,
  onChange,
  copy,
  name = 'hp',
  reveal = false,
}: HoneypotBlockProps) {
  const inputId = useId();

  return (
    <div
      aria-hidden={!reveal}
      className={reveal ? undefined : s.visuallyHidden}
    >
      <label htmlFor={inputId}>{copy.label}</label>
      <input
        id={inputId}
        name={name}
        type="text"
        tabIndex={reveal ? 0 : -1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
