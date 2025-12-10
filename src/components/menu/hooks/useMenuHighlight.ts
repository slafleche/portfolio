import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import transforms from '@/styles/helpers/transforms.helper';
import { assertUnit, m } from 'css-calipers';
import type { CSSProperties } from 'react';
import {
  BASE_ANCHORS,
  MINI_BOKEH_CACHE_KEY,
  computeArchY,
  computeCenteredHighlight,
  getCacheValueForIndex,
  metricToHighlightBox,
  resolveIndexFromCacheValue,
  type AnchorEntry,
  type DebugArch,
  type HighlightState,
  type LinkMetric,
} from '../menuUtils';
import { archVars } from '../../../tokens/global.tokens';
import { menuVars } from '../../../styles/componentTokens/menu.componentTokens';

type HighlightStyles = {
  containerStyle: CSSProperties;
  innerStyle: CSSProperties;
};

const snapToDevicePixel = (value: number, dpr: number): number => {
  if (!Number.isFinite(value)) return value;
  const ratio = dpr > 0 ? dpr : 1;
  return Math.round(value * ratio) / ratio;
};

if (process.env.NODE_ENV !== 'production') {
  assertUnit(menuVars.height, 'px', 'useMenuHighlight menu height');
  assertUnit(
    menuVars.paddings.horizontal,
    'px',
    'useMenuHighlight padding horizontal',
  );
  assertUnit(menuVars.yOffset, 'px', 'useMenuHighlight yOffset');

  assertUnit(
    menuVars.hover.shadow.spread,
    'px',
    'useMenuHighlight hover shadow spread',
  );
  assertUnit(archVars.top, 'px', 'useMenuHighlight arch top');
  assertUnit(
    archVars.curveHeight,
    'px',
    'useMenuHighlight arch curveHeight',
  );
}

/**
 * Developer-only knobs to inspect the menu highlight ("mini bokeh").
 *
 * - ShowArchPath: draw the sampled arch as a dashed SVG path.
 * - LockTo: keep the highlight locked on the logo (`'logo'`) or a
 *   specific menu index (0-based, logo is 0, first item is 1).
 * - DisableTimeout: prevent the blob from fading out when idle.
 * - RaiseLayer: bump the highlight layer above other content (useful
 *   when hero/video would otherwise cover it). Defaults to true when
 *   `lockTo` is provided.
 */
export type MiniBokehDebugOptions = {
  showArchPath?: boolean;
  lockTo?: 'logo' | number;
  disableTimeout?: boolean;
  raiseLayer?: boolean;
};

type UseMenuHighlightOptions = {
  anchors?: readonly AnchorEntry[];
  anchorCount: number;
  bokehDebug?: MiniBokehDebugOptions;
  fontsReady: boolean;
  animationEnabled?: boolean;
};

