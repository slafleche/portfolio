import type { Meta, StoryObj } from '@storybook/react';

const renderPage = (width: number) => (
  <div
    style={{
      overflow: 'auto',
      width: '100%',
    }}
  >
    <img
      alt={`Home FR @${width}px`}
      src={`/pages/fr-home-${width}.png`}
      style={{
        display: 'block',
        width: `${width}px`,
        maxWidth: 'unset',
      }}
    />
  </div>
);

const meta: Meta = {
  title: 'Pages/Home/FR',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const Size320: Story = {
  name: '320',
  parameters: {
    chromatic: {
      viewports: [
        320,
      ],
    },
  },
  render: () => renderPage(320),
};

export const Size360: Story = {
  name: '360',
  parameters: {
    chromatic: {
      viewports: [
        360,
      ],
    },
  },
  render: () => renderPage(360),
};

export const Size840: Story = {
  name: '840',
  parameters: {
    chromatic: {
      viewports: [
        840,
      ],
    },
  },
  render: () => renderPage(840),
};

export const Size1024: Story = {
  name: '1024',
  parameters: {
    chromatic: {
      viewports: [
        1024,
      ],
    },
  },
  render: () => renderPage(1024),
};

export const Size1400: Story = {
  name: '1400',
  parameters: {
    chromatic: {
      viewports: [
        1400,
      ],
    },
  },
  render: () => renderPage(1400),
};
