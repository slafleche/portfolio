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
  grainClassName,
  children,
}: GlassyPanelProps) {
  return (
    <div className={clsx(s.root, className)}>
      <div className={clsx(surfaceClassName, s.surface)}>
        <div className={clsx(grainClassName, s.grain)} />
        <div className={s.content}>
        {children}
        </div>
      </div>
    </div>
  );
}
