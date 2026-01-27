import type { Meta, StoryObj } from '@storybook/react';

import { buildNameBlockLocale } from '@/lib/locales/form/form.name';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { FormBlocksProvider } from '../formBlocks.context';
import { NameBlock } from './NameBlock';

const t = createSectionTranslator(en, en);
const copy = buildNameBlockLocale(t);

const meta: Meta<typeof NameBlock> = {
  title: 'Forms/Components/NameBlock',
  component: NameBlock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof NameBlock>;

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
              NameBlock
            </Heading>
            <FormBlocksProvider>
              <NameBlock id="name" order={0} copy={copy} />
            </FormBlocksProvider>
          </Content>
        </section>
      </main>
    </div>
  ),
};
