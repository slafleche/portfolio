import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: /^css-calipers$/,
        replacement: path.resolve(
          __dirname,
          './node_modules/css-calipers/dist/cjs/index.js',
        ),
      },
      {
        find: /^css-calipers\/mediaQueries$/,
        replacement: path.resolve(
          __dirname,
          './node_modules/css-calipers/dist/cjs/mediaQueries/index.js',
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      'tests/setupTests.ts',
    ],
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
    coverage: {
      enabled: false,
    },
  },
});
