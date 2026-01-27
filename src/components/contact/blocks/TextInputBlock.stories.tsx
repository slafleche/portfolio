import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { TextInputBlock } from './TextInputBlock';

const meta: Meta<typeof TextInputBlock> = {
  title: 'Forms/Components/TextInputBlock',
  component: TextInputBlock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TextInputBlock>;

function TextInputBlockExample() {
  const [value, setValue] = useState('Hello');
  return (
    <TextInputBlock
      id="text-input-block"
      blockKey="text-input-block"
      label="TextInputBlock"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      helperText="Helper text"
      required={true}
      requiredText="Required"
      autoComplete="name"
    />
  );
}

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div className={layoutStyles.page}>
      <main
        className={layoutStyles.main}
        data-query-all="no-margin"
        data-query-compact="no-padding"
      >
        <section className={layoutStyles.sectionSpacing}>
          <Content tag="div" ignoreBottomMargin={true}>
            <Heading depth={1} ignoreDataUI={true}>
              TextInputBlock
            </Heading>
            <TextInputBlockExample />
          </Content>
        </section>
      </main>
    </div>
  ),
};
