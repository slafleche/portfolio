import type { ComponentPropsWithoutRef } from 'react';

export type AbbrProps = ComponentPropsWithoutRef<'abbr'> & {
  label: string;
  definition: string;
  className?: string;
};

export function Abbr({
  label,
  definition,
  className,
  ...abbrProps
}: AbbrProps) {
  return (
    <abbr {...abbrProps} title={definition} className={className}>
      {label}
    </abbr>
  );
}
