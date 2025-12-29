import clsx from 'clsx';
import * as s from '../styles/glassy.css';

export type GlassyPanelProps = {
  className?: string;
  surfaceClassName?: string;
  shineClassName?: string;
  grainClassName?: string;
  children: React.ReactNode;
};

export function GlassPanel({
  className,
  surfaceClassName,
  shineClassName,
  grainClassName,
  children,
}: GlassyPanelProps) {
  return (
    <div className={clsx(s.root, className)}>
      <div className={s.effects} aria-hidden="true">
        <div className={clsx(surfaceClassName, s.surface)}>
          <div className={clsx(shineClassName, s.shine)}>
            <div className={clsx(grainClassName, s.grain)} />
          </div>
        </div>
      </div>
      <div className={s.content}>{children}</div>
    </div>
  );
}
