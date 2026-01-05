'use client';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';

import clsx from 'clsx';
import { content as contentClass } from '@/styles/layout.css';
import {
  dataAttributesHelper,
  type DataAttributeMap,
} from '@/lib/dataAttributesHelper';

type BaseProps<T extends ElementType> = {
  tag?: T;
  className?: string;
  queryDataAttributes?: DataAttributeMap;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

export type ContentProps<T extends ElementType> = BaseProps<T> & {
  children?: ReactNode;
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
