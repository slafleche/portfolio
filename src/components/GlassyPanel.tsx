import clsx, { type ClassValue } from 'clsx';
import type { PropsWithChildren } from 'react';
import * as glassSurfaceStyles from '@/styles/glassy.css';
import * as glassFrameStyles from '@/styles/helpers/glassFrame.css';

export type GlassyPanelProps = PropsWithChildren<{
  className?: string;
  surfaceClassName?: ClassValue;
  contentClassName?: ClassValue;
  type?: string;
}>;

export default function GlassyPanel({
  className,
  surfaceClassName,
  contentClassName,
  type,
  children,
}: GlassyPanelProps) {
  return (
    <div
      className={clsx(glassFrameStyles.frame, className)}
      data-type={type}
    >
      <div
        className={clsx(glassSurfaceStyles.surface, surfaceClassName)}
      >
        {/* Grain */}
        <div className={glassSurfaceStyles.grain} aria-hidden />
        {/* Fill, inside */}
        <div className={glassSurfaceStyles.surfaceFill} aria-hidden />
        {/* Shine in corner */}
        <div className={glassFrameStyles.surfaceBorder} aria-hidden />
        {/* Gradient overlay */}
        <div
          className={glassSurfaceStyles.surfaceShine}
          aria-hidden
        />
        <div
          className={clsx(
            glassSurfaceStyles.content,
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
