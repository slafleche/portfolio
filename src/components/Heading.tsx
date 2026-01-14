import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import {
  isLocaleRichText,
  sanitizeLocaleRichText,
} from '@/lib/stringUtils';

export interface IHeadingDepth {
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
}

type HeadingProps = {
  className?: string;
  ignoreDataUI?: boolean;
} & IHeadingDepth &
  ComponentPropsWithoutRef<'h2'> & {
    children: ReactNode;
  };

export default function Heading({
  depth = 3,
  ignoreDataUI = false,
  className,
  children,
  id,
  ...rest
}: HeadingProps) {
  const Tag = `h${depth || 2}` as 'h2';
  return (
    <Tag
      id={id}
      className={className}
      data-ui={ignoreDataUI ? undefined : 'heading'}
      {...rest}
    >
      {typeof children === 'string' && isLocaleRichText(children)
        ? (() => {
            const safe = sanitizeLocaleRichText(children);
            if (!safe) return children;
            return (
              <span
                dangerouslySetInnerHTML={{
                  __html: safe,
                }}
              />
            );
          })()
        : children}
    </Tag>
  );
}
