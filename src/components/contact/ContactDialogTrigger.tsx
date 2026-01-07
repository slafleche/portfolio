'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useCallback } from 'react';

import { useContactDialog } from './ContactDialogProvider';

type ContactDialogTriggerProps =
  ComponentPropsWithoutRef<'button'> & {
    onOpen?: () => void;
  };

const ContactDialogTrigger = forwardRef<
  HTMLButtonElement,
  ContactDialogTriggerProps
>((props, forwardedRef) => {
  const { open } = useContactDialog();
  const { onClick, onOpen, type, ...rest } = props;
  const resolvedType = type ?? 'button';

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      }
      if (event.defaultPrevented) return;
      if (onOpen) {
        onOpen();
      }
      open();
    },
    [
      onClick,
      onOpen,
      open,
    ],
  );

  return (
    <button
      {...rest}
      ref={forwardedRef}
      type={resolvedType}
      onClick={handleClick}
    />
  );
});

ContactDialogTrigger.displayName = 'ContactDialogTrigger';

export default ContactDialogTrigger;
