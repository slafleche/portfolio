import type { Meta, StoryObj } from '@storybook/react';
import type { LinkProps } from 'next/link';
import type { ComponentType, JSX, SVGProps } from 'react';

import Logo from '@/components/Logo';
import GitHubWordmark from '@/components/wordmarks/GitHubWordmark';
import NPMWordmark from '@/components/wordmarks/NPMWordmark';
import {
  BQWordmark,
  CCWordmark,
  EAWordmark,
  HSWordmark,
  KGWordmark,
  VNWordmark,
} from '@/components/wordmarks/wordmarks';
import * as g from '@/dev/storybook/gallery.css';
import { color } from '@/styles/helpers/colorWrap.helper';

import ExampleSiteIconAcer from './ExampleSiteIconAcer';
import ExampleSiteIconKing from './ExampleSiteIconKing';
import ExampleSiteIconOracle from './ExampleSiteIconOracle';
import SocialGitHubIcon from './SocialGitHubIcon';
import SocialLinkedInIcon from './SocialLinkedInIcon';

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

const wordmarks: Array<{ name: string; Component: SvgComponent }> = [
  { name: 'BQWordmark', Component: BQWordmark },
  { name: 'CCWordmark', Component: CCWordmark },
  { name: 'EAWordmark', Component: EAWordmark },
  { name: 'HSWordmark', Component: HSWordmark },
  { name: 'KGWordmark', Component: KGWordmark },
  { name: 'VNWordmark', Component: VNWordmark },
].sort((a, b) => a.name.localeCompare(b.name));

const businessLogos: Array<{
  name: string;
  Component: SvgComponent;
}> = [
  { name: 'Oracle', Component: ExampleSiteIconOracle },
  { name: 'King', Component: ExampleSiteIconKing },
  { name: 'Acer', Component: ExampleSiteIconAcer },
].sort((a, b) => a.name.localeCompare(b.name));

type LogoTile = {
  name: string;
  render: () => JSX.Element;
};

function LogosGallery() {
  const wordmarkTiles: LogoTile[] = [
    ...wordmarks.map(({ name, Component }) => ({
      name,
      render: () => <Component aria-hidden />,
    })),
    {
      name: 'GitHubWordmark',
      render: () => (
        <GitHubWordmark
          disableLink={true}
          style={{
            width: 150,
            height: 'auto',
            maxHeight: 44,
            color: '#fff',
          }}
          aria-hidden
        />
      ),
    },
    {
      name: 'NPMWordmark',
      render: () => (
        <NPMWordmark
          linkUrl={null as unknown as LinkProps['href']}
          style={{
            width: 150,
            height: 'auto',
            maxHeight: 44,
            color: '#fff',
          }}
          aria-hidden
        />
      ),
    },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const logoTiles: LogoTile[] = [
    {
      name: 'SiteLogo',
      render: () => (
        <div className={g.siteLogoContainer}>
          <Logo
            idBase="storybook-site-logo"
            mode="mono"
            bgColour={color('#000')}
          />
        </div>
      ),
    },
    ...businessLogos.map(({ name, Component }) => ({
      name,
      render: () => (
        <div
          data-target={`${name.toLocaleLowerCase()}`}
          className={g.businessLogoContainer}
        >
          <Component
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
            aria-hidden
          />
        </div>
      ),
    })),
    {
      name: 'SocialGitHubIcon',
      render: () => (
        <SocialGitHubIcon width={56} height={56} aria-hidden />
      ),
    },
    {
      name: 'SocialLinkedInIcon',
      render: () => (
        <SocialLinkedInIcon width={56} height={56} aria-hidden />
      ),
    },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={g.root}>
      <h1 className={g.title}>Logos</h1>
      <p className={g.sectionSubtitle}>
        From <code>src/components/icons</code>
      </p>
      <div className={g.gridLogos}>
        {logoTiles.map(({ name, render }) => (
          <div key={name} className={g.svgTile}>
            <div className={g.svgTileIcon}>{render()}</div>
            <div className={g.svgTitleLabel}>{name}</div>
          </div>
        ))}
      </div>

      <h2 className={g.sectionTitle}>Wordmarks</h2>
      <p className={g.sectionSubtitle}>
        From <code>src/components/wordmarks</code>
        <br />
        Means to be rendered inside text content.
      </p>
      <div className={g.gridLogos}>
        {wordmarkTiles.map(({ name, render }) => (
          <div key={name} className={g.svgTile}>
            <div className={g.svgTileIcon}>{render()}</div>
            <div className={g.svgTitleLabel}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof LogosGallery> = {
  title: 'SVGs/Logos',
  component: LogosGallery,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      disableSnapshot: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof LogosGallery>;

export const Logos: Story = {
  name: 'Logos',
  render: () => <LogosGallery />,
};
