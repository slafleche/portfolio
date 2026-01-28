import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType, JSX, SVGProps } from 'react';

import * as g from '@/dev/storybook/gallery.css';

import PulseLoader from '../contact/PulseLoader';
import BlocksIcon from '../icons/BlocksIcon';
import ChevronDown from '../icons/ChevronDown';
import CircledCheckIcon from '../icons/CircledCheckIcon';
import CircledErrorIcon from '../icons/CircledErrorIcon';
import CloseIcon from '../icons/CloseIcon';
import CrossRoadsIcon from '../icons/CrossRoadsIcon';
import LeftArrow from '../icons/LeftArrow';
import NubbyTriangle from '../icons/NubbyTriangle';
import Plus from '../icons/Plus';
import RightArrow from '../icons/RightArrow';
import RoundedTriangle from '../icons/RoundedTriangle';
import SendIcon from '../icons/SendIcon';
import ToTopArrow from '../icons/ToTopArrow';
import VennSquaresIcon from '../icons/VennSquaresIcon';

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
  {
    name: 'CrossRoadsIcon',
    render: () => renderSquareIcon(CrossRoadsIcon),
  },
  {
    name: 'VennSquaresIcon',
    render: () => renderSquareIcon(VennSquaresIcon),
  },
  {
    name: 'BlocksIcon',
    render: () => renderSquareIcon(BlocksIcon),
  },
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
        <div key="PulseLoader" className={g.svgTile}>
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
          <div key={name} className={g.svgTile}>
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
