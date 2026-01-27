import 'normalize.css';

import '@/styles/globals.css';
import '@/styles/typography.css';

import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;

