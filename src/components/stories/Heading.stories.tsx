import type { Meta, StoryObj } from '@storybook/react';

import * as g from '@/dev/storybook/gallery.css';

import Heading from '../Heading';

const meta: Meta<typeof Heading> = {
  title: 'Primitives/Heading',
  component: Heading,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Levels: Story = {
  name: 'Levels',
  render: () => (
    <div className={g.root}>
      <Heading depth={1}>Heading 1</Heading>
      <Heading depth={2}>Heading 2</Heading>
      <Heading depth={3}>Heading 3</Heading>
      <Heading depth={4}>Heading 4</Heading>
      <Heading depth={5}>Heading 5</Heading>
      <Heading depth={6}>Heading 6</Heading>
    </div>
  ),
};
