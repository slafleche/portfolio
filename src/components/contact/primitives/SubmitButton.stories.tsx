import type { Meta, StoryObj } from '@storybook/react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { SubmitButton } from './SubmitButton';

const meta: Meta<typeof SubmitButton> = {
  title: 'Forms/Components/SubmitButton',
  component: SubmitButton,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof SubmitButton>;

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
              SubmitButton
            </Heading>
            <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
              <Heading depth={2} ignoreDataUI={true}>
                Default
              </Heading>
              <SubmitButton>Submit</SubmitButton>
              <Heading depth={2} ignoreDataUI={true}>
                Disabled
              </Heading>
              <SubmitButton disabled={true}>Disabled</SubmitButton>
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
