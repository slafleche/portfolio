'use client';
import type { ElementType, ReactNode, HTMLAttributes } from 'react';

import clsx from 'clsx';
import { content as contentClass } from '@/styles/layout.css';
import {
  dataAttributesHelper,
  type DataAttributeMap,
} from '@/lib/dataAttributesHelper';

export type ContentBaseProps = HTMLAttributes<HTMLElement> & {
  tag?: ElementType;
  queryDataAttributes?: DataAttributeMap;
  children?: ReactNode;
};

type ContentProps<T extends ElementType = 'section'> = Omit<
  ContentBaseProps,
  'tag'
> & {
  tag?: T;
};

export default function Content<T extends ElementType = 'section'>({
  className,
  children,
  tag,
  queryDataAttributes = {},
  ...rest
}: ContentProps<T>) {
  const Component: ElementType = tag ?? 'section';

  const dataQueryAttributes = dataAttributesHelper(
    'query',
    queryDataAttributes,
  );

  return (
    <Component
      data-ui="content"
      className={clsx(contentClass, className)}
      {...dataQueryAttributes}
      {...rest}
    >
      {children}
    </Component>
  );
}
