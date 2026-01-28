import type { Meta, StoryObj } from '@storybook/react';

import markdownDocumentation from '@/dev/storybook/markdownDocumentation.md?raw';
import * as layoutStyles from '@/styles/layout.css';

import { Markdown } from '../Markdown';
import Content from '../responsive/Content';

const meta: Meta<typeof Markdown> = {
  title: 'Components/Markdown',
  component: Markdown,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Markdown>;

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
            <Markdown>{markdownDocumentation}</Markdown>
          </Content>
        </section>
      </main>
    </div>
  ),
};
