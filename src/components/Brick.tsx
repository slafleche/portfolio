import clsx from 'clsx';
import type {
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react';

import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/brick.css.ts';

import Heading from './Heading';

export type BrickData = {
  title: ReactNode | string;
  body: string;
  iconAsBg?: ReactNode;
};

type Props = Omit<ComponentPropsWithoutRef<'article'>, 'title'> &
  BrickData;

export default function Brick({
  title,
  body,
  iconAsBg,
  className,
  ...rest
}: Props) {
  const isStringTitle = typeof title === 'string';

  return (
    <article className={clsx(s.root, className)} {...rest}>
      {iconAsBg && (
        <div className={s.iconAsBg} aria-hidden="true">
          {iconAsBg}
        </div>
      )}
      <div className={s.content}>
        {isStringTitle ? (
          <Heading className={s.title} depth={3}>
            {title}
          </Heading>
        ) : (
          title
        )}
        <div aria-hidden={true} className={s.separator} />
        <Markdown className={s.body} source={body} />
      </div>
    </article>
  );
}
