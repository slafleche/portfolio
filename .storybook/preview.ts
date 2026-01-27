import 'normalize.css';
import '@/styles/globals.css';
import '@/styles/typography.css';

import type { Preview } from '@storybook/react';

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

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;
