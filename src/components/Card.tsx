import * as s from '@/styles/components/card.css.ts';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Heading, { type IHeadingDepth } from './Heading';
import clsx from 'clsx';
import * as glassFrameStyles from '@/styles/helpers/glassFrame.css';

type Props = IHeadingDepth &
  Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
    title?: ReactNode | string;
    children?: ReactNode;
    type?: string;
  };

export default function Card({
  title,
  depth = 2,
  className,
  type,
  children,
  ...rest
}: Props) {
  const gradientClass =
    type === 'right' ? s.cardGradientB : s.cardGradientA;

  const isStringTitle = typeof title === 'string';

  return (
    <div
      className={clsx(s.root, className)}
      data-type={type}
      {...rest}
    >
      <div className={clsx(glassFrameStyles.frame, s.frame)}>
        <div
          className={clsx(s.gradient, gradientClass)}
          aria-hidden
        />
        <div className={glassFrameStyles.surfaceBorder} aria-hidden />
        <div className={glassFrameStyles.rim} aria-hidden />
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
