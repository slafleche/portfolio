import 'normalize.css';
import '@/styles/globals.css';
import '@/styles/fontFaces.css';
import '@/styles/typography.css';

import type { Preview } from '@storybook/react';
import { createElement } from 'react';

import {
  GOOGLE_FONT_PRECONNECTS,
  GOOGLE_FONT_URLS,
} from '@/data/generated/fonts/googleFonts.gen';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { createSectionTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import en from '@/lib/locales/translations/en';
import { getRuntimeNodeEnv } from '@/lib/runtimeEnv';

import SiteProviders from '../src/components/site/SiteProviders.client';

if (typeof globalThis.process === 'undefined') {
  const nodeEnvKey = [
    'NODE',
    'ENV',
  ].join('_');

  const env: Record<string, string> = {};
  Object.defineProperty(env, nodeEnvKey, {
    value: getRuntimeNodeEnv(),
    enumerable: true,
  });

  (globalThis as any).process = {
    env,
  };
}

const ensureHeadLink = (props: Record<string, string>) => {
  if (typeof document === 'undefined') return;

  const selectorParts = Object.entries(props).map(
    ([key, value]) => `[${key}="${CSS.escape(value)}"]`,
  );
  const selector = `link${selectorParts.join('')}`;
  if (document.head.querySelector(selector)) return;

  const link = document.createElement('link');
  for (const [key, value] of Object.entries(props)) {
    link.setAttribute(key, value);
  }
  document.head.appendChild(link);
};

if (typeof document !== 'undefined') {
  for (const preconnect of GOOGLE_FONT_PRECONNECTS) {
    ensureHeadLink({
      rel: 'preconnect',
      href: preconnect.href,
      ...(preconnect.crossOrigin ? { crossOrigin: 'anonymous' } : {}),
    });
  }

  for (const href of GOOGLE_FONT_URLS) {
    ensureHeadLink({
      rel: 'stylesheet',
      href,
    });
  }
}

const storyTranslator = createSectionTranslator(en, en);
const storyFormCopy = buildContactFormCopy(storyTranslator);
const storyPrivacyCopy = buildPrivacyCopy(storyTranslator);
const storyCloseLabel = storyTranslator('close-label');

const preview: Preview = {
  decorators: [
    function WithSiteProviders(Story) {
      return createElement(
        SiteProviders,
        {
          formCopy: storyFormCopy,
          privacyCopy: storyPrivacyCopy,
          closeLabel: storyCloseLabel,
          turnstileSiteKey: null,
        },
        createElement(Story),
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Sections',
          [
            'Menu',
            'Hero',
            'CaseStudy',
            'Accordion',
            'Approach',
            'Projects',
            'Footer',
            [
              'Contact',
              [
                'Contact Form (EN)',
                'Privacy Policy (EN)',
                'Contact Form (FR)',
                'Privacy Policy (FR)',
              ],
            ],
          ],
          'SVGs',
          [
            'Icons',
            'Logos',
          ],
        ],
      },
    },
  },
};

export default preview;
