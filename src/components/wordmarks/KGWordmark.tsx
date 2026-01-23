import clsx from 'clsx';
import type { SVGProps } from 'react';

import { wordMark_kg } from '../../styles/components/card.css';
import wordMarkMeta from '../../styles/helpers/wordmark.helper';

const LABEL = 'King Games';

export default function KGWordmark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={wordMarkMeta.kg.viewBox}
      shapeRendering="geometricPrecision"
      fill="currentColor"
      className={clsx(className, wordMark_kg)}
      role="img"
      aria-label={LABEL}
      {...props}
    >
      <title>{LABEL}</title>

      <path d={wordMarkMeta.kg.path} />
    </svg>
  );
}
