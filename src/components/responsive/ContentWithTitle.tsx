'use client';
import type { ElementType, ReactNode } from 'react';
import Content, { type ContentBaseProps } from './Content';
import Heading from '../Heading';

export type ContentWithTitleBaseProps = ContentBaseProps & {
  contentTitle?: ReactNode;
  ignoreDataUI?: boolean;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
};

type ContentWithTitleProps<T extends ElementType = 'section'> = Omit<
  ContentWithTitleBaseProps,
  'tag'
> & {
  tag?: T;
};

export default function ContentWithTitle<
  T extends ElementType = 'section',
>(props: ContentWithTitleProps<T>) {
  const {
    contentTitle,
    ignoreDataUI = false,
    headingDepth = 2,
    children,
    tag,
    className,
    queryDataAttributes,
    ...rest
  } = props;

  return (
    <Content
      tag={tag}
      className={className}
      queryDataAttributes={queryDataAttributes}
      {...rest}
    >
      {contentTitle ? (
        <Heading ignoreDataUI={ignoreDataUI} depth={headingDepth}>
          {contentTitle}
        </Heading>
      ) : null}
      {children}
    </Content>
  );
}
