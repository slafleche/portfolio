import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    const existingAlias = viteConfig.resolve?.alias;
    const normalizedAlias = Array.isArray(existingAlias)
      ? existingAlias
      : existingAlias
        ? [existingAlias]
        : [];

    return {
      ...viteConfig,
      plugins: [
        ...(viteConfig.plugins ?? []),
        vanillaExtractPlugin(),
      ],
      resolve: {
        ...(viteConfig.resolve ?? {}),
        alias: [
          ...normalizedAlias,
          {
            find: '@',
            replacement: path.resolve(configDir, '../src'),
          },
        ],
      },
    };
  },
};

export default config;
