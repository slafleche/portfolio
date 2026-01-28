import type { Meta, StoryObj } from '@storybook/react';

import { Abbr } from '../Abbr';

const meta: Meta<typeof Abbr> = {
  title: 'Primitives/Abbr',
  component: Abbr,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Abbr>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        fontSize: 18,
      }}
    >
      <p>
        <Abbr label="CSS" definition="Cascading Style Sheets" /> and{' '}
        <Abbr
          label="API"
          definition="Application Programming Interface"
        />
        .
      </p>
    </div>
  ),
};
