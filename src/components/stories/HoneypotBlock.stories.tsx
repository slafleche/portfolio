import type { Meta, StoryObj } from '@storybook/react';

import { buildHoneypotBlockLocale } from '@/lib/locales/form/form.honeypot';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import * as layoutStyles from '@/styles/layout.css';

import { HoneypotBlock } from '../contact/blocks/HoneypotBlock';
import Heading from '../Heading';
import Content from '../responsive/Content';

const t = createSectionTranslator(en, en);
const copy = buildHoneypotBlockLocale(t);

const meta: Meta<typeof HoneypotBlock> = {
  title: 'Forms/Components/Honeypot Block',
  component: HoneypotBlock,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof HoneypotBlock>;

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
              Honeypot Block
            </Heading>
            <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
              <p>
                This honeypot field is intentionally invisible and
                <em> aria-hidden</em> to humans, but it’s present in
                the DOM to catch simple spam bots that fill every
                input.
              </p>
              <p>
                In this story, the block renders but stays hidden by
                design.
              </p>
              <HoneypotBlock copy={copy} />
            </div>
          </Content>
        </section>
      </main>
    </div>
  ),
};
