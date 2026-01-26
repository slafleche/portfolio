import { clsx } from 'clsx';
import type { ElementType, ReactNode } from 'react';

import { headingDecoration } from '@/styles/typography.css';

import Heading from '../Heading';
import Content, { type ContentBaseProps } from './Content';

export type ContentWithTitleBaseProps = Omit<
  ContentBaseProps,
  'title'
> & {
  title?: ReactNode;
  ignoreDataUI?: boolean;
  skipSectionMargin?: boolean;
  showDecoration?: boolean;
  headingDepth?: 2 | 3 | 4 | 5 | 6;
  titleOutside?: boolean;
  titleClassName?: string;
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
    title,
    ignoreDataUI = true,
    headingDepth = 2,
    children,
    tag,
    className,
    skipSectionMargin,
    queryDataAttributes,
    showDecoration,
    titleOutside = false,
    titleClassName = false,
    id,
    ...rest
  } = props;

  return (
    <>
      {title && titleOutside ? (
        <Heading
          id={id}
          ignoreDataUI={ignoreDataUI}
          depth={headingDepth}
          className={clsx(titleClassName, {
            [headingDecoration]: showDecoration,
          })}
        >
          {title}
        </Heading>
      ) : null}
      <Content
        id={!titleOutside ? id : undefined}
        aria-labelledby={
          titleOutside && typeof id === 'string' ? id : undefined
        }
        tag={tag}
        className={className}
        data-margin={skipSectionMargin ? 'skip' : undefined}
        queryDataAttributes={queryDataAttributes}
        {...rest}
      >
        {title && !titleOutside ? (
          <Heading
            ignoreDataUI={ignoreDataUI}
            depth={headingDepth}
            className={clsx(titleClassName, {
              [headingDecoration]: showDecoration,
            })}
          >
            {title}
          </Heading>
        ) : null}
        {children}
      </Content>
    </>
  );
}
