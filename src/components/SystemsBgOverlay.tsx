import { useId, type SVGProps } from 'react';

export type GradientStop = {
  offsetPercent: number;
  color: string;
  opacity?: number;
};

const defaultStopsA: GradientStop[] = [
  { offsetPercent: 45, color: 'hsl(185, 53%, 55%)' },
  { offsetPercent: 100, color: 'hsl(0, 73%, 55%)' },
];

const defaultStopsB: GradientStop[] = [
  { offsetPercent: 0, color: 'hsl(0, 73%, 55%)' },
  { offsetPercent: 45, color: 'hsl(185, 53%, 55%)' },
];

type SystemsBgOverlayProps = SVGProps<SVGSVGElement> & {
  gradientStopsA?: GradientStop[];
  gradientStopsB?: GradientStop[];
  gradientStopsC?: GradientStop[];
  gradientStopsD?: GradientStop[];
  spacing?: number;
  frequency?: number;
  strokeWidth?: number;
};

export default function SystemsBgOverlay({
  className,
  gradientStopsA = defaultStopsA,
  gradientStopsB = defaultStopsB,
  gradientStopsC = defaultStopsA,
  gradientStopsD = defaultStopsB,
  spacing = 10.5,
  frequency = 37,
  strokeWidth = 2,
  ...rest
}: SystemsBgOverlayProps) {
  const id = useId();
  const gradientA = `${id}-gradient-A`;
  const gradientB = `${id}-gradient-B`;
  const gradientC = `${id}-gradient-C`;
  const gradientD = `${id}-gradient-D`;
  const circles = Array.from({ length: frequency }, (_, index) => ({
    radius: (frequency - index) * spacing,
  }));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 800 800"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id={gradientA}
        >
          {gradientStopsA.map((stop) => (
            <stop
              key={stop.offsetPercent}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id={gradientB}
        >
          {gradientStopsB.map((stop) => (
            <stop
              key={stop.offsetPercent}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
        <linearGradient
          gradientTransform="rotate(270)"
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id={gradientC}
        >
          {gradientStopsC.map((stop) => (
            <stop
              key={stop.offsetPercent}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
        <linearGradient
          gradientTransform="rotate(270)"
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id={gradientD}
        >
          {gradientStopsD.map((stop) => (
            <stop
              key={stop.offsetPercent}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
      </defs>
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientA})`}
        fill="none"
      >
        {circles.map((circle) => (
          <circle
            key={`top-${circle.radius}`}
            r={circle.radius}
            cx="50%"
            cy="0"
          />
        ))}
      </g>
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientB})`}
        fill="none"
      >
        {circles.map((circle) => (
          <circle
            key={`bottom-${circle.radius}`}
            r={circle.radius}
            cx="50%"
            cy="100%"
          />
        ))}
      </g>
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientC})`}
        fill="none"
      >
        {circles.map((circle) => (
          <circle
            key={`left-${circle.radius}`}
            r={circle.radius}
            cx="0"
            cy="50%"
          />
        ))}
      </g>
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientD})`}
        fill="none"
      >
        {circles.map((circle) => (
          <circle
            key={`right-${circle.radius}`}
            r={circle.radius}
            cx="100%"
            cy="50%"
          />
        ))}
      </g>
    </svg>
  );
}
