import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { SVGProps } from 'react';

import { sharedStrings } from '@/lib/sharedStrings';

import {
  npmLinkInTitleIcon,
  npmLinkInTitleLink,
} from '../../styles/typography.css';

const LABEL = 'Node Package Manager (NPM)';
const LINK_LABEL = 'NPM - CSS Calipers';

type NPMWordmarkProps = {
  linkUrl?: LinkProps['href'];
  linkClassName?: string;
  linkLabel?: string;
  disableLink?: boolean;
} & SVGProps<SVGSVGElement>;

export default function NPMWordmark({
  className = npmLinkInTitleIcon,
  linkUrl = sharedStrings.npmUrl,
  linkClassName = npmLinkInTitleLink,
  linkLabel = LINK_LABEL,
  disableLink = false,
  ...props
}: NPMWordmarkProps) {
  const svgElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 206.375 66.145806"
      shapeRendering="geometricPrecision"
      className={className}
      role="img"
      aria-label={LABEL}
      {...props}
    >
      <title>{LABEL}</title>
      <path
        fill="currentColor"
        d="m 63.5,66.1458 h 26.4583 v -13.2291 h 26.4583 v -52.9167 h -52.9166 z m 26.4583,-52.9166 h 13.2292 v 26.4583 h -13.2292 z m 37.0417,-13.2292 v 52.9167 h 26.4583 v -39.6875 h 13.2292 v 39.6875 h 13.2291 v -39.6875 h 13.2292 v 39.6875 h 13.2292 v -52.9167 z m -127,52.9167 h 26.4583 v -39.6875 h 13.2292 v 39.6875 h 13.2291 v -52.9167 h -52.9166 z"
      />
    </svg>
  );

  if (linkUrl && !disableLink) {
    return (
      <Link
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={linkLabel}
        title={linkLabel}
        data-ui="link"
        className={linkClassName}
      >
        {svgElement}
      </Link>
    );
  }

  return svgElement;
}
