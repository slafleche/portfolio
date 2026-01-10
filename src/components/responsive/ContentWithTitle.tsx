import { clsx } from 'clsx';
import type { ElementType, ReactNode } from 'react';

import { headingDecoration } from '@/styles/typography.css';

import Heading from '../Heading';
import Content, { type ContentBaseProps } from './Content';

export type ContentWithTitleBaseProps = ContentBaseProps & {
  contentTitle?: ReactNode;
  ignoreDataUI?: boolean;
  skipSectionMargin?: boolean;
  showDecoration?: boolean;
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
    skipSectionMargin,
    queryDataAttributes,
    showDecoration,
    ...rest
  } = props;

  return (
    <Content
      tag={tag}
      className={className}
      data-margin={skipSectionMargin ? 'skip' : undefined}
      queryDataAttributes={queryDataAttributes}
      {...rest}
    >
      {contentTitle ? (
        <Heading
          ignoreDataUI={ignoreDataUI}
          depth={headingDepth}
          className={clsx({ [headingDecoration]: showDecoration })}
        >
          {contentTitle}
        </Heading>
      ) : null}
      {children}
    </Content>
  );
}
