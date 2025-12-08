import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';

type TextInputProps = ComponentPropsWithoutRef<'input'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      className={clsx(s.input, className)}
      data-input="text"
    />
  ),
);
TextInput.displayName = 'TextInput';
