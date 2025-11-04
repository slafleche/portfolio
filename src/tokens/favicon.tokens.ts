export type FaviconAssetPlan = {
  svgOutputName: string;
  pngSizes: number[];
  icoSizes: number[];
  appleTouchSize: number;
  androidChromeSizes: number[];
  maskableSize: number;
  browserConfigTileSize: number;
};

export type FaviconThemeColors = {
  lightThemeColor: string;
  darkThemeColor: string;
  backgroundColor: string;
  maskIconColor: string;
  msTileColor: string;
};

export type FaviconManifestTokens = {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  scope: string;
  display: 'browser' | 'minimal-ui' | 'standalone' | 'fullscreen';
  orientation: 'any' | 'portrait' | 'landscape';
  lang: string;
  categories: string[];
};

export type FaviconCacheTokens = {
  prefix: string;
  hashLength: number;
};

export type FaviconOptions = {
  generateMaskable: boolean;
  generateBrowserConfig: boolean;
};

export const faviconSourceSvg = 'src/assets/SVG/faviconMaster.svg';

export const faviconAssetPlan: FaviconAssetPlan = {
  svgOutputName: 'favicon.svg',
  pngSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384, 512],
  icoSizes: [16, 32, 48],
  appleTouchSize: 180,
  androidChromeSizes: [192, 512],
  maskableSize: 512,
  browserConfigTileSize: 150,
};

export const faviconThemeColors: FaviconThemeColors = {
  lightThemeColor: '#FFFFFF',
  darkThemeColor: '#251A38',
  backgroundColor: '#251A38',
  maskIconColor: '#FFFFFF',
  msTileColor: '#251A38',
};

export const faviconManifestTokens: FaviconManifestTokens = {
  name: 'Portfolio',
  shortName: 'Portfolio',
  description: 'Personal portfolio progressive web app.',
  startUrl: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  lang: 'en',
  categories: ['portfolio', 'personal'],
};

export const faviconCacheTokens: FaviconCacheTokens = {
  prefix: 'favicons',
  hashLength: 8,
};

export const faviconOptions: FaviconOptions = {
  generateMaskable: true,
  generateBrowserConfig: true,
};

export const faviconTokens = {
  sourceSvg: faviconSourceSvg,
  assetPlan: faviconAssetPlan,
  themeColors: faviconThemeColors,
  manifest: faviconManifestTokens,
  cache: faviconCacheTokens,
  options: faviconOptions,
} as const;
