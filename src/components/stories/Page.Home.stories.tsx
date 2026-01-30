import type { Meta, StoryObj } from '@storybook/react';

import PageRenderImage, {
  pageRenderWrapperWidth,
} from './PageRenderImage';

const renderPage = (width: number) => (
  <PageRenderImage
    alt={`Home EN @${width}px`}
    src={`/pages/en-home-${width}.png`}
    width={width}
  />
);

const meta: Meta = {
  title: 'Pages/EN Home',
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
        pageRenderWrapperWidth(320),
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
        pageRenderWrapperWidth(360),
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
        pageRenderWrapperWidth(840),
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
        pageRenderWrapperWidth(1024),
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
        pageRenderWrapperWidth(1400),
      ],
    },
  },
  render: () => renderPage(1400),
};
