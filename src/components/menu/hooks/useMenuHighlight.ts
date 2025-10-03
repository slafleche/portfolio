import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import transforms from '@/styles/helpers/transforms';
import { archVars, colorVars, menuVars } from '@/styles/vars';
import type { CSSProperties } from 'react';
import {
	BASE_ANCHORS,
	MINI_BOKEH_CACHE_KEY,
	clamp,
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

type HighlightStyles = {
	containerStyle: CSSProperties;
	innerStyle: CSSProperties;
};

type UseMenuHighlightOptions = {
	anchors?: readonly AnchorEntry[];
	anchorCount: number;
	debugMiniBokeh: boolean;
	fontsReady: boolean;
};

export function useMenuHighlight({
	anchors = BASE_ANCHORS,
	anchorCount,
	debugMiniBokeh,
	fontsReady,
}: UseMenuHighlightOptions) {
	const navRef = useRef<HTMLDivElement | null>(null);
	const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
	const [linkMetrics, setLinkMetrics] = useState<Array<LinkMetric | null>>([]);
	const linkMetricsRef = useRef<Array<LinkMetric | null>>([]);
	const lastMetricRef = useRef<LinkMetric | null>(null);
	const [highlight, setHighlight] = useState<HighlightState>({
		visible: false,
		left: 0,
		top: 0,
		width: 0,
		height: 0,
	});
	const highlightRef = useRef(highlight);
	const [transitionDisabled, setTransitionDisabled] = useState(false);
	const navMetricsRef = useRef<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});
	const [navMetrics, setNavMetrics] = useState({ width: 0, height: 0 });
	const [debugArch, setDebugArch] = useState<DebugArch | null>(null);
	const [miniBokehActive, setMiniBokehActive] = useState(false);
	const miniBokehTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const lastHoverIndexRef = useRef<number | null>(null);
	const hasResolvedHoverFromCacheRef = useRef(false);
	const lastPersistedCacheValueRef = useRef<string | null>(null);
	const hasActivatedRef = useRef(false);

	useEffect(() => {
		highlightRef.current = highlight;
	}, [highlight]);

	useEffect(() => {
		if (miniBokehTimerRef.current) {
			clearTimeout(miniBokehTimerRef.current);
			miniBokehTimerRef.current = null;
		}
		if (highlight.visible) {
			setMiniBokehActive(true);
			return () => {
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
	}, [highlight.visible]);

	useEffect(() => () => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (hasResolvedHoverFromCacheRef.current) return;
		if (typeof window === 'undefined') return;
		hasResolvedHoverFromCacheRef.current = true;
		try {
			const cachedValue = window.localStorage.getItem(MINI_BOKEH_CACHE_KEY);
			lastPersistedCacheValueRef.current = cachedValue;
			const resolvedIndex = resolveIndexFromCacheValue(cachedValue, anchors);
			if (resolvedIndex != null) {
				lastHoverIndexRef.current = resolvedIndex;
			}
		} catch {
			lastPersistedCacheValueRef.current = null;
		}
	}, [anchors]);

	useEffect(() => {
		linkRefs.current = new Array<HTMLAnchorElement | null>(anchorCount).fill(
			null,
		);
		const emptyMetrics = new Array<LinkMetric | null>(anchorCount).fill(null);
		linkMetricsRef.current = emptyMetrics;
		setLinkMetrics(emptyMetrics);
		lastMetricRef.current = null;
	}, [anchorCount]);

	const persistLastHover = useCallback(
		(index: number | null) => {
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
		[anchors],
	);

	const updateHighlightFromMetric = useCallback((metric?: LinkMetric) => {
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
	}, []);

	const hideHighlight = useCallback(() => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
		lastMetricRef.current = null;
		setActiveIndex(null);
		setHighlight((prev) => (prev.visible ? { ...prev, visible: false } : prev));
		persistLastHover(null);
	}, [persistLastHover]);

	const measure = useCallback(() => {
		if (!fontsReady) return;
		const navEl = navRef.current;
		if (!navEl) return;

		const navRect = navEl.getBoundingClientRect();
		const width = navRect.width;
		if (!width) return;
		navMetricsRef.current = { width, height: navRect.height };
		setNavMetrics((prev) =>
			prev.width === width && prev.height === navRect.height
				? prev
				: { width, height: navRect.height },
		);
		const metrics: Array<LinkMetric | null> = linkRefs.current.map(() => null);

		linkRefs.current.forEach((el, index) => {
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2 - navRect.left;
			const centerY = rect.top + rect.height / 2 - navRect.top;
			const archBase = computeArchY(width, centerX) + menuVars.yOffset.value;
			metrics[index] = {
				centerX,
				centerY,
				width: rect.width,
				height: rect.height,
				archY: archBase,
				highlightWidth: 0,
				highlightHeight: 0,
				left: 0,
				top: 0,
			};
		});

		const definedMetrics = metrics.filter((metric): metric is LinkMetric =>
			Boolean(metric),
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

		const highlightHeightValue = menuVars.height.value;
		const widthPaddingValue = menuVars.padding.horizontal.value;

		definedMetrics.forEach((metric) => {
			const archY = metric.archY + adjustment;
			const highlightWidth = clamp(
				metric.width + widthPaddingValue,
				metric.width,
				width,
			);
			const highlightHeight = highlightHeightValue;
			const left = clamp(
				metric.centerX - highlightWidth / 2,
				0,
				Math.max(0, width - highlightWidth),
			);
			const top = Math.max(0, archY - highlightHeight / 2);
			metric.archY = archY;
			metric.highlightWidth = highlightWidth;
			metric.highlightHeight = highlightHeight;
			metric.left = left;
			metric.top = top;
		});

		linkMetricsRef.current = metrics;
		setLinkMetrics(metrics);

		if (activeIndex != null && highlightRef.current.visible) {
			updateHighlightFromMetric(metrics[activeIndex] ?? undefined);
		}

		if (debugMiniBokeh) {
			const sampleCount = Math.max(24, Math.round(width / 20));
			let path = '';
			for (let i = 0; i < sampleCount; i += 1) {
				const x = (width * i) / (sampleCount - 1);
				const y = computeArchY(width, x) + menuVars.yOffset.value;
				path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
			}
			setDebugArch({
				path: path.trim(),
				width,
				height: archVars.top.value + archVars.curveHeight.value,
			});
		} else {
			setDebugArch(null);
		}
	}, [activeIndex, debugMiniBokeh, fontsReady, updateHighlightFromMetric]);

	useEffect(() => {
		measure();
	}, [measure, anchorCount, fontsReady]);

	useLayoutEffect(() => {
		measure();
	}, [measure]);

	useEffect(() => {
		const navEl = navRef.current;
		if (!navEl || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => measure());
		observer.observe(navEl);
		return () => observer.disconnect();
	}, [measure]);

	const activate = useCallback(
		(index: number) => {
			let metric = linkMetricsRef.current[index] ?? linkMetrics[index];
			if (!metric) {
				const navEl = navRef.current;
				const linkEl = linkRefs.current[index];
				if (navEl && linkEl) {
					const navRect = navEl.getBoundingClientRect();
					const width = navRect.width;
					const rect = linkEl.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2 - navRect.left;
					const centerY = rect.top + rect.height / 2 - navRect.top;
					const archBase =
						computeArchY(width, centerX) + menuVars.yOffset.value;
					const highlightWidth = clamp(
						rect.width + menuVars.padding.horizontal.value,
						rect.width,
						width,
					);
					const highlightHeight = menuVars.height.value;
					metric = {
						centerX,
						centerY,
						width: rect.width,
						height: rect.height,
						archY: archBase,
						highlightWidth,
						highlightHeight,
						left: clamp(
							centerX - highlightWidth / 2,
							0,
							Math.max(0, width - highlightWidth),
						),
						top: Math.max(0, archBase - highlightHeight / 2),
					};
					const nextMetrics = [...linkMetricsRef.current];
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
			activeIndex,
			linkMetrics,
			persistLastHover,
			updateHighlightFromMetric,
		],
	);

	const highlightStyles = useMemo<HighlightStyles>(() => {
		const navMetrics = navMetricsRef.current;
		const hasMeasurements = highlight.width && highlight.height;
		const defaultFallback = computeCenteredHighlight(navMetrics);
		const cachedFallback = (() => {
			const cachedIndex = lastHoverIndexRef.current;
			if (cachedIndex != null) {
				const metric =
					linkMetricsRef.current[cachedIndex] ?? linkMetrics[cachedIndex];
				if (metric) return metricToHighlightBox(metric);
			}
			return null;
		})();

		const originBox =
			hasActivatedRef.current && cachedFallback
				? cachedFallback
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
		const transformValue = transforms.value(
			transforms.translate3d(deltaX, deltaY, 0),
		);

		const innerStyle: CSSProperties = {
			width: `${targetBox.width}px`,
			height: `${targetBox.height}px`,
			transition: transitionDisabled ? 'none' : undefined,
			transform: transformValue ?? undefined,
		};

		const blobs = menuVars.hover.blobs;
		const activeNavIndex =
			highlight.visible && activeIndex != null && activeIndex > 0
				? (activeIndex - 1) % Math.max(blobs.length, 1)
				: null;
		const ordered = blobs.map((blob, index) => ({
			blob,
			isActive: index === activeNavIndex,
		}));
		if (activeNavIndex != null) {
			const activeEntry = ordered.splice(activeNavIndex, 1);
			ordered.unshift(...activeEntry);
		}
		innerStyle.backgroundImage = ordered
			.map(({ blob, isActive }) => {
				const baseColor = blob.color ?? colorVars.contrast;
				const intensity = Math.min(
					0.6,
					(blob.intensity ?? 0.3) * (isActive ? 1.35 : 1),
				);
				const radius = (blob.radius ?? 50) * (isActive ? 1.25 : 1);
				const solid = baseColor.alpha(intensity).css();
				const soft = baseColor.alpha(0).css();
				const posX = blob.posX ?? 50;
				const posY = blob.posY ?? 50;
				return `radial-gradient(circle at ${posX}% ${posY}%, ${solid} 0%, ${soft} ${radius}%)`;
			})
			.join(', ');
		innerStyle.filter = `blur(${menuVars.hover.blur.value}px)`;
		innerStyle.boxShadow = `0 0 ${menuVars.hover.shadow.spread.value}px ${colorVars.contrast.alpha(menuVars.hover.shadow.opacity).css()}`;

		if (debugMiniBokeh) {
			innerStyle.outline = '1px dashed rgba(255,255,255,0.4)';
		}

		return { containerStyle, innerStyle };
	}, [
		highlight,
		transitionDisabled,
		debugMiniBokeh,
		activeIndex,
		linkMetrics,
	]);

	return {
		navRef,
		linkRefs,
		navMetricsRef,
		navMetrics,
		highlightStyles,
		highlightVisible: highlight.visible,
		miniBokehActive,
		debugArch,
		activate,
		hideHighlight,
	};
}
