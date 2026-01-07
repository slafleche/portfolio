import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import CloseIcon from '@/components/icons/CloseIcon';

type BaseProps = {
  label: string;
  iconClassName?: string;
};

type CloseButtonProps = BaseProps &
  ComponentPropsWithoutRef<'button'>;

export const CloseButton = forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(
  (
    { label, className, iconClassName, type = 'button', ...rest },
    ref,
  ) => {
    return (
      <button ref={ref} type={type} className={className} {...rest}>
        <CloseIcon label={label} className={iconClassName} />
      </button>
    );
  },
);

CloseButton.displayName = 'CloseButton';
