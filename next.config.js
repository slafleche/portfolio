import path from 'path';
import { fileURLToPath } from 'url';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

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
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
	env: {
		NEXT_PUBLIC_MEASUREMENT_DEBUG:
			process.env.NEXT_PUBLIC_MEASUREMENT_DEBUG ??
			(isDev ? '1' : '0'),
	},
	webpack(config) {
		// keep your alias
		config.resolve.alias['@'] = path.resolve(__dirname, 'src');

		if (
			!config.module.rules.some((rule) =>
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

		return config;
	},
};

export default withVanillaExtract(nextConfig);
