import type { Meta, StoryObj } from '@storybook/react';

import { buildMessageBlockLocale } from '@/lib/locales/form/form.message';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import * as layoutStyles from '@/styles/layout.css';

import Heading from '../../Heading';
import Content from '../../responsive/Content';
import { FormBlocksProvider } from '../formBlocks.context';
import { MessageBlock } from './MessageBlock';

const t = createSectionTranslator(en, en);
const copy = buildMessageBlockLocale(t);

const meta: Meta<typeof MessageBlock> = {
  title: 'Forms/Components/MessageBlock',
  component: MessageBlock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof MessageBlock>;

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
              MessageBlock
            </Heading>
            <FormBlocksProvider>
              <MessageBlock id="message" order={2} copy={copy} />
            </FormBlocksProvider>
          </Content>
        </section>
      </main>
    </div>
  ),
};
