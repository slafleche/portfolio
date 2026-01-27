import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';
import { buildSystemsLink } from '@/lib/routes/systemsLink';

import Footer from './Footer';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

const contactEn = buildContactCopy(t);
const contactFr = buildContactCopy(tFr);

const systemsLinkEn = buildSystemsLink('en', t);
const systemsLinkFr = buildSystemsLink('fr', tFr);

function GlobalStyleOverrides() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = [
      'html, body { background: #000 !important; }',
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

const meta: Meta<typeof Footer> = {
  title: 'Sections/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: defaultViewports, pauseAnimationAtEnd: true },
  },
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const En: Story = {
  name: 'Footer (EN)',
  decorators: [withLocaleEnvironment('/en')],
  render: () => (
    <Footer contact={contactEn} systemsLink={systemsLinkEn} />
  ),
};

export const Fr: Story = {
  name: 'Footer (FR)',
  decorators: [withLocaleEnvironment('/fr')],
  render: () => (
    <Footer contact={contactFr} systemsLink={systemsLinkFr} />
  ),
};
