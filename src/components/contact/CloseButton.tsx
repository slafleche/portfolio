import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import CloseIcon from '@/components/icons/CloseIcon';

type BaseProps = {
  label: string;
  iconClassName?: string;
  closeOverlayClassName?: string;
};

type CloseButtonProps = BaseProps &
  ComponentPropsWithoutRef<'button'>;

export const CloseButton = forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(
  (
    {
      label,
      className,
      iconClassName,
      closeOverlayClassName,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    return (
      <button ref={ref} type={type} className={className} {...rest}>
        <CloseIcon label={label} className={iconClassName} />
        {closeOverlayClassName && (
          <div className={closeOverlayClassName} />
        )}
      </button>
    );
  },
);

CloseButton.displayName = 'CloseButton';
