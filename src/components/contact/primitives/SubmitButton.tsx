import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as s from '@/styles/components/forms.css';

import {
  glassLinkShine,
  glassyButtonHover,
} from '../../../styles/components/glassyButtons.css';

type SubmitButtonProps = ComponentPropsWithoutRef<'button'>;

export const SubmitButton = forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>(({ className, children, type = 'submit', ...props }, ref) => (
  <button
    {...props}
    ref={ref}
    type={type}
    className={clsx(s.submitButton, glassyButtonHover, className)}
  >
    <div className={s.submitInner}>{children}</div>
    <div className={s.shineWrapper} aria-hidden="true">
      <div className={glassLinkShine} />
    </div>
  </button>
));
SubmitButton.displayName = 'SubmitButton';
