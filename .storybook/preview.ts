import 'normalize.css';
import '@/styles/globals.css';
import '@/styles/fontFaces.css';
import '@/styles/typography.css';

import type { Preview } from '@storybook/react';

import {
  GOOGLE_FONT_PRECONNECTS,
  GOOGLE_FONT_URLS,
} from '@/data/generated/fonts/googleFonts.gen';
import { getRuntimeNodeEnv } from '@/lib/runtimeEnv';

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

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Components',
          [
            'Menu',
            'CaseStudy',
            'Accordion',
            'Projects',
            'Footer',
            [
              'Contact Form',
              [
                'Contact Form (open via hash)',
                'Privacy Policy (open via hash)',
              ],
            ],
          ],
        ],
      },
    },
  },
};

export default preview;
