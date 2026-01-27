import type { Meta, StoryObj } from '@storybook/react';

import { defaultViewports } from '@/dev/storybookConfig';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import * as cg from '@/styles/components/card.css';

import CaseStudy from '../CaseStudy';

const t = createSectionTranslator(en, en);
const caseStudies = buildCaseStudiesCopy(t);

const tFr = createSectionTranslator(fr, en);
const caseStudiesFr = buildCaseStudiesCopy(tFr);

const meta: Meta<typeof CaseStudy> = {
  title: 'Sections/CaseStudy',
  component: CaseStudy,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: defaultViewports },
  },
};

export default meta;

type Story = StoryObj<typeof CaseStudy>;

export const IntroOnly: Story = {
  name: 'Intro Case Study (EN)',
  render: () => (
    <CaseStudy
      id={caseStudies.href}
      intro={caseStudies.intro}
      title={caseStudies.title}
      wordMarkClassName={cg.wordmarkTextNoLogo}
    >
      <div />
    </CaseStudy>
  ),
};

export const IntroOnlyFr: Story = {
  name: 'Intro Case Study (FR)',
  render: () => (
    <CaseStudy
      id={caseStudiesFr.href}
      intro={caseStudiesFr.intro}
      title={caseStudiesFr.title}
      wordMarkClassName={cg.wordmarkTextNoLogo}
    >
      <div />
    </CaseStudy>
  ),
};
