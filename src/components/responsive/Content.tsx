'use client';
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';

import clsx from 'clsx';
import { content as contentClass } from '@/styles/layout.css';
import Heading from '../Heading';
import { userContent } from '@/styles/typography.css';
import { Markdown } from '@/components/Markdown';
import { notRelease } from '@/lib/runtimeEnv';

type BaseProps<T extends ElementType> = {
  tag?: T;
  title?: ReactNode;
  ignoreDataUI?: boolean;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

type MarkdownOnly = {
  markdown: string;
  children?: never;
};

type ChildrenOnly = {
  markdown?: undefined;
  children?: ReactNode;
};

type ContentProps<T extends ElementType> = BaseProps<T> &
  (MarkdownOnly | ChildrenOnly);

export default function Content<T extends ElementType = 'section'>({
  tag,
  title,
  headingDepth: headingDepthProp,
  className,
  markdown,
  ignoreDataUI = false,
  children,
  ...rest
}: ContentProps<T>) {
  const Component: ElementType = tag ?? 'section';

  if (
    notRelease() &&
    typeof markdown === 'string' &&
    children !== undefined
  ) {
    console.error(
      'Content: pass either `markdown` or `children`, but not both.',
    );
  }

  const renderedBody =
    typeof markdown === 'string' ? (
      <Markdown source={markdown} className={userContent} />
    ) : (
      children
    );

  return (
    <Component
      data-ui="content"
      className={clsx(contentClass, className)}
      {...rest}
    >
      {title ? (
        <Heading
          ignoreDataUI={ignoreDataUI}
          depth={headingDepthProp ?? 2}
        >
          {title}
        </Heading>
      ) : null}
      {renderedBody}
    </Component>
  );
}
