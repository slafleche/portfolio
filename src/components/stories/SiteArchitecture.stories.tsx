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
import ContentAsTiles from '../responsive/ContentAsTiles';
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
  siteArchitectureEn,
] = translateMarkdownSections(t, [
  {
    titleKey: 'architecture',
    markdownKey: 'home-architecture-content',
    hrefKey: 'architecture-href',
  },
] as const);

const [
  siteArchitectureFr,
] = translateMarkdownSections(tFr, [
  {
    titleKey: 'architecture',
    markdownKey: 'home-architecture-content',
    hrefKey: 'architecture-href',
  },
] as const);

const meta: Meta<typeof ContentWithTitle> = {
  title: 'Sections/Site Architecture',
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
  name: 'Site Architecture (EN)',
  decorators: [
    withLocaleEnvironment('/en'),
  ],
  render: () => (
    <ContentAsTiles
      id={siteArchitectureEn.href?.split('#')[0]}
      title={siteArchitectureEn.title}
      markdown={siteArchitectureEn.content}
      bgOffset={3}
      rotateOffset={1}
      scaleOffset={4}
      translateOffset={6}
    />
  ),
};

export const Fr: Story = {
  name: 'Site Architecture (FR)',
  decorators: [
    withLocaleEnvironment('/fr'),
  ],
  render: () => (
    <ContentAsTiles
      id={siteArchitectureFr.href?.split('#')[0]}
      title={siteArchitectureFr.title}
      markdown={siteArchitectureFr.content}
      bgOffset={3}
      rotateOffset={1}
      scaleOffset={4}
      translateOffset={6}
    />
  ),
};
