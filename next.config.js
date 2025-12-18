import path from 'path';
import { fileURLToPath } from 'url';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import { notProd } from './src/lib/runtimeEnv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vanillaDebugLoaderPath = path.join(
  __dirname,
  'scripts',
  'vanillaDebugLoader.cjs',
);
const vanillaDebugTest = /\.css\.(ts|tsx|js|jsx|mjs|mts|cts)$/;

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MEASUREMENT_DEBUG:
      process.env.NEXT_PUBLIC_MEASUREMENT_DEBUG ??
      (notProd() ? '1' : '0'),
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'css-calipers': path.resolve(
        __dirname,
        'node_modules',
        'css-calipers',
        'dist',
        'cjs',
        'index.js',
      ),
    };

    if (
      !config.module.rules.some(
        (rule) =>
          Array.isArray(rule?.use) &&
          rule.use.some(
            (loader) =>
              typeof loader === 'object' &&
              loader?.loader === vanillaDebugLoaderPath,
          ),
      )
    ) {
      config.module.rules.unshift({
        test: vanillaDebugTest,
        enforce: 'pre',
        use: [
          {
            loader: vanillaDebugLoaderPath,
          },
        ],
      });
    }

    // SVG as React component by default
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      resourceQuery: {
        not: [
          /url/,
        ],
      }, // exclude *.svg?url
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            titleProp: true,
            ref: true,
            typescript: true,
            memo: true,
          },
        },
      ],
    });

    // Raw file URL when you add ?url
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /url/,
      type: 'asset/resource',
    });

    // Allow importing markdown content as raw strings
    config.module.rules.push({
      test: /\.md$/i,
      type: 'asset/source',
    });

    return config;
  },
};

export default withVanillaExtract(nextConfig);
