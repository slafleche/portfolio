type BasePulseLoaderProps = {
  speedMs?: number;
  className?: string;
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
    speedMs = 1200,
    ariaHidden = true,
    title,
    ariaLabel,
  } = props;
  const dur = `${speedMs / 1000}s`;
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldAnimate = (() => {
    if (typeof props.animated === 'boolean') {
      return props.animated;
    }
    if (props.respectReducedMotion !== false && prefersReducedMotion) {
      return false;
    }
    return true;
  })();

  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      aria-hidden={ariaHidden ? 'true' : undefined}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
    >
      {!ariaHidden && title ? <title>{title}</title> : null}
      <circle
        cx="16"
        cy="16"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {shouldAnimate ? (
          <>
            <animate
              attributeName="r"
              from="4"
              to="10"
              dur={dur}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur={dur}
              repeatCount="indefinite"
            />
          </>
        ) : null}
      </circle>
      <circle cx="16" cy="16" r="4" fill="currentColor">
        {shouldAnimate ? (
          <>
            <animate
              attributeName="r"
              from="2"
              to="4"
              dur={dur}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.7"
              to="1"
              dur={dur}
              repeatCount="indefinite"
            />
          </>
        ) : null}
      </circle>
    </svg>
  );
}
import { useEffect, useState } from 'react';
