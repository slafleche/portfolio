import type { Meta, StoryObj } from '@storybook/react';

import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { FormLabel } from './FormLabel';

const meta: Meta<typeof FormLabel> = {
  title: 'Forms/Form primitives/FormLabel',
  component: FormLabel,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof FormLabel>;

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
              FormLabel
            </Heading>
            <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
              <Heading depth={2} ignoreDataUI={true}>
                Basic
              </Heading>
              <FormLabel htmlFor="label-basic" label="Label" />
              <Heading depth={2} ignoreDataUI={true}>
                Required
              </Heading>
              <FormLabel
                htmlFor="label-required"
                label="Required label"
                required={true}
                requiredText="Required"
              />
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
