import type { Meta, StoryObj } from '@storybook/react';

import { defaultViewports } from '@/dev/storybookConfig';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import * as layoutStyles from '@/styles/layout.css';

import { Accordion } from './Accordion';
import { Markdown } from './Markdown';

const t = createSectionTranslator(en, en);
const caseStudies = buildCaseStudiesCopy(t);

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: defaultViewports },
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const HomeCaseStudies: Story = {
  name: 'Home Case Studies (en copy)',
  render: () => (
    <section className={layoutStyles.sectionSpacing}>
      <div className={layoutStyles.content}>
        <Accordion
          items={caseStudies.list.map((study, index) => ({
            id: `case-study-${index}`,
            heading: study.title,
            subHeading: study.subTitle,
            content: <Markdown source={study.content} />,
            defaultOpen: index === 0,
          }))}
        />
      </div>
    </section>
  ),
};

