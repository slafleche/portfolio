import { assertUnit } from '@/styles/measurementKit';
import { archVars, menuVars } from '../../styles/componentTokens/global.componentTokens';
if (process.env.NODE_ENV !== 'production') {
  assertUnit(menuVars.height, 'px', 'menuUtils menu height');
  assertUnit(
    menuVars.padding.horizontal,
    'px',
    'menuUtils padding horizontal',
  );
  assertUnit(
    menuVars.padding.vertical,
    'px',
    'menuUtils padding vertical',
  );
  assertUnit(menuVars.yOffset, 'px', 'menuUtils yOffset');
  assertUnit(archVars.top, 'px', 'menuUtils arch top');
  assertUnit(
    archVars.curveHeight,
    'px',
    'menuUtils arch curveHeight',
  );
  assertUnit(archVars.ry, 'px', 'menuUtils arch ry');
  assertUnit(archVars.bumpWidth, 'px', 'menuUtils arch bumpWidth');
  assertUnit(archVars.bumpHeight, 'px', 'menuUtils arch bumpHeight');
}

export type AnchorEntry = {
  hrefKey: string;
};

export type LinkMetric = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  archY: number;
  highlightWidth: number;
  highlightHeight: number;
  left: number;
  top: number;
};

export type HighlightState = {
  visible: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type HighlightBox = Pick<
  HighlightState,
  'left' | 'top' | 'width' | 'height'
>;

export type DebugArch = {
  path: string;
  width: number;
  height: number;
};

export const MINI_BOKEH_CACHE_KEY =
  'portfolio/menu/last-mini-bokeh-target';
export const LOGO_CACHE_VALUE = '__logo__';

export const BASE_ANCHORS: readonly AnchorEntry[] = [
  {
    hrefKey: 'approach',
  },
  {
    hrefKey: 'about',
  },
  {
    hrefKey: 'case_study',
  },
  {
    hrefKey: 'projects',
  },
];

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const metricToHighlightBox = (
  metric: LinkMetric,
): HighlightBox => ({
  left: metric.left,
  top: metric.top,
  width: metric.highlightWidth,
  height: metric.highlightHeight,
});

const rxFrom = (width: number, curveHeight: number, ry: number) => {
  const c = curveHeight / ry;
  const denom = Math.max(1e-6, 2 * c - c * c);
  return width / 2 / Math.sqrt(denom);
};

export const computeArchY = (
  width: number,
  x: number,
  includeBump = false,
) => {
  const top = archVars.top.value;
  const curveHeight = archVars.curveHeight.value;
  const ry = archVars.ry.value;
  const bumpWidth = archVars.bumpWidth.value;
  const bumpHeight = archVars.bumpHeight.value;
  const cx = width / 2;
  const cy = top + ry;
  const rx = rxFrom(width, curveHeight, ry);
  const normalized = clamp((x - cx) / rx, -1, 1);
  const ellipseComponent = Math.sqrt(
    Math.max(0, 1 - normalized * normalized),
  );
  let y = cy - ry * ellipseComponent;

  const halfBump = bumpWidth / 2;
  if (includeBump && halfBump > 0) {
    const distance = Math.abs(x - cx);
    if (distance <= halfBump) {
      const t = 1 - distance / halfBump;
      const eased = t * t;
      y += bumpHeight * eased;
    }
  }

  return Math.min(y, top + curveHeight);
};

export const computeCenteredHighlight = (navMetrics: {
  width: number;
  height: number;
}): HighlightBox => {
  const navWidth = navMetrics.width;
  const fallbackWidth = navWidth
    ? Math.min(
        navWidth,
        menuVars.height.value + menuVars.padding.vertical.value,
      )
    : menuVars.height.value + menuVars.padding.vertical.value;
  const highlightHeight = menuVars.height.value;
  const centerX = navWidth ? navWidth / 2 : fallbackWidth / 2;
  const centerY = navWidth
    ? computeArchY(navWidth, centerX) + menuVars.yOffset.value
    : highlightHeight / 2;
  const left = centerX - fallbackWidth / 2;
  const top = Math.max(0, centerY - highlightHeight / 2);
  return {
    left,
    top,
    width: fallbackWidth,
    height: highlightHeight,
  };
};

export const getCacheValueForIndex = (
  index: number,
  anchors: readonly AnchorEntry[],
): string | null => {
  if (index === 0) return LOGO_CACHE_VALUE;
  const anchor = anchors[index - 1];
  return anchor?.hrefKey ?? null;
};

export const resolveIndexFromCacheValue = (
  value: string | null,
  anchors: readonly AnchorEntry[],
): number | null => {
  if (!value) return null;
  if (value === LOGO_CACHE_VALUE) return 0;
  const anchorIndex = anchors.findIndex(
    (anchor) => anchor.hrefKey === value,
  );
  return anchorIndex >= 0 ? anchorIndex + 1 : null;
};
