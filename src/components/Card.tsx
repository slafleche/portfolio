import * as s from '@/styles/components/card.css.ts';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Heading, { type IHeadingDepth } from './Heading';
import clsx from 'clsx';
// import * as glassFrameStyles from '@/styles/helpers/glassFrame.css';

type Props = IHeadingDepth &
  Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
    title?: ReactNode | string;
    children?: ReactNode;
    type?: string;
    gradientClassName?: string;
  };

export default function Card({
  title,
  depth = 2,
  className,
  type,
  children,
  gradientClassName,
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
        <div className={s.content}>
          {isStringTitle ? (
            <Heading className={s.title} depth={depth}>
              {title}
            </Heading>
          ) : (
            title
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
