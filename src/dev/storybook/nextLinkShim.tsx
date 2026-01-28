import type { ReactNode } from 'react';

type LinkHref =
  | string
  | {
      pathname?: string;
      toString?: () => string;
    };

type NextLinkProps = {
  href: LinkHref;
  children?: ReactNode;
  prefetch?: boolean;
} & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'children'
>;

const toHrefString = (href: LinkHref): string => {
  if (typeof href === 'string') return href;
  if (typeof href?.toString === 'function') return href.toString();
  return href?.pathname ?? '#';
};

export default function Link({
  href,
  children,
  prefetch: _prefetch,
  ...rest
}: NextLinkProps) {
  return (
    <a href={toHrefString(href)} {...rest}>
      {children}
    </a>
  );
}

