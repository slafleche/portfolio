import type { Meta, StoryObj } from '@storybook/react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Forms/Form primitives/TextInput',
  component: TextInput,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

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
              TextInput
            </Heading>
            <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
              <Heading depth={2} ignoreDataUI={true}>
                Default
              </Heading>
              <TextInput
                id="text-input"
                placeholder="Type here…"
                defaultValue="Hello"
              />
              <Heading depth={2} ignoreDataUI={true}>
                Disabled
              </Heading>
              <TextInput
                id="text-input-disabled"
                placeholder="Disabled"
                defaultValue="Disabled"
                disabled={true}
              />
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
