import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType, JSX, SVGProps } from 'react';

import * as g from '@/dev/storybook/gallery.css';

import PulseLoader from '../contact/PulseLoader';
import ChevronDown from './ChevronDown';
import CircledCheckIcon from './CircledCheckIcon';
import CircledErrorIcon from './CircledErrorIcon';
import CloseIcon from './CloseIcon';
import LeftArrow from './LeftArrow';
import NubbyTriangle from './NubbyTriangle';
import Plus from './Plus';
import RightArrow from './RightArrow';
import RoundedTriangle from './RoundedTriangle';
import SendIcon from './SendIcon';
import ToTopArrow from './ToTopArrow';

type SvgIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type IconTile = {
  name: string;
  render: () => JSX.Element;
};

const ICON_SIZE = 56;

const renderSquareIcon = (Component: SvgIconComponent) => (
  <Component width={ICON_SIZE} height={ICON_SIZE} aria-hidden />
);

const renderHeroTriangleIcon = (Component: SvgIconComponent) => (
  <Component
    style={{
      width: ICON_SIZE,
      height: 'auto',
      maxHeight: ICON_SIZE,
    }}
    aria-hidden
  />
);

const icons: IconTile[] = [
  {
    name: 'ChevronDown',
    render: () => renderSquareIcon(ChevronDown),
  },
  {
    name: 'CircledCheckIcon',
    render: () => renderSquareIcon(CircledCheckIcon),
  },
  {
    name: 'CircledErrorIcon',
    render: () => renderSquareIcon(CircledErrorIcon),
  },
  {
    name: 'CloseIcon',
    render: () => (
      <CloseIcon
        label="Close"
        width={ICON_SIZE}
        height={ICON_SIZE}
        aria-hidden
      />
    ),
  },
  { name: 'LeftArrow', render: () => renderSquareIcon(LeftArrow) },
  {
    name: 'NubbyTriangle',
    render: () => renderHeroTriangleIcon(NubbyTriangle),
  },
  { name: 'Plus', render: () => renderSquareIcon(Plus) },
  { name: 'RightArrow', render: () => renderSquareIcon(RightArrow) },
  {
    name: 'RoundedTriangle',
    render: () => renderHeroTriangleIcon(RoundedTriangle),
  },
  { name: 'SendIcon', render: () => renderSquareIcon(SendIcon) },
  { name: 'ToTopArrow', render: () => renderSquareIcon(ToTopArrow) },
].sort((a, b) => a.name.localeCompare(b.name));

function IconGallery() {
  return (
    <div className={g.root}>
      <h1 className={g.title}>Icons</h1>
      <p className={g.subtitle}>
        {icons.length + 1} components from{' '}
        <code>src/components/icons</code>
      </p>

      <div className={g.gridIcons}>
        <div
          key="PulseLoader"
          className={g.svgTile}
        >
          <div className={g.svgTileIcon}>
            <PulseLoader
              className={g.pulse}
              ariaHidden={true}
              respectReducedMotion={false}
            />
          </div>
          <div className={g.svgTitleLabel}>PulseLoader</div>
        </div>

        {icons.map(({ name, render }) => (
          <div
            key={name}
            className={g.svgTile}
          >
            <div className={g.svgTileIcon}>{render()}</div>
            <div className={g.svgTitleLabel}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof IconGallery> = {
  title: 'SVGs/Icons',
  component: IconGallery,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      disableSnapshot: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconGallery>;

export const Icons: Story = {
  name: 'Icons',
  render: () => <IconGallery />,
};
