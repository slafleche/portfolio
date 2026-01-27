import type { Meta, StoryObj } from '@storybook/react';

import { buildEmailBlockLocale } from '@/lib/locales/form/form.email';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import * as layoutStyles from '@/styles/layout.css';

import Heading from '../Heading';
import Content from '../responsive/Content';
import { FormBlocksProvider } from '../contact/formBlocks.context';
import { EmailBlock } from '../contact/blocks/EmailBlock';

const t = createSectionTranslator(en, en);
const copy = buildEmailBlockLocale(t);

const meta: Meta<typeof EmailBlock> = {
  title: 'Forms/Components/EmailBlock',
  component: EmailBlock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof EmailBlock>;

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
              EmailBlock
            </Heading>
            <FormBlocksProvider>
              <EmailBlock id="email" order={1} copy={copy} />
            </FormBlocksProvider>
          </Content>
        </section>
      </main>
    </div>
  ),
};
