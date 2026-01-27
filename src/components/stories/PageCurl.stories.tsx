import type { Meta, StoryObj } from '@storybook/react';

import { backgrounds } from '@/styles/helpers/background.helper';
import { colorVars } from '@/tokens/global.tokens';

import PageCurl from '../PageCurl';

const meta: Meta<typeof PageCurl> = {
  title: 'Components/PageCurl',
  component: PageCurl,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof PageCurl>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        ...backgrounds({ color: colorVars.black }),
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <PageCurl
        href="/"
        label="Back to home"
        mockHtmlAlt="HTML closing tag"
      />
    </div>
  ),
};
