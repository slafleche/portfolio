import { useEffect, useState } from 'react';

type BasePulseLoaderProps = {
  speedMs?: number;
  className?: string;
  /**
   * Thickness of the rings as a fraction of the logical icon width
   * (viewBox), for example 0.08 ≈ 2px on a 24px icon.
   */
  thicknessRatio?: number;
  /**
   * When true (default), the loader will disable its SVG animation
   * for users who prefer reduced motion.
   */
  respectReducedMotion?: boolean;
  /**
   * Explicit override for animation. When set, this wins over
   * `respectReducedMotion`.
   */
  animated?: boolean;
};

type PulseLoaderDecorativeProps = BasePulseLoaderProps & {
  ariaHidden?: true;
  title?: string;
  ariaLabel?: undefined;
};

type PulseLoaderInformativeWithTitleProps = BasePulseLoaderProps & {
  ariaHidden: false;
  title: string;
  ariaLabel?: string;
};

type PulseLoaderInformativeWithAriaLabelProps =
  BasePulseLoaderProps & {
    ariaHidden: false;
    ariaLabel: string;
    title?: string;
  };

export type PulseLoaderProps =
  | PulseLoaderDecorativeProps
  | PulseLoaderInformativeWithTitleProps
  | PulseLoaderInformativeWithAriaLabelProps;

function usePrefersReducedMotion(): boolean {
  const [
    prefersReduced,
    setPrefersReduced,
  ] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const handleChange = () => {
      setPrefersReduced(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReduced;
}

export default function PulseLoader(props: PulseLoaderProps) {
  const {
    speedMs = 2400,
    thicknessRatio,
    ariaHidden = true,
    title,
    ariaLabel,
  } = props;
  const durSeconds = speedMs / 1000;
  const dur = `${durSeconds}s`;
  const offset1 = `${durSeconds / 6}s`;
  const offset2 = `${(durSeconds * 2) / 6}s`;
  const prefersReducedMotion = usePrefersReducedMotion();

  const strokeWidth = (() => {
    const FALLBACK_RATIO = 1 / 24; // 24-unit viewBox
    const ratio =
      typeof thicknessRatio === 'number' &&
      Number.isFinite(thicknessRatio)
        ? Math.max(0, Math.min(thicknessRatio, 1))
        : FALLBACK_RATIO;
    return ratio * 24;
  })();

  const shouldAnimate = (() => {
    if (typeof props.animated === 'boolean') {
      return props.animated;
    }
    if (
      props.respectReducedMotion !== false &&
      prefersReducedMotion
    ) {
      return false;
    }
    return true;
  })();

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      aria-hidden={ariaHidden ? 'true' : undefined}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
    >
      {!ariaHidden && title ? <title>{title}</title> : null}
      {shouldAnimate ? (
        <>
          <circle
            cx="12"
            cy="12"
            r="0"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          >
            <animate
              attributeName="r"
              calcMode="spline"
              dur={dur}
              values="0;11"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin="0s"
            />
            <animate
              attributeName="opacity"
              calcMode="spline"
              dur={dur}
              values="1;0"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>
          <circle
            cx="12"
            cy="12"
            r="0"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          >
            <animate
              attributeName="r"
              calcMode="spline"
              dur={dur}
              values="0;11"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin={offset1}
            />
            <animate
              attributeName="opacity"
              calcMode="spline"
              dur={dur}
              values="1;0"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin={offset1}
            />
          </circle>
          <circle
            cx="12"
            cy="12"
            r="0"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          >
            <animate
              attributeName="r"
              calcMode="spline"
              dur={dur}
              values="0;11"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin={offset2}
            />
            <animate
              attributeName="opacity"
              calcMode="spline"
              dur={dur}
              values="1;0"
              keySplines=".52,.6,.25,.99"
              repeatCount="indefinite"
              begin={offset2}
            />
          </circle>
        </>
      ) : (
        <circle
          cx="12"
          cy="12"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity="0.35"
        />
      )}
    </svg>
  );
}
