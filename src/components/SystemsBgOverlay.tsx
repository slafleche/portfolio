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
  gradientStopsTop?: GradientStop[];
  gradientStopsBottom?: GradientStop[];
  gradientStopsLeft?: GradientStop[];
  gradientStopsRight?: GradientStop[];
  spacing?: number;
  frequency?: number;
  strokeWidth?: number;
  centerSpacing?: number;
  centerFrequency?: number;
  centerStrokeWidth?: number;
  centerAngle?: number;
};

export default function SystemsBgOverlay({
  className,
  gradientStopsTop = defaultStopsA,
  gradientStopsBottom = defaultStopsB,
  gradientStopsLeft = defaultStopsA,
  gradientStopsRight = defaultStopsB,
  spacing = 100,
  frequency = 3,
  strokeWidth = 4,

  centerSpacing = 100,
  centerFrequency = 4,
  centerStrokeWidth = 6,
  centerAngle = 180,
  ...rest
}: SystemsBgOverlayProps) {
  const id = useId();
  const gradientTop = `${id}-gradient-top`;
  const gradientBottom = `${id}-gradient-bottom`;
  const gradientLeft = `${id}-gradient-left`;
  const gradientRight = `${id}-gradient-right`;
  const blobPath =
    'M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z';
  const blobBaseSize = 100;
  const blobHalf = blobBaseSize / 2;
  const shapeGroup = Array.from({ length: frequency }, (
    _,
    index,
  ) => ({
    radius: (frequency - index) * spacing,
  }));
  const centerCircles = Array.from({ length: centerFrequency }, (
    _,
    index,
  ) => ({
    radius: (centerFrequency - index) * centerSpacing,
  }));
  const makeTransform = (
    cx: number,
    cy: number,
    radius: number,
    rotation = 0,
  ) => {
    const scale = (radius * 2) / blobBaseSize;
    const rotate = rotation
      ? ` rotate(${rotation} ${blobHalf} ${blobHalf})`
      : '';
    return `translate(${cx} ${cy}) scale(${scale}) translate(${-blobHalf} ${-blobHalf})${rotate}`;
  };

  const middleOpacity = 1;
  const nonMiddleOpacity = 1;

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
          y1="100%"
          x2="50%"
          y2="0%"
          id={gradientTop}
        >
          {gradientStopsTop.map((stop, index) => (
            <stop
              key={`top-${index}-${stop.offsetPercent}-${stop.color}`}
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
          id={gradientBottom}
        >
          {gradientStopsBottom.map((stop, index) => (
            <stop
              key={`bottom-${index}-${stop.offsetPercent}-${stop.color}`}
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
          gradientTransform="rotate(180 0.5 0.5)"
          id={gradientLeft}
        >
          {gradientStopsLeft.map((stop, index) => (
            <stop
              key={`left-${index}-${stop.offsetPercent}-${stop.color}`}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
        {/* Right Gradient */}
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id={gradientRight}
        >
          {gradientStopsRight.map((stop, index) => (
            <stop
              key={`right-${index}-${stop.offsetPercent}-${stop.color}`}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
              offset={`${stop.offsetPercent}%`}
            />
          ))}
        </linearGradient>
      </defs>
      {/* Top group */}
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientTop})`}
        fill="none"
        strokeLinejoin="round"
        opacity={nonMiddleOpacity}
      >
        {shapeGroup.map((circle) => (
          <path
            key={`top-${circle.radius}`}
            d={blobPath}
            transform={makeTransform(400, 0, circle.radius, 180)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {/* Bottom group */}
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientBottom})`}
        fill="none"
        strokeLinejoin="round"
        opacity={nonMiddleOpacity}
      >
        {shapeGroup.map((circle) => (
          <path
            key={`bottom-${circle.radius}`}
            d={blobPath}
            transform={makeTransform(400, 800, circle.radius)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {/* Left group */}
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientLeft})`}
        fill="none"
        strokeLinejoin="round"
        opacity={nonMiddleOpacity}
      >
        {shapeGroup.map((circle) => (
          <path
            key={`left-${circle.radius}`}
            d={blobPath}
            transform={makeTransform(0, 400, circle.radius, 90)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {/* Right group */}
      <g
        strokeWidth={strokeWidth}
        stroke={`url(#${gradientRight})`}
        fill="none"
        strokeLinejoin="round"
        opacity={nonMiddleOpacity}
      >
        {shapeGroup.map((circle) => (
          <path
            key={`right-${circle.radius}`}
            d={blobPath}
            transform={makeTransform(800, 400, circle.radius, -90)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {/* Center group */}
      <g
        strokeWidth={centerStrokeWidth}
        stroke={`url(#${gradientTop})`}
        fill="none"
        strokeLinejoin="round"
        opacity={middleOpacity}
      >
        {centerCircles.map((circle) => (
          <path
            key={`center-${circle.radius}`}
            d={blobPath}
            transform={makeTransform(
              400,
              400,
              circle.radius,
              centerAngle,
            )}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
