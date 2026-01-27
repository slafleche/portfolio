import type { Meta, StoryObj } from '@storybook/react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { FormHint } from './FormHint';

const meta: Meta<typeof FormHint> = {
  title: 'Forms/Form primitives/FormHint',
  component: FormHint,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof FormHint>;

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
              FormHint
            </Heading>
            <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
              <Heading depth={2} ignoreDataUI={true}>
                Helper
              </Heading>
              <FormHint tone="helper">
                Helper hint with inline markdown: **bold**, _italic_.
              </FormHint>
              <Heading depth={2} ignoreDataUI={true}>
                Error
              </Heading>
              <FormHint tone="error">
                Error hint with inline markdown: **bold**, _italic_.
              </FormHint>
              <Heading depth={2} ignoreDataUI={true}>
                Empty
              </Heading>
              <FormHint tone="helper">{null}</FormHint>
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
