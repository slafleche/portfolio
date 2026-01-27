import 'normalize.css';
import '@/styles/globals.css';
import '@/styles/typography.css';

import type { Preview } from '@storybook/react';

if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: {
      NODE_ENV: 'development',
    },
  };
}

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;
