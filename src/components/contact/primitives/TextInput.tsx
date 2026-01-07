import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as s from '@/styles/components/forms.css';

type TextInputProps = ComponentPropsWithoutRef<'input'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, disabled, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      className={clsx(s.input, className)}
      data-input="text"
      disabled={disabled}
      data-disabled={!!disabled}
    />
  ),
);
TextInput.displayName = 'TextInput';
