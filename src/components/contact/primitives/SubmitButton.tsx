import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as s from '@/styles/components/forms.css';

type SubmitButtonProps = ComponentPropsWithoutRef<'button'>;

export const SubmitButton = forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>(({ className, children, type = 'submit', ...props }, ref) => (
  <button
    {...props}
    ref={ref}
    type={type}
    className={clsx(s.submitButton, className)}
  >
    {children}
  </button>
));
SubmitButton.displayName = 'SubmitButton';
