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

import { ContactDialogProvider } from '../contact/ContactDialogProvider';
import Menu from '../Menu';

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

const dispatchHashChange = () => {
  try {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } catch {
    window.dispatchEvent(new Event('hashchange'));
  }
};

function withHash(hash: string): Decorator {
  return function WithHashDecorator(Story) {
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
}

function withContactDialogProvider({
  pathname,
  nextFormCopy,
  nextPrivacyCopy,
  nextCloseLabel,
}: {
  pathname: string;
  nextFormCopy: typeof formCopy;
  nextPrivacyCopy: typeof privacyCopy;
  nextCloseLabel: string;
}): Decorator {
  return function WithContactDialogProviderDecorator(Story) {
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
            // Cloudflare Turnstile test key (always passes).
            // Loads the real Turnstile widget script in Storybook.
            turnstileSiteKey="1x00000000000000000000AA"
          >
            <GlobalStyleOverrides />
            <Story />
          </ContactDialogProvider>
        </WindowSizeProvider>
      );
    }

    return <ContactDialogProviderDecorator />;
  };
}

const meta: Meta = {
  title: 'Sections/Contact',
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: defaultViewports,
      pauseAnimationAtEnd: true,
    },
  },
  decorators: [
    withContactDialogProvider({
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
    withHash(sharedStrings.contactFormHash),
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
    withHash(sharedStrings.contactFormPolicyHash),
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
    withContactDialogProvider({
      pathname: '/fr',
      nextFormCopy: formCopyFr,
      nextPrivacyCopy: privacyCopyFr,
      nextCloseLabel: closeLabelFr,
    }),
    withHash(sharedStrings.contactFormHash),
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
    withContactDialogProvider({
      pathname: '/fr',
      nextFormCopy: formCopyFr,
      nextPrivacyCopy: privacyCopyFr,
      nextCloseLabel: closeLabelFr,
    }),
    withHash(sharedStrings.contactFormPolicyHash),
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
