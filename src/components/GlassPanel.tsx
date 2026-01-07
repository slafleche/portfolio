import clsx from 'clsx';

import * as s from '../styles/glassy.css';

export type GlassyPanelProps =
  React.ComponentPropsWithoutRef<'div'> & {
  contentClassName?: string;
  surfaceClassName?: string;
  surfaceClassNameOverride?: string;
  shineClassName?: string;
  grainClassName?: string;
  opacity?: number;
};

export function GlassPanel({
  className,
  contentClassName,
  surfaceClassName,
  grainClassName,
  surfaceClassNameOverride,
  children,
  ...rest
}: GlassyPanelProps) {
  return (
    <div className={clsx(s.root, className)} {...rest}>
      <div
        className={clsx(
          surfaceClassName,
          surfaceClassNameOverride ?? s.surface,
        )}
      >
        <div className={clsx(grainClassName, s.grain)} />
        <div className={clsx(contentClassName, s.content)}>
          {children}
        </div>
      </div>
    </div>
  );
}
