import clsx from 'clsx';
import type { SVGProps } from 'react';

import * as s from '../../styles/components/exampleSites.css';
import wordMarkMeta from '../../styles/helpers/wordmark.helper';

export default function ExampleSiteIconKing({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={wordMarkMeta.kg.viewBox}
      shapeRendering="geometricPrecision"
      // fill="currentColor"
      className={clsx(s.kg, className)}
      role="img"
      aria-label={'King Games'}
      {...props}
    >
      <path d={wordMarkMeta.kg.path} />
    </svg>
  );
}
