import { clsx } from 'clsx';
import Link from 'next/link';

import * as s from '@/styles/components/exampleSites.css';

import ExampleSiteIconAcer from './icons/ExampleSiteIconAcer';
import ExampleSiteIconKing from './icons/ExampleSiteIconKing';
import ExampleSiteIconOracle from './icons/ExampleSiteIconOracle';

type ExampleSite = {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  linkClass: string;
};

type ExampleSitesProps = {
  className?: string;
  siteData?: ExampleSite[] | 'fr' | 'en';
};

const sitesFr = [
  {
    label: 'Oracle (en anglais seulement)',
    href: 'https://community.oracle.com/hub/',
    Icon: ExampleSiteIconOracle,
    linkClass: s.oracleLink,
  },
  {
    label: 'King Games',
    href: 'https://community.king.com/fr/',
    Icon: ExampleSiteIconKing,
    linkClass: s.kgLink,
  },
  {
    label: 'Acer',
    href: 'https://community.acer.com/fr',
    Icon: ExampleSiteIconAcer,
    linkClass: s.acerLink,
  },
] as ExampleSite[];

const sitesEn = [
  {
    label: 'Oracle',
    href: 'https://community.oracle.com/hub/',
    Icon: ExampleSiteIconOracle,
    linkClass: s.oracleLink,
  },
  {
    label: 'King Games',
    href: 'https://community.king.com/en/',
    Icon: ExampleSiteIconKing,
    linkClass: s.kgLink,
  },
  {
    label: 'Acer',
    href: 'https://community.acer.com',
    Icon: ExampleSiteIconAcer,
    linkClass: s.acerLink,
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
            data-ui="link"
            aria-hidden={true}
            key={site.label}
            target={'_blank'}
            className={clsx(s.link, site.linkClass)}
          >
            <site.Icon />
          </Link>
        );
      })}
    </div>
  );
}
