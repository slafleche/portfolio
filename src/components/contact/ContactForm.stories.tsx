import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect, useLayoutEffect } from 'react';

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
import fr from '@/lib/locales/translations/fr';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { sharedStrings } from '@/lib/sharedStrings';

import Menu from '../Menu';
import { ContactDialogProvider } from './ContactDialogProvider';

const t = createSectionTranslator(en, en);
const menuCopy = buildMenuCopy(t);
const contact = buildContactCopy(t);
const formCopy = buildContactFormCopy(t);
const privacyCopy = buildPrivacyCopy(t);
const closeLabel = t('close-label');

const tFr = createSectionTranslator(fr, en);
const menuCopyFr = buildMenuCopy(tFr);
const contactFr = buildContactCopy(tFr);
const formCopyFr = buildContactFormCopy(tFr);
const privacyCopyFr = buildPrivacyCopy(tFr);
const closeLabelFr = tFr('close-label');

const GlobalStyleOverrides = () => {
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
};

const dispatchHashChange = () => {
  try {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } catch {
    window.dispatchEvent(new Event('hashchange'));
  }
};

const WithHash =
  (hash: string): Decorator =>
  (Story) => {
    function HashDecorator() {
      useLayoutEffect(() => {
        const previousHash = window.location.hash;
        const { pathname, search } = window.location;

        window.history.replaceState(
          window.history.state,
          '',
          `${pathname}${search}${hash}`,
        );
        dispatchHashChange();

        return () => {
          const nextUrl = `${pathname}${search}${previousHash}`;
          window.history.replaceState(
            window.history.state,
            '',
            nextUrl,
          );
          dispatchHashChange();
        };
      }, []);

      return <Story />;
    }

    return <HashDecorator />;
  };

const WithContactDialogProvider =
  ({
    pathname,
    nextFormCopy,
    nextPrivacyCopy,
    nextCloseLabel,
  }: {
    pathname: string;
    nextFormCopy: typeof formCopy;
    nextPrivacyCopy: typeof privacyCopy;
    nextCloseLabel: string;
  }): Decorator =>
  (Story) => {
    function ContactDialogProviderDecorator() {
      useLayoutEffect(() => {
        __setStorybookPathname(pathname);
        const restoreReducedMotion = __forceReducedMotion();

        return () => {
          restoreReducedMotion();
        };
      }, []);

      return (
        <WindowSizeProvider>
          <ContactDialogProvider
            formCopy={nextFormCopy}
            privacyCopy={nextPrivacyCopy}
            closeLabel={nextCloseLabel}
            turnstileSiteKey={null}
          >
            <GlobalStyleOverrides />
            <Story />
          </ContactDialogProvider>
        </WindowSizeProvider>
      );
    }

    return <ContactDialogProviderDecorator />;
  };

const meta: Meta = {
  title: 'Components/Contact Form',
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
  decorators: [
    WithContactDialogProvider({
      pathname: '/en',
      nextFormCopy: formCopy,
      nextPrivacyCopy: privacyCopy,
      nextCloseLabel: closeLabel,
    }),
  ],
};

export default meta;

type Story = StoryObj;

export const OpenDialog: Story = {
  name: 'Contact Form (EN)',
  decorators: [
    WithHash(sharedStrings.contactFormHash),
  ],
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

export const OpenPrivacy: Story = {
  name: 'Privacy Policy (EN)',
  decorators: [
    WithHash(sharedStrings.contactFormPolicyHash),
  ],
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

export const OpenDialogFr: Story = {
  name: 'Contact Form (FR)',
  decorators: [
    WithContactDialogProvider({
      pathname: '/fr',
      nextFormCopy: formCopyFr,
      nextPrivacyCopy: privacyCopyFr,
      nextCloseLabel: closeLabelFr,
    }),
    WithHash(sharedStrings.contactFormHash),
  ],
  render: () => (
    <Menu
      root="/fr"
      locale="fr"
      homeLabel={menuCopyFr.homeLabel}
      skipNavLabel={menuCopyFr.skipNavLabel}
      navLabel={menuCopyFr.navLabel}
      localeChangeLabel={menuCopyFr.languageLabel}
      anchorNavLabel={menuCopyFr.anchorLabel}
      anchorLinks={[
        { title: 'Case Studies', href: '#case-studies' },
        { title: 'Approach', href: '#approach' },
        { title: 'Projects', href: '#projects' },
        { title: contactFr.title, href: '#contact' },
      ]}
      localeLinks={AVAILABLE_LOCALES.filter(
        (code) => code !== 'fr',
      ).map((code) => ({ locale: code, label: LOCALE_LABELS[code] }))}
      ctaLabel={contactFr.labelFloating}
      ctaWatchId={sharedStrings.heroWaypointId}
      forceCtaVisible={true}
    />
  ),
};

export const OpenPrivacyFr: Story = {
  name: 'Privacy Policy (FR)',
  decorators: [
    WithContactDialogProvider({
      pathname: '/fr',
      nextFormCopy: formCopyFr,
      nextPrivacyCopy: privacyCopyFr,
      nextCloseLabel: closeLabelFr,
    }),
    WithHash(sharedStrings.contactFormPolicyHash),
  ],
  render: () => (
    <Menu
      root="/fr"
      locale="fr"
      homeLabel={menuCopyFr.homeLabel}
      skipNavLabel={menuCopyFr.skipNavLabel}
      navLabel={menuCopyFr.navLabel}
      localeChangeLabel={menuCopyFr.languageLabel}
      anchorNavLabel={menuCopyFr.anchorLabel}
      anchorLinks={[
        { title: 'Case Studies', href: '#case-studies' },
        { title: 'Approach', href: '#approach' },
        { title: 'Projects', href: '#projects' },
        { title: contactFr.title, href: '#contact' },
      ]}
      localeLinks={AVAILABLE_LOCALES.filter(
        (code) => code !== 'fr',
      ).map((code) => ({ locale: code, label: LOCALE_LABELS[code] }))}
      ctaLabel={contactFr.labelFloating}
      ctaWatchId={sharedStrings.heroWaypointId}
      forceCtaVisible={true}
    />
  ),
};
