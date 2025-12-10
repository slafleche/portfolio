import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type SkipNavContentProps = ComponentPropsWithoutRef<'div'> & {
  id?: string;
  children: ReactNode;
};

export function SkipNavContent({
  id = 'body',
  children,
  tabIndex = -1,
  ...rest
}: SkipNavContentProps) {
  return (
    <div id={id} tabIndex={tabIndex} {...rest}>
      {children}
    </div>
  );
}
