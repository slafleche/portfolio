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

export type FaviconBackgroundVariant = 'square' | 'circular';

export type FaviconFormatMeta = {
  background: FaviconBackgroundVariant;
  note?: string;
};

export type FaviconFormatManifest = {
  generalPng: {
    type: 'png';
    sizes: number[];
    meta: FaviconFormatMeta;
  };
  faviconSvg: {
    type: 'svg';
    meta: FaviconFormatMeta;
  };
  faviconIco: {
    type: 'ico';
    sizes: number[];
    meta: FaviconFormatMeta;
  };
  appleTouch: {
    type: 'png';
    size: number;
    meta: FaviconFormatMeta;
  };
  maskable: {
    type: 'png';
    size: number;
    meta: FaviconFormatMeta;
  };
  android: {
    type: 'png';
    sizes: number[];
    meta: FaviconFormatMeta;
  };
  tile: {
    type: 'png';
    size: number;
    meta: FaviconFormatMeta;
  };
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
  pngSizes: [
    16,
    32,
    48,
    64,
    96,
    128,
    192,
    256,
    384,
    512,
  ],
  icoSizes: [
    16,
    32,
    48,
  ],
  appleTouchSize: 180,
  androidChromeSizes: [
    192,
    512,
  ],
  maskableSize: 512,
  browserConfigTileSize: 150,
};

export const faviconThemeColors: FaviconThemeColors = {
  light: '#FFFFFF',
  dark: '#251A38',
  background: '#251A38',
  maskIcon: '#FFFFFF',
  msTile: '#a478efff',
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

export const faviconFormatManifest: FaviconFormatManifest = {
  generalPng: {
    type: 'png',
    sizes: faviconAssetPlan.pngSizes,
    meta: {
      background: 'circular',
    },
  },
  faviconSvg: {
    type: 'svg',
    meta: {
      background: 'circular',
    },
  },
  faviconIco: {
    type: 'ico',
    sizes: faviconAssetPlan.icoSizes,
    meta: {
      background: 'circular',
      note: 'Shares raster source with general PNG set',
    },
  },
  appleTouch: {
    type: 'png',
    size: faviconAssetPlan.appleTouchSize,
    meta: {
      background: 'square',
      note: 'iOS applies rounded rectangle mask at install',
    },
  },
  maskable: {
    type: 'png',
    size: faviconAssetPlan.maskableSize,
    meta: {
      background: 'square',
      note: 'Provide safe padding for Android maskable icons',
    },
  },
  android: {
    type: 'png',
    sizes: faviconAssetPlan.androidChromeSizes,
    meta: {
      background: 'square',
      note: 'Android launcher icons receive OS masking',
    },
  },
  tile: {
    type: 'png',
    size: faviconAssetPlan.browserConfigTileSize,
    meta: {
      background: 'circular',
      note: 'Windows tiles render PNG as-is; keep circle',
    },
  },
};

export const faviconTokens = {
  sourceSvg: faviconSourceSvg,
  assetPlan: faviconAssetPlan,
  themeColors: faviconThemeColors,
  appConfig: faviconAppConfig,
  cache: faviconCacheTokens,
  options: faviconOptions,
  formatManifest: faviconFormatManifest,
} as const;
