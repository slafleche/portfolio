import { createElement } from 'react';
import type { ReactNode } from 'react';

type ConditionalWrapProps = {
  render: boolean;
  tag?: string;
  children: ReactNode;
} & Record<string, unknown>;

export default function ConditionalWrap({
  render,
  tag = 'div',
  children,
  ...rest
}: ConditionalWrapProps) {
  const Tag = tag ?? 'div';
  if (render) {
    return createElement(
      Tag,
      rest as Record<string, unknown>,
      children,
    );
  }
  return <>{children}</>;
}
