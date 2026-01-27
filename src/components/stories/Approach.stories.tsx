import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import { translateMarkdownSections } from '@/lib/locales/sections/markdownSections.helpers';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';

import { Markdown } from '../Markdown';
import ContentWithTitle from '../responsive/ContentWithTitle';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

function GlobalStyleOverrides() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = [
      '* { animation: none !important; transition: none !important; }',
    ].join('\n');
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return null;
}

function withLocaleEnvironment(pathname: string): Decorator {
  return function WithLocaleEnvironmentDecorator(Story) {
    const restoreReducedMotion = (() => {
      __setStorybookPathname(pathname);
      return __forceReducedMotion();
    })();

    function LocaleDecorator() {
      useEffect(() => restoreReducedMotion, []);
      return (
        <>
          <GlobalStyleOverrides />
          <Story />
        </>
      );
    }

    return <LocaleDecorator />;
  };
}

const [
  approachEn,
] = translateMarkdownSections(t, [
  {
    titleKey: 'approach',
    markdownKey: 'approach-content',
    hrefKey: 'approach-href',
  },
] as const);

const [
  approachFr,
] = translateMarkdownSections(tFr, [
  {
    titleKey: 'approach',
    markdownKey: 'approach-content',
    hrefKey: 'approach-href',
  },
] as const);

const meta: Meta<typeof ContentWithTitle> = {
  title: 'Sections/Approach',
  component: ContentWithTitle,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof ContentWithTitle>;

export const En: Story = {
  name: 'Approach (EN)',
  decorators: [
    withLocaleEnvironment('/en'),
  ],
  render: () => (
    <ContentWithTitle id={approachEn.href} title={approachEn.title}>
      <Markdown source={approachEn.content} />
    </ContentWithTitle>
  ),
};

export const Fr: Story = {
  name: 'Approach (FR)',
  decorators: [
    withLocaleEnvironment('/fr'),
  ],
  render: () => (
    <ContentWithTitle id={approachFr.href} title={approachFr.title}>
      <Markdown source={approachFr.content} />
    </ContentWithTitle>
  ),
};
