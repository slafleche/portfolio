import type { ReactNode } from 'react';

import * as chevronStyles from '@/styles/components/chevrons.css';

import ChevronDown from './icons/ChevronDown';
import SkipToContentClient from './SkipToContent.client';

type Props = {
  className?: string;
  href?: string;
  label: string;
  icon?: ReactNode;
};

export default function SkipToContent({
  className,
  href = '#body',
  label,
  icon,
}: Props) {
  return (
    <SkipToContentClient
      className={className}
      href={href}
      label={label}
      icon={icon ?? <ChevronDown className={chevronStyles.down} />}
    />
  );
}
