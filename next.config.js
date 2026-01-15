import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getNodeEnv,
  getPublicMeasurementDebug,
  notRelease,
} from './envPrimitives.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vanillaDebugLoaderPath = path.join(
  __dirname,
  'scripts',
  'vanillaDebugLoader.cjs',
);
const vanillaDebugTest = /\.css\.(ts|tsx|js|jsx|mjs|mts|cts)$/;

const withVanillaExtract = createVanillaExtractPlugin();

const getPublicVercelEnv = () => {
  const env = getNodeEnv();
  if (env === 'release') return 'production';
  if (env === 'staging') return 'preview';
  return 'development';
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: getPublicVercelEnv(),
    NEXT_PUBLIC_MEASUREMENT_DEBUG:
      getPublicMeasurementDebug() ??
      (notRelease() ? '1' : '0'),
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
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

    const svgrRule = {
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
    };

    // SVG as React component by default
    const oneOfRule = config.module.rules.find(
      (rule) => Array.isArray(rule?.oneOf),
    );
    if (oneOfRule) {
      oneOfRule.oneOf.unshift(svgrRule);
    } else {
      config.module.rules.push(svgrRule);
    }

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
