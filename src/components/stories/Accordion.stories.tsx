import type { Meta, StoryObj } from '@storybook/react';

import { defaultViewports } from '@/dev/storybookConfig';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';

import { Accordion } from '../Accordion';
import { Markdown } from '../Markdown';
import Content from '../responsive/Content';

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
    <Content
      queryDataAttributes={{
        compact: 'no-padding-no-margin',
      }}
    >
      <Accordion
        items={caseStudies.list.map((study, index) => ({
          id: `case-study-${index}`,
          heading: study.title,
          subHeading: study.subTitle,
          content: <Markdown source={study.content} />,
          defaultOpen: index === 0,
        }))}
      />
    </Content>
  ),
};

export const HomeCaseStudiesFr: Story = {
  name: 'Home Case Studies (FR)',
  render: () => (
    <Content
      queryDataAttributes={{
        compact: 'no-padding-no-margin',
      }}
    >
      <Accordion
        items={caseStudiesFr.list.map((study, index) => ({
          id: `case-study-fr-${index}`,
          heading: study.title,
          subHeading: study.subTitle,
          content: <Markdown source={study.content} />,
          defaultOpen: index === 0,
        }))}
      />
    </Content>
  ),
};
