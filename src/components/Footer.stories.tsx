import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import { __setStorybookPathname } from '@/dev/storybook/nextNavigationShim';
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

const removeFrozenAnimationOverrides = () => {
  if (typeof document === 'undefined') return;

  const styles = Array.from(document.querySelectorAll('style'));
  for (const style of styles) {
    const text = style.textContent ?? '';
    if (
      text.includes('animation: none !important') &&
      text.includes('transition: none !important')
    ) {
      style.remove();
    }
  }
};

const forceNoReducedMotionMatchMedia = () => {
  if (typeof window === 'undefined') return () => {};
  const originalMatchMedia = window.matchMedia.bind(window);

  window.matchMedia = ((query: string) => {
    if (query.includes('prefers-reduced-motion')) {
      const mql: MediaQueryList = {
        media: query,
        matches: false,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      };
      return mql;
    }
    return originalMatchMedia(query);
  });

  return () => {
    window.matchMedia = originalMatchMedia;
  };
};

function GlobalStyleOverrides() {
  useEffect(() => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return null;
}

function withLocaleEnvironment(pathname: string): Decorator {
  return function WithLocaleEnvironmentDecorator(Story) {
    const restoreMatchMedia = (() => {
      __setStorybookPathname(pathname);
      removeFrozenAnimationOverrides();
      return forceNoReducedMotionMatchMedia();
    })();

    function LocaleDecorator() {
      useEffect(() => restoreMatchMedia, []);
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
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const En: Story = {
  name: 'Footer (EN)',
  decorators: [
    withLocaleEnvironment('/en'),
  ],
  render: () => (
    <Footer contact={contactEn} systemsLink={systemsLinkEn} />
  ),
};

export const Fr: Story = {
  name: 'Footer (FR)',
  decorators: [
    withLocaleEnvironment('/fr'),
  ],
  render: () => (
    <Footer contact={contactFr} systemsLink={systemsLinkFr} />
  ),
};
