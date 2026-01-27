import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import { getLocaleSvgs } from '@/assets/SVG/generated/headingsAsSvgs';
import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import en from '@/lib/locales/translations/en';
import fr from '@/lib/locales/translations/fr';

import Hero from '../Hero';
import HeroHomeBg from '../HeroHomeBg';
import SiteProviders from '../site/SiteProviders.client';

const t = createSectionTranslator(en, en);
const tFr = createSectionTranslator(fr, en);

const enCopies = {
  hero: buildHeroCopy(t),
  form: buildContactFormCopy(t),
  privacy: buildPrivacyCopy(t),
  closeLabel: t('close-label'),
  titleSvg: getLocaleSvgs('en').home.heroHeading,
};

const frCopies = {
  hero: buildHeroCopy(tFr),
  form: buildContactFormCopy(tFr),
  privacy: buildPrivacyCopy(tFr),
  closeLabel: tFr('close-label'),
  titleSvg: getLocaleSvgs('fr').home.heroHeading,
};

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

function withHeroEnvironment({
  pathname,
  formCopy,
  privacyCopy,
  closeLabel,
}: {
  pathname: string;
  formCopy: typeof enCopies.form;
  privacyCopy: typeof enCopies.privacy;
  closeLabel: string;
}): Decorator {
  return function WithHeroEnvironmentDecorator(Story) {
    const restoreReducedMotion = (() => {
      __setStorybookPathname(pathname);
      return __forceReducedMotion();
    })();

    function HeroEnvironmentDecorator() {
      useEffect(() => restoreReducedMotion, []);
      return (
        <SiteProviders
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={closeLabel}
          turnstileSiteKey={null}
        >
          <GlobalStyleOverrides />
          <Story />
        </SiteProviders>
      );
    }

    return <HeroEnvironmentDecorator />;
  };
}

const meta: Meta<typeof Hero> = {
  title: 'Sections/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const HomeEn: Story = {
  name: 'Home (EN)',
  decorators: [
    withHeroEnvironment({
      pathname: '/en',
      formCopy: enCopies.form,
      privacyCopy: enCopies.privacy,
      closeLabel: enCopies.closeLabel,
    }),
  ],
  render: () => (
    <Hero
      id="hero"
      copy={enCopies.hero}
      headingAnimated={false}
      TitleSvg={enCopies.titleSvg}
      Bg={HeroHomeBg}
    />
  ),
};

export const HomeFr: Story = {
  name: 'Home (FR)',
  decorators: [
    withHeroEnvironment({
      pathname: '/fr',
      formCopy: frCopies.form,
      privacyCopy: frCopies.privacy,
      closeLabel: frCopies.closeLabel,
    }),
  ],
  render: () => (
    <Hero
      id="hero"
      copy={frCopies.hero}
      headingAnimated={false}
      TitleSvg={frCopies.titleSvg}
      Bg={HeroHomeBg}
    />
  ),
};
