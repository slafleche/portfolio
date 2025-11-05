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
  light: string;
  dark: string;
  background: string;
  maskIcon: string;
  msTile: string;
};

export type FaviconCacheTokens = {
  prefix: string;
  hashLength: number;
};

export type FaviconOptions = {
  generateMaskable: boolean;
  generateBrowserConfig: boolean;
};

export type FaviconAppConfig = {
  startUrl: string;
  scope: string;
  display: 'browser' | 'minimal-ui' | 'standalone' | 'fullscreen';
  orientation: 'any' | 'portrait' | 'landscape';
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
  light: '#FFFFFF',
  dark: '#251A38',
  background: '#251A38',
  maskIcon: '#FFFFFF',
  msTile: '#251A38',
};

export const faviconAppConfig: FaviconAppConfig = {
  startUrl: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
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
  appConfig: faviconAppConfig,
  cache: faviconCacheTokens,
  options: faviconOptions,
} as const;
