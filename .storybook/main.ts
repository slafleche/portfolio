import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(configDir, '../src');

const config: StorybookConfig = {
  staticDirs: [
    {
      from: '../public/svgs',
      to: '/svgs',
    },
  ],
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
      // Storybook (Vite) copies Vite's `publicDir` into the build output.
      // This repo has `public/index.html` + `public/main.js`, which would
      // overwrite Storybook's own `index.html` and make Chromatic show the app
      // ("Hello / Welcome to the site") instead of the Storybook manager.
      publicDir: false,
      plugins: [
        ...(viteConfig.plugins ?? []),
        vanillaExtractPlugin(),
      ],
      resolve: {
        ...(viteConfig.resolve ?? {}),
        alias: [
          ...normalizedAlias,
          {
            find: 'next/link',
            replacement: path.resolve(
              srcDir,
              'dev/storybook/nextLinkShim.tsx',
            ),
          },
          {
            find: 'next/navigation',
            replacement: path.resolve(
              srcDir,
              'dev/storybook/nextNavigationShim.ts',
            ),
          },
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
