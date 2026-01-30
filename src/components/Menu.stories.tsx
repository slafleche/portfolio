import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import {
  __forceReducedMotion,
  __setStorybookPathname,
} from '@/dev/storybook/nextNavigationShim';
import { defaultViewports } from '@/dev/storybookConfig';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import en from '@/lib/locales/translations/en';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { sharedStrings } from '@/lib/sharedStrings';

import { ContactDialogProvider } from './contact/ContactDialogProvider';
import Menu from './Menu';

const t = createSectionTranslator(en, en);
const menuCopy = buildMenuCopy(t);
const contact = buildContactCopy(t);
const contactFormCopy = buildContactFormCopy(t);
const privacyCopy = buildPrivacyCopy(t);
const closeLabel = t('close-label');

const applyMenuStoryEnvironment = () => {
  __setStorybookPathname('/en');
  return __forceReducedMotion();
};

const GlobalStyleOverrides = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = [
      '* { animation: none !important; transition: none !important; }',
      'html { scrollbar-gutter: auto !important; }',
      'html, body { overflow: hidden !important; }',
    ].join('\n');
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return null;
};

const WithMenuSetup: Decorator = (Story) => {
  const restoreReducedMotion = applyMenuStoryEnvironment();

  function MenuSetupDecorator() {
    useEffect(() => restoreReducedMotion, []);
    return (
      <WindowSizeProvider>
        <ContactDialogProvider
          formCopy={contactFormCopy}
          privacyCopy={privacyCopy}
          closeLabel={closeLabel}
        >
          <GlobalStyleOverrides />
          <Story />
        </ContactDialogProvider>
      </WindowSizeProvider>
    );
  }

  return <MenuSetupDecorator />;
};

const meta: Meta<typeof Menu> = {
  title: 'Sections/Menu',
  component: Menu,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
  decorators: [
    WithMenuSetup,
  ],
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  name: 'Menu (reduced motion)',
  render: () => (
    <Menu
      root="/en"
      locale="en"
      homeLabel={menuCopy.homeLabel}
      skipNavLabel={menuCopy.skipNavLabel}
      navLabel={menuCopy.navLabel}
      localeChangeLabel={menuCopy.languageLabel}
      anchorNavLabel={menuCopy.anchorLabel}
      anchorLinks={[
        { title: 'Case Studies', href: '#case-studies' },
        { title: 'Approach', href: '#approach' },
        { title: 'Site Architecture', href: '#architecture' },
        { title: 'Projects', href: '#projects' },
        { title: contact.title, href: '#contact' },
      ]}
      localeLinks={AVAILABLE_LOCALES.filter(
        (code) => code !== 'en',
      ).map((code) => ({ locale: code, label: LOCALE_LABELS[code] }))}
      ctaLabel={contact.labelFloating}
      ctaWatchId={sharedStrings.heroWaypointId}
      forceCtaVisible={true}
    />
  ),
};
