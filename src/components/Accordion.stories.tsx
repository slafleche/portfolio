import type { Meta, StoryObj } from '@storybook/react';

import { defaultViewports } from '@/dev/storybookConfig';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import * as layoutStyles from '@/styles/layout.css';

import { Accordion } from './Accordion';
import { Markdown } from './Markdown';

const t = createSectionTranslator(en, en);
const caseStudies = buildCaseStudiesCopy(t);

const tFr = createSectionTranslator(fr, fr);
const caseStudiesFr = buildCaseStudiesCopy(tFr);

const meta: Meta<typeof Accordion> = {
  title: 'Sections/Accordion',
  component: Accordion,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: defaultViewports },
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const HomeCaseStudies: Story = {
  name: 'Home Case Studies (EN)',
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

export const HomeCaseStudiesFr: Story = {
  name: 'Home Case Studies (FR)',
  render: () => (
    <section className={layoutStyles.sectionSpacing}>
      <div className={layoutStyles.content}>
        <Accordion
          items={caseStudiesFr.list.map((study, index) => ({
            id: `case-study-fr-${index}`,
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
