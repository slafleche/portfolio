import clsx from 'clsx';
import * as s from '../styles/glassy.css';

export type GlassyPanelProps = {
  className?: string;
  contentClassName?: string;
  surfaceClassName?: string;
  surfaceClassNameOverride?: string;
  shineClassName?: string;
  grainClassName?: string;
  opacity?: number;
  children: React.ReactNode;
};

export function GlassPanel({
  className,
  contentClassName,
  surfaceClassName,
  grainClassName,
  surfaceClassNameOverride,
  children,
}: GlassyPanelProps) {
  return (
    <div className={clsx(s.root, className)}>
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
