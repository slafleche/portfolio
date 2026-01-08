import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import * as s from '@/styles/components/card.css.ts';

import Heading, { type IHeadingDepth } from './Heading';
// import * as glassFrameStyles from '@/styles/helpers/glassFrame.css';

type Props = IHeadingDepth &
  Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
    title?: ReactNode | string;
    children?: ReactNode;
    type?: string;
    gradientClassName?: string;
    logoAsBg?: ReactNode;
  };

export default function Card({
  title,
  depth = 2,
  className,
  type,
  children,
  gradientClassName,
  logoAsBg,
  ...rest
}: Props) {
  const isStringTitle = typeof title === 'string';

  return (
    <div
      className={clsx(s.root, className)}
      data-type={type}
      {...rest}
    >
      {gradientClassName && (
        <div
          className={clsx(s.gradient, gradientClassName)}
          aria-hidden="true"
        />
      )}

      <div className={s.frame}>
        <div className={clsx(s.logoBox, gradientClassName)}>
          {isStringTitle ? (
            <Heading className={s.title} depth={depth}>
              {title}
            </Heading>
          ) : (
            title
          )}
        </div>
        <div className={s.content}>
          {logoAsBg && (
            <div className={s.logoAsBg} aria-hidden="true">
              {logoAsBg}
            </div>
          )}
          <div className={s.panel}>
            <div className={s.spacer} />
            <div className={s.text}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
