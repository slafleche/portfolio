'use client';
import clsx from 'clsx';
import type { ElementType, HTMLAttributes,ReactNode } from 'react';

import {
  type DataAttributeMap,
  dataAttributesHelper,
} from '@/lib/dataAttributesHelper';
import { content as contentClass } from '@/styles/layout.css';

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