export function useMenuHighlight({
  anchors = BASE_ANCHORS,
  anchorCount,
  bokehDebug,
  fontsReady,
  animationEnabled = true,
}: UseMenuHighlightOptions) {
  const debugOptions = bokehDebug ?? {};
  const {
    showArchPath = false,
    lockTo,
    disableTimeout = false,
    raiseLayer = false,
  } = debugOptions;
  const debugActive =
    showArchPath ||
    disableTimeout ||
    raiseLayer ||
    lockTo !== undefined;
  const highlightEnabled = animationEnabled || debugActive;
  const maxAnchorIndex = Math.max(0, anchorCount - 1);
  const requestedLockIndex = (() => {
    if (lockTo === undefined) return null;
    if (lockTo === 'logo') return 0;
    if (Number.isFinite(lockTo)) {
      const rounded = Math.round(lockTo);
      return rounded;
    }
    return null;
  })();
  const lockTargetIndex =
    requestedLockIndex == null
      ? null
      : Math.min(Math.max(0, requestedLockIndex), maxAnchorIndex);
  const isLocked = lockTargetIndex !== null;
  const navRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [
    linkMetrics,
    setLinkMetrics,
  ] = useState<Array<LinkMetric | null>>([]);
  const linkMetricsRef = useRef<Array<LinkMetric | null>>([]);
  const lastMetricRef = useRef<LinkMetric | null>(null);
  const [
    highlight,
    setHighlight,
  ] = useState<HighlightState>({
    visible: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const highlightRef = useRef(highlight);
  const [
    transitionDisabled,
    setTransitionDisabled,
  ] = useState(false);
  const navMetricsRef = useRef<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [
    navMetrics,
    setNavMetrics,
  ] = useState({
    width: 0,
    height: 0,
  });
  const [
    debugArch,
    setDebugArch,
  ] = useState<DebugArch | null>(null);
  const [
    miniBokehActive,
    setMiniBokehActive,
  ] = useState(false);
  useEffect(() => {
    if (highlightEnabled) return;
    const frameId = requestAnimationFrame(() => {
      setMiniBokehActive(false);
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    highlightEnabled,
  ]);
  const miniBokehTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(null);
  useEffect(() => {
    if (highlightEnabled) return;
    lastMetricRef.current = null;
    const frameId = requestAnimationFrame(() => {
      setActiveIndex(null);
      setTransitionDisabled(true);
      setHighlight((prev) =>
        prev.visible
          ? {
              ...prev,
              visible: false,
            }
          : prev,
      );
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    highlightEnabled,
  ]);

  const registerLinkRef = useCallback(
    (index: number, el: HTMLAnchorElement | null) => {
      if (index < 0 || index >= anchorCount) return;
      linkRefs.current[index] = el;
    },
    [
      anchorCount,
    ],
  );
  const lastHoverIndexRef = useRef<number | null>(null);
  const hasResolvedHoverFromCacheRef = useRef(false);
  const lastPersistedCacheValueRef = useRef<string | null>(null);
  const hasActivatedRef = useRef(false);

  useEffect(() => {
    highlightRef.current = highlight;
  }, [
    highlight,
  ]);

  useEffect(() => {
    if (!highlightEnabled) {
      return undefined;
    }
    let frameId: number | null = null;
    if (miniBokehTimerRef.current) {
      clearTimeout(miniBokehTimerRef.current);
      miniBokehTimerRef.current = null;
    }
    if (isLocked) {
      frameId = requestAnimationFrame(() => {
        setMiniBokehActive(true);
      });
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }
    if (disableTimeout) {
      frameId = requestAnimationFrame(() => {
        setMiniBokehActive(highlight.visible);
      });
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }
    if (highlight.visible) {
      frameId = requestAnimationFrame(() => {
        setMiniBokehActive(true);
      });
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
        if (miniBokehTimerRef.current) {
          clearTimeout(miniBokehTimerRef.current);
          miniBokehTimerRef.current = null;
        }
      };
    }
    miniBokehTimerRef.current = setTimeout(() => {
      setMiniBokehActive(false);
      miniBokehTimerRef.current = null;
    }, 120);
    return () => {
      if (miniBokehTimerRef.current) {
        clearTimeout(miniBokehTimerRef.current);
        miniBokehTimerRef.current = null;
      }
    };
  }, [
    highlight.visible,
    lockTargetIndex,
    disableTimeout,
    isLocked,
    highlightEnabled,
  ]);

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!highlightEnabled) return;
    if (isLocked) return;
    if (hasResolvedHoverFromCacheRef.current) return;
    if (typeof window === 'undefined') return;
    hasResolvedHoverFromCacheRef.current = true;
    try {
      const cachedValue = window.localStorage.getItem(
        MINI_BOKEH_CACHE_KEY,
      );
      lastPersistedCacheValueRef.current = cachedValue;
      const resolvedIndex = resolveIndexFromCacheValue(
        cachedValue,
        anchors,
      );
      if (resolvedIndex != null) {
        lastHoverIndexRef.current = resolvedIndex;
      }
    } catch {
      lastPersistedCacheValueRef.current = null;
    }
  }, [
    anchors,
    isLocked,
    highlightEnabled,
  ]);

  useEffect(() => {
    linkRefs.current = new Array<HTMLAnchorElement | null>(
      anchorCount,
    ).fill(null);
    const emptyMetrics = new Array<LinkMetric | null>(
      anchorCount,
    ).fill(null);
    linkMetricsRef.current = emptyMetrics;
    const frameId = requestAnimationFrame(() => {
      setLinkMetrics(emptyMetrics);
    });
    lastMetricRef.current = null;
    return () => cancelAnimationFrame(frameId);
  }, [
    anchorCount,
  ]);

  const persistLastHover = useCallback(
    (index: number | null) => {
      if (!highlightEnabled) return;
      if (isLocked) return;
      if (typeof window === 'undefined') return;
      try {
        if (index == null) {
          window.localStorage.removeItem(MINI_BOKEH_CACHE_KEY);
          lastPersistedCacheValueRef.current = null;
          return;
        }
        const cacheValue = getCacheValueForIndex(index, anchors);
        if (!cacheValue) {
          window.localStorage.removeItem(MINI_BOKEH_CACHE_KEY);
          lastPersistedCacheValueRef.current = null;
          return;
        }
        if (lastPersistedCacheValueRef.current === cacheValue) return;
        window.localStorage.setItem(MINI_BOKEH_CACHE_KEY, cacheValue);
        lastPersistedCacheValueRef.current = cacheValue;
      } catch {
        // Ignore storage errors (quota exceeded, private mode, etc.).
      }
    },
    [
      highlightEnabled,
      anchors,
      isLocked,
    ],
  );

  const updateHighlightFromMetric = useCallback(
    (metric?: LinkMetric) => {
      if (!highlightEnabled) return;
      if (!metric) return;
      const navMetrics = navMetricsRef.current;

      if (!highlightRef.current.visible) {
        setTransitionDisabled(true);
        const previous = lastMetricRef.current;
        let startLeft = metric.left;
        let startTop = metric.top;
        let startWidth = metric.highlightWidth;
        let startHeight = metric.highlightHeight;

        if (previous) {
          startLeft = previous.left;
          startTop = previous.top;
          startWidth = previous.highlightWidth;
          startHeight = previous.highlightHeight;
        } else {
          const cachedMetric =
            lastHoverIndexRef.current != null
              ? linkMetricsRef.current[lastHoverIndexRef.current]
              : null;
          const origin =
            cachedMetric && hasActivatedRef.current
              ? metricToHighlightBox(cachedMetric)
              : computeCenteredHighlight(navMetrics);
          startLeft = origin.left;
          startTop = origin.top;
          startWidth = origin.width;
          startHeight = origin.height;
        }

        setHighlight({
          visible: false,
          left: startLeft,
          top: startTop,
          width: startWidth,
          height: startHeight,
        });

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          animationFrameRef.current = null;
          setTransitionDisabled(false);
          setHighlight({
            visible: true,
            left: metric.left,
            top: metric.top,
            width: metric.highlightWidth,
            height: metric.highlightHeight,
          });
          lastMetricRef.current = metric;
        });
        return;
      }

      setHighlight({
        visible: true,
        left: metric.left,
        top: metric.top,
        width: metric.highlightWidth,
        height: metric.highlightHeight,
      });
      lastMetricRef.current = metric;
    },
    [
      highlightEnabled,
    ],
  );

  const hideHighlight = useCallback(() => {
    if (!highlightEnabled) return;
    if (isLocked) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastMetricRef.current = null;
    setActiveIndex(null);
    setHighlight((prev) =>
      prev.visible ? { ...prev, visible: false } : prev,
    );
    persistLastHover(null);
  }, [
    highlightEnabled,
    persistLastHover,
    isLocked,
  ]);

  const measure = useCallback(() => {
    const canMeasureLayout =
      fontsReady || !highlightEnabled || debugActive;
    if (!canMeasureLayout) return;
    const navEl = navRef.current;
    if (!navEl) return;

    const navRect = navEl.getBoundingClientRect();
    const dpr =
      typeof window !== 'undefined' &&
      Number.isFinite(window.devicePixelRatio)
        ? window.devicePixelRatio || 1
        : 1;
    const navWidth = snapToDevicePixel(navRect.width, dpr);
    const navHeight = snapToDevicePixel(navRect.height, dpr);
    if (!navWidth) return;
    navMetricsRef.current = {
      width: navWidth,
      height: navHeight,
    };
    setNavMetrics((prev) =>
      prev.width === navWidth && prev.height === navHeight
        ? prev
        : {
            width: navWidth,
            height: navHeight,
          },
    );
    const metrics: Array<LinkMetric | null> = linkRefs.current.map(
      () => null,
    );

    linkRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = snapToDevicePixel(
        rect.left + rect.width / 2 - navRect.left,
        dpr,
      );
      const centerY = snapToDevicePixel(
        rect.top + rect.height / 2 - navRect.top,
        dpr,
      );
      const width = snapToDevicePixel(rect.width, dpr);
      const height = snapToDevicePixel(rect.height, dpr);
      const archBase =
        computeArchY(navWidth, centerX) + menuVars.yOffset.getValue();
      metrics[index] = {
        centerX,
        centerY,
        width,
        height,
        archY: snapToDevicePixel(archBase, dpr),
        highlightWidth: 0,
        highlightHeight: 0,
        left: 0,
        top: 0,
      };
    });

    const definedMetrics = metrics.filter(
      (metric): metric is LinkMetric => Boolean(metric),
    );

    if (!definedMetrics.length) {
      setLinkMetrics(metrics);
      return;
    }

    const adjustment =
      definedMetrics.reduce(
        (sum, metric) => sum + (metric.centerY - metric.archY),
        0,
      ) / definedMetrics.length;

    const highlightHeightValue = menuVars.height.getValue();
    const widthPaddingValue = menuVars.paddings.horizontal.getValue();

    definedMetrics.forEach((metric) => {
      const archY = snapToDevicePixel(metric.archY + adjustment, dpr);
      const highlightWidth = snapToDevicePixel(
        Math.max(metric.width, metric.width + widthPaddingValue),
        dpr,
      );
      const highlightHeight = snapToDevicePixel(
        highlightHeightValue,
        dpr,
      );
      const left = snapToDevicePixel(
        metric.centerX - highlightWidth / 2,
        dpr,
      );
      const top = snapToDevicePixel(archY - highlightHeight / 2, dpr);
      metric.archY = archY;
      metric.highlightWidth = highlightWidth;
      metric.highlightHeight = highlightHeight;
      metric.left = left;
      metric.top = top;
    });

    linkMetricsRef.current = metrics;
    setLinkMetrics(metrics);

    if (
      highlightEnabled &&
      activeIndex != null &&
      highlightRef.current.visible
    ) {
      updateHighlightFromMetric(metrics[activeIndex] ?? undefined);
    }

    if (showArchPath) {
      const sampleCount = Math.max(24, Math.round(navWidth / 20));
      let path = '';
      for (let i = 0; i < sampleCount; i += 1) {
        const x = (navWidth * i) / (sampleCount - 1);
        const y =
          computeArchY(navWidth, x) + menuVars.yOffset.getValue();
        path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
      }
      setDebugArch({
        path: path.trim(),
        width: navWidth,
        height:
          archVars.top.getValue() + archVars.curveHeight.getValue(),
      });
    } else {
      setDebugArch(null);
    }
  }, [
    activeIndex,
    showArchPath,
    fontsReady,
    debugActive,
    updateHighlightFromMetric,
    highlightEnabled,
  ]);

  const resetTimingAndMetrics = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (miniBokehTimerRef.current) {
      clearTimeout(miniBokehTimerRef.current);
      miniBokehTimerRef.current = null;
    }
    lastMetricRef.current = null;
    linkMetricsRef.current = [];
    setLinkMetrics([]);
    setTransitionDisabled(true);
  }, [
    setLinkMetrics,
  ]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return undefined;
    }
    if (!highlightEnabled) return undefined;

    const handleEnvironmentChange = () => {
      resetTimingAndMetrics();
      measure();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleEnvironmentChange();
      }
    };

    window.addEventListener('resize', handleEnvironmentChange);
    document.addEventListener('visibilitychange', handleVisibility);

    let detachDprWatcher: (() => void) | null = null;

    const attachDprWatcher = () => {
      if (typeof window.matchMedia !== 'function') return;
      const dpr = window.devicePixelRatio || 1;
      const query = `(resolution: ${dpr}dppx)`;
      const media = window.matchMedia(query);
      const handler = () => {
        if (detachDprWatcher) {
          detachDprWatcher();
          detachDprWatcher = null;
        }
        attachDprWatcher();
        handleEnvironmentChange();
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handler);
        detachDprWatcher = () =>
          media.removeEventListener('change', handler);
      } else if (typeof media.addListener === 'function') {
        media.addListener(handler);
        detachDprWatcher = () => media.removeListener(handler);
      } else {
        detachDprWatcher = null;
      }
    };

    attachDprWatcher();

    return () => {
      window.removeEventListener('resize', handleEnvironmentChange);
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      );
      if (detachDprWatcher) {
        detachDprWatcher();
      }
    };
  }, [
    measure,
    resetTimingAndMetrics,
    highlightEnabled,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const maybeFontSet = (
      document as Document & {
        fonts?: FontFaceSet;
      }
    ).fonts;
    if (!maybeFontSet) return undefined;
    const fontSet = maybeFontSet;
    let cancelled = false;

    const handleFontsChange = () => {
      if (cancelled) return;
      resetTimingAndMetrics();
      measure();
    };

    if (typeof fontSet.ready?.then === 'function') {
      void fontSet.ready.then(() => handleFontsChange());
    }

    const listener = () => {
      handleFontsChange();
    };

    if (typeof fontSet.addEventListener === 'function') {
      fontSet.addEventListener('loadingdone', listener);
      fontSet.addEventListener('loading', listener);
    } else if ('onloadingdone' in fontSet) {
      fontSet.onloadingdone = listener;
    }

    return () => {
      cancelled = true;
      if (typeof fontSet.removeEventListener === 'function') {
        fontSet.removeEventListener('loadingdone', listener);
        fontSet.removeEventListener('loading', listener);
      } else if ('onloadingdone' in fontSet) {
        fontSet.onloadingdone = null;
      }
    };
  }, [
    measure,
    resetTimingAndMetrics,
  ]);

  useEffect(() => {
    measure();
  }, [
    measure,
    anchorCount,
    fontsReady,
    debugActive,
    highlightEnabled,
  ]);

  useLayoutEffect(() => {
    measure();
  }, [
    measure,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      measure();
    };
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );
    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, [
    measure,
  ]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    const elements: Element[] = [
      navEl,
    ];
    linkRefs.current.forEach((el) => {
      if (el) elements.push(el);
    });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [
    measure,
    anchorCount,
  ]);

  const activate = useCallback(
    (index: number) => {
      if (!highlightEnabled) return;
      let metric =
        linkMetricsRef.current[index] ?? linkMetrics[index];
      if (!metric) {
        const navEl = navRef.current;
        const linkEl = linkRefs.current[index];
        if (navEl && linkEl) {
          const navRect = navEl.getBoundingClientRect();
          const dpr =
            typeof window !== 'undefined' &&
            Number.isFinite(window.devicePixelRatio)
              ? window.devicePixelRatio || 1
              : 1;
          const navWidth = snapToDevicePixel(navRect.width, dpr);
          const rect = linkEl.getBoundingClientRect();
          const centerX = snapToDevicePixel(
            rect.left + rect.width / 2 - navRect.left,
            dpr,
          );
          const centerY = snapToDevicePixel(
            rect.top + rect.height / 2 - navRect.top,
            dpr,
          );
          const width = snapToDevicePixel(rect.width, dpr);
          const height = snapToDevicePixel(rect.height, dpr);
          const computedArch =
            computeArchY(navWidth, centerX) +
            menuVars.yOffset.getValue();
          const adjustment = centerY - computedArch;
          const archY = snapToDevicePixel(
            computedArch + adjustment,
            dpr,
          );
          const highlightWidth = snapToDevicePixel(
            Math.max(
              width,
              width + menuVars.paddings.horizontal.getValue(),
            ),
            dpr,
          );
          const highlightHeight = snapToDevicePixel(
            menuVars.height.getValue(),
            dpr,
          );
          const left = snapToDevicePixel(
            centerX - highlightWidth / 2,
            dpr,
          );
          const top = snapToDevicePixel(
            archY - highlightHeight / 2,
            dpr,
          );
          metric = {
            centerX,
            centerY,
            width,
            height,
            archY,
            highlightWidth,
            highlightHeight,
            left,
            top,
          };
          const nextMetrics = [
            ...linkMetricsRef.current,
          ];
          nextMetrics[index] = metric;
          linkMetricsRef.current = nextMetrics;
          setLinkMetrics(nextMetrics);
        }
      }
      if (!metric) return;
      updateHighlightFromMetric(metric);
      lastHoverIndexRef.current = index;
      hasActivatedRef.current = true;
      persistLastHover(index);
      if (activeIndex !== index) {
        setActiveIndex(index);
      }
    },
    [
      highlightEnabled,
      activeIndex,
      linkMetrics,
      persistLastHover,
      updateHighlightFromMetric,
    ],
  );

  const highlightStyles = useMemo<HighlightStyles>(() => {
    if (!highlightEnabled) {
      return {
        containerStyle: {
          left: '0px',
          top: '0px',
          opacity: 0,
        },
        innerStyle: {
          width: '0px',
          height: '0px',
          opacity: 0,
        },
      };
    }
    const hasMeasurements = highlight.width && highlight.height;
    const defaultFallback = computeCenteredHighlight(navMetrics);
    const activeMetric =
      activeIndex != null ? linkMetrics[activeIndex] : null;
    const originBox = activeMetric
      ? metricToHighlightBox(activeMetric)
      : defaultFallback;
    const containerBase = defaultFallback;
    const isActive = highlight.visible && hasMeasurements;
    const targetBox = isActive
      ? {
          left: highlight.left,
          top: highlight.top,
          width: Math.max(1, highlight.width),
          height: Math.max(1, highlight.height),
        }
      : originBox;

    const containerStyle: CSSProperties = {
      left: `${containerBase.left}px`,
      top: `${containerBase.top}px`,
    };

    const deltaX = targetBox.left - containerBase.left;
    const deltaY = targetBox.top - containerBase.top;
    const transformValue = transforms.value({
      translate: {
        x: m(deltaX),
        y: m(deltaY),
      },
    });

    const innerStyle: CSSProperties = {
      width: `${targetBox.width}px`,
      height: `${targetBox.height}px`,
      transition: transitionDisabled ? 'none' : undefined,
      transform: transformValue ?? undefined,
    };

    return {
      containerStyle,
      innerStyle,
    };
  }, [
    highlightEnabled,
    highlight,
    transitionDisabled,
    activeIndex,
    linkMetrics,
    navMetrics,
  ]);

  useEffect(() => {
    if (!highlightEnabled) return;
    if (lockTargetIndex === null) return;
    const metric =
      linkMetricsRef.current[lockTargetIndex] ??
      linkMetrics[lockTargetIndex];
    if (!metric) return;
    hasActivatedRef.current = true;
    lastHoverIndexRef.current = lockTargetIndex;
    const frameId = requestAnimationFrame(() => {
      setActiveIndex(lockTargetIndex);
      updateHighlightFromMetric(metric);
      setMiniBokehActive(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    lockTargetIndex,
    linkMetrics,
    updateHighlightFromMetric,
    highlightEnabled,
  ]);

  const isTraveling =
    highlightEnabled && highlight.visible && !transitionDisabled;

  return {
    navRef,
    navMetricsRef,
    navMetrics,
    highlightStyles,
    highlightVisible: highlightEnabled && highlight.visible,
    miniBokehActive: highlightEnabled && miniBokehActive,
    debugArch,
    activate,
    hideHighlight,
    activeHighlightIndex: highlightEnabled ? activeIndex : null,
    isHighlightTraveling: isTraveling,
    registerLinkRef,
  };
}
