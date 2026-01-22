import { clsx } from 'clsx';
import Link from 'next/link';
import { href } from 'react-router-dom';

import * as s from '@/styles/components/exampleSites.css';

import ExampleSiteIconAcer from './icons/ExampleSiteIconAcer';
import ExampleSiteIconKing from './icons/ExampleSiteIconKing';
import ExampleSiteIconOracle from './icons/ExampleSiteIconOracle';

type ExampleSite = {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type ExampleSitesProps = {
  className?: string;
  siteData?: ExampleSite[] | 'fr' | 'en';
};

// - [King Games](https://community.king.com/fr/)
// - [Oracle (en anglais seulement)](https://community.oracle.com/hub/)
// - [Acer](https://community.acer.com/fr)

// - [King Games](https://community.king.com/en/)
// - [Oracle](https://community.oracle.com/hub/)
// - [Acer](https://community.acer.com)

const sitesFr = [
  {
    label: 'King Games',
    href: 'https://community.king.com/fr/',
    Icon: ExampleSiteIconKing,
  },
  {
    label: 'Oracle (en anglais seulement)',
    href: 'https://community.oracle.com/hub/',
    Icon: ExampleSiteIconOracle,
  },
  {
    label: 'Acer',
    href: 'https://community.acer.com/fr',
    Icon: ExampleSiteIconAcer,
  },
] as ExampleSite[];

const sitesEn = [
  {
    label: 'King Games',
    href: 'https://community.king.com/en/',
    Icon: ExampleSiteIconKing,
  },
  {
    label: 'Oracle',
    href: 'https://community.oracle.com/hub/',
    Icon: ExampleSiteIconOracle,
  },
  {
    label: 'Acer',
    href: 'https://community.acer.com',
    Icon: ExampleSiteIconAcer,
  },
] as ExampleSite[];

export default function ExampleSites({
  className,
  siteData,
}: ExampleSitesProps) {
  let sites = [] as ExampleSite[];

  if (siteData == 'fr') {
    sites = sitesFr;
  } else if (siteData == 'en') {
    sites = sitesEn;
  } else {
    sites = siteData || [];
  }

  return (
    <div className={clsx(s.root, className)}>
      {sites.map((site: ExampleSite) => {
        return (
          <Link
            title={site.label}
            href={site.href}
            className={s.link}
            data-ui="link"
            aria-hidden={true}
            key={site.label}
          >
            <site.Icon />
          </Link>
        );
      })}
    </div>
  );
}
