'use client';
import type { ElementType, ReactNode } from 'react';
import Content, { type ContentProps } from './Content';
import Heading from '../Heading';

type ContentWithTitleProps<T extends ElementType> = ContentProps<T> & {
  title?: ReactNode;
  ignoreDataUI?: boolean;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
};

type ContentWithTitleRestProps<T extends ElementType> = Omit<
  ContentWithTitleProps<T>,
  'title' | 'ignoreDataUI' | 'headingDepth' | 'children'
>;

export default function ContentWithTitle<
  T extends ElementType = 'section',
>(props: ContentWithTitleProps<T>) {
  const {
    title,
    ignoreDataUI = false,
    headingDepth = 2,
    children,
    ...rest
  } = props;
  const contentProps: ContentWithTitleRestProps<T> = rest;

  return (
    <Content<T> {...contentProps}>
      {title ? (
        <Heading ignoreDataUI={ignoreDataUI} depth={headingDepth}>
          {title}
        </Heading>
      ) : null}
      {children}
    </Content>
  );
}
