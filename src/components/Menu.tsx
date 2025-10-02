'use client';

import Link from 'next/link';
import * as s from '@/styles/components/menu.css';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS, type Messages } from '@/data/locales';
import { archVars, colorVars, menuVars } from '@/styles/vars';
import transforms from '@/styles/helpers/transforms';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { CSSProperties, FocusEvent } from 'react';
import { getRotationStyle } from '../lib/arch/archHelper';

type AnchorKey = Extract<keyof Messages, `${string}-href`>;
type AnchorEntry = { hrefKey: AnchorKey; labelKey: keyof Messages };

type LinkMetric = {
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

type HighlightState = {
	visible: boolean;
	left: number;
	top: number;
	width: number;
	height: number;
};

type DebugArch = {
	path: string;
	width: number;
	height: number;
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

const highlightTransition =
	'opacity 180ms ease, transform 450ms cubic-bezier(0.4, 0, 0.2, 1), width 350ms ease, height 350ms ease';

const rxFrom = (width: number, curveHeight: number, ry: number) => {
	const c = curveHeight / ry;
	const denom = Math.max(1e-6, 2 * c - c * c);
	return width / 2 / Math.sqrt(denom);
};

const computeArchY = (width: number, x: number, includeBump = false) => {
	const top = archVars.top.value;
	const curveHeight = archVars.curveHeight.value;
	const ry = archVars.ry.value;
	const bumpWidth = archVars.bumpWidth.value;
	const bumpHeight = archVars.bumpHeight.value;
	const cx = width / 2;
	const cy = top + ry;
	const rx = rxFrom(width, curveHeight, ry);
	const normalized = clamp((x - cx) / rx, -1, 1);
	const ellipseComponent = Math.sqrt(Math.max(0, 1 - normalized * normalized));
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

type MenuProps = {
	debugMiniBokeh?: boolean;
};

export default function Menu({ debugMiniBokeh = false }: MenuProps = {}) {
	const t = useT();
	const { locale, root } = useLocale({ withLabel: true });
	const [mounted, setMounted] = useState(false);
	const [fontsReady, setFontsReady] = useState(false);
	const [activeSection, setActiveSection] = useState<string | null>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
	const [debugArch, setDebugArch] = useState<DebugArch | null>(null);
	const navMetricsRef = useRef<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});
	const highlightRef = useRef(highlight);
	const animationFrameRef = useRef<number | null>(null);
	const [transitionDisabled, setTransitionDisabled] = useState(false);
	const [logoAnimationState, setLogoAnimationState] = useState<
		'idle' | 'enter' | 'exit'
	>('idle');
	const logoAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const logoAnimationStateRef = useRef<'idle' | 'enter' | 'exit'>('idle');
	const logoEnterDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const logoExitDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const LOGO_ENTER_DELAY = 0;
	const LOGO_MOUSE_LEAVE_EXIT_DELAY = 140;
	const LOGO_EXIT_DURATION = 560;

	const clearLogoAnimationTimeout = useCallback(() => {
		if (logoAnimationTimeoutRef.current !== null) {
			clearTimeout(logoAnimationTimeoutRef.current);
			logoAnimationTimeoutRef.current = null;
		}
	}, []);

	const clearLogoEnterDelay = useCallback(() => {
		if (logoEnterDelayRef.current !== null) {
			clearTimeout(logoEnterDelayRef.current);
			logoEnterDelayRef.current = null;
		}
	}, []);

	const clearLogoExitDelay = useCallback(() => {
		if (logoExitDelayRef.current !== null) {
			clearTimeout(logoExitDelayRef.current);
			logoExitDelayRef.current = null;
		}
	}, []);

	const triggerLogoEnter = useCallback(() => {
		clearLogoEnterDelay();
		clearLogoExitDelay();
		clearLogoAnimationTimeout();
		if (logoAnimationStateRef.current === 'enter') return;
		setLogoAnimationState('enter');
		logoAnimationStateRef.current = 'enter';
	}, [clearLogoEnterDelay, clearLogoExitDelay, clearLogoAnimationTimeout]);

	const runLogoExit = useCallback(() => {
		clearLogoEnterDelay();
		clearLogoAnimationTimeout();
		if (logoAnimationStateRef.current === 'idle') return;
		setLogoAnimationState('exit');
		logoAnimationStateRef.current = 'exit';
		logoAnimationTimeoutRef.current = setTimeout(() => {
			setLogoAnimationState('idle');
			logoAnimationStateRef.current = 'idle';
			logoAnimationTimeoutRef.current = null;
		}, LOGO_EXIT_DURATION);
	}, [clearLogoEnterDelay, clearLogoAnimationTimeout, LOGO_EXIT_DURATION]);

	const triggerLogoExit = useCallback(
		(delayMs = 0) => {
			clearLogoEnterDelay();
			clearLogoExitDelay();
			if (delayMs <= 0) {
				runLogoExit();
				return;
			}
			logoExitDelayRef.current = setTimeout(() => {
				logoExitDelayRef.current = null;
				runLogoExit();
			}, delayMs);
		},
		[clearLogoEnterDelay, clearLogoExitDelay, runLogoExit],
	);

	useEffect(
		() => () => {
			clearLogoEnterDelay();
			clearLogoExitDelay();
			clearLogoAnimationTimeout();
		},
		[clearLogoEnterDelay, clearLogoExitDelay, clearLogoAnimationTimeout],
	);

	useEffect(() => {
		highlightRef.current = highlight;
	}, [highlight]);

	useEffect(
		() => () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		},
		[],
	);

	const anchors = useMemo<readonly AnchorEntry[]>(
		() => [
			{ hrefKey: 'about-href', labelKey: 'about' },
			{ hrefKey: 'approach-href', labelKey: 'approach' },
			{ hrefKey: 'case_study-href', labelKey: 'case_study' },
			{ hrefKey: 'projects-href', labelKey: 'projects' },
		],
		[],
	);

	const anchorCount = anchors.length + 1;

	const sectionIds = useMemo(() => {
		const messages = TRANSLATIONS[locale];
		return anchors.map(({ hrefKey }) => messages[hrefKey]);
	}, [anchors, locale]);

	useEffect(() => {
		const emptyRefs = new Array<HTMLAnchorElement | null>(anchorCount).fill(
			null,
		);
		linkRefs.current = emptyRefs;
		const emptyMetrics = new Array<LinkMetric | null>(anchorCount).fill(null);
		linkMetricsRef.current = emptyMetrics;
		setLinkMetrics(emptyMetrics);
	}, [anchorCount]);

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
			} else if (navMetrics.width > 0) {
				const centerX = navMetrics.width / 2;
				const centerY =
					computeArchY(navMetrics.width, centerX) + menuVars.yOffset.value;
				startLeft = centerX - metric.highlightWidth / 2;
				startTop = Math.max(0, centerY - metric.highlightHeight / 2);
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
		setActiveIndex(null);
		setHighlight((prev) => (prev.visible ? { ...prev, visible: false } : prev));
	}, []);

	const measure = useCallback(() => {
		if (!fontsReady) return;
		const navEl = navRef.current;
		if (!navEl) return;

		const navRect = navEl.getBoundingClientRect();
		const width = navRect.width;
		if (!width) return;
		navMetricsRef.current = { width, height: navRect.height };

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
	}, [fontsReady, activeIndex, updateHighlightFromMetric, debugMiniBokeh]);

	useEffect(() => {
		linkRefs.current.length = anchors.length + 1;
		measure();
	}, [anchors.length, measure]);

	useLayoutEffect(() => {
		measure();
	}, [measure, anchors, locale]);

	useEffect(() => {
		const navEl = navRef.current;
		if (!navEl || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => measure());
		observer.observe(navEl);
		return () => observer.disconnect();
	}, [measure]);

	const handleActivate = useCallback(
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
			if (!metric) {
				return;
			}
			setActiveIndex(index);
			updateHighlightFromMetric(metric);
			if (index !== 0) {
				clearLogoEnterDelay();
				if (logoAnimationStateRef.current === 'enter') {
					triggerLogoExit();
				}
			}
		},
		[
			updateHighlightFromMetric,
			linkMetrics,
			clearLogoEnterDelay,
			triggerLogoExit,
		],
	);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			const related = event.relatedTarget as HTMLElement | null;
			if (related && navRef.current?.contains(related)) return;
			hideHighlight();
			if (event.currentTarget === linkRefs.current[0]) {
				triggerLogoExit();
			}
		},
		[hideHighlight, triggerLogoExit],
	);

	const handleNavMouseLeave = useCallback(() => {
		const activeElement = document.activeElement as HTMLElement | null;
		if (activeElement && navRef.current?.contains(activeElement)) return;
		hideHighlight();
		triggerLogoExit();
	}, [hideHighlight, triggerLogoExit]);

	const handleLogoMouseEnter = useCallback(() => {
		handleActivate(0);
		clearLogoExitDelay();
		clearLogoEnterDelay();
		if (LOGO_ENTER_DELAY <= 0) {
			triggerLogoEnter();
			return;
		}
		logoEnterDelayRef.current = setTimeout(() => {
			logoEnterDelayRef.current = null;
			triggerLogoEnter();
		}, LOGO_ENTER_DELAY);
	}, [
		handleActivate,
		clearLogoExitDelay,
		clearLogoEnterDelay,
		triggerLogoEnter,
	]);

	const handleLogoMouseLeave = useCallback(() => {
		clearLogoEnterDelay();
		triggerLogoExit(LOGO_MOUSE_LEAVE_EXIT_DELAY);
	}, [clearLogoEnterDelay, triggerLogoExit]);

	const handleLogoFocus = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			clearLogoEnterDelay();
			clearLogoExitDelay();
			clearLogoAnimationTimeout();
			setLogoAnimationState('idle');
			logoAnimationStateRef.current = 'idle';
			if (event.currentTarget.matches(':focus-visible')) {
				handleActivate(0);
			}
		},
		[
			clearLogoEnterDelay,
			clearLogoExitDelay,
			clearLogoAnimationTimeout,
			handleActivate,
		],
	);

	const highlightStyle = useMemo<CSSProperties>(() => {
		const { width: navWidth, height: navHeight } = navMetricsRef.current;
		const hasMeasurements = highlight.width && highlight.height;

		const width = hasMeasurements
			? highlight.width
			: Math.min(
					navWidth,
					menuVars.height.value + menuVars.padding.vertical.value,
				);
		const height = hasMeasurements ? highlight.height : menuVars.height.value;
		const centerX = navWidth ? navWidth / 2 : width / 2;
		const centerY = navWidth
			? computeArchY(navWidth, centerX) + menuVars.yOffset.value
			: height / 2;
		const left = hasMeasurements ? highlight.left : centerX - width / 2;
		const top = hasMeasurements
			? highlight.top
			: Math.max(0, centerY - height / 2);

		const style: CSSProperties = {
			width: `${width}px`,
			height: `${height}px`,
			opacity: hasMeasurements && highlight.visible ? 1 : 0,
			transition:
				transitionDisabled || !hasMeasurements ? 'none' : highlightTransition,
		};

		const transformValue = transforms.value(
			transforms.translate3d(left, top, 0),
		);
		if (transformValue) {
			style.transform = transformValue;
		}

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
		const backgroundImage = ordered
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
		style.backgroundImage = backgroundImage;
		style.filter = `blur(${menuVars.hover.blur.value}px)`;
		style.boxShadow = `0 0 ${menuVars.hover.shadow.spread.value}px ${colorVars.contrast
			.alpha(menuVars.hover.shadow.opacity)
			.css()}`;

		if (debugMiniBokeh) {
			style.outline = '1px dashed rgba(255,255,255,0.4)';
		}

		return style;
	}, [highlight, transitionDisabled, debugMiniBokeh, activeIndex]);

	const renderNavLink = (
		entry: AnchorEntry,
		index: number,
		side: 'left' | 'right',
		isFirst: boolean, // the outer link is slightly translated to make the curve effect
		classes?: { item?: string; index?: string },
	) => {
		const id = t(entry.hrefKey);
		const isActive = activeSection === id;

		return (
			<li className={clsx(classes?.item, classes?.index)} key={entry.hrefKey}>
				<Link
					href={`#${id}`}
					className={s.navLink}
					ref={(el) => {
						linkRefs.current[index] = el;
					}}
					data-side={side}
					data-active={isActive}
					aria-current={isActive ? 'true' : undefined}
					style={transforms(
						transforms.skewX(menuVars.skew).negate(side === 'right'),
						transforms.translateY(0).when(isFirst),
						transforms
							.rotate(0.5)
							.negate(side === 'left')
							.when(isFirst),
					)}
					onMouseEnter={() => handleActivate(index)}
					onMouseLeave={hideHighlight}
					onFocus={(event) => {
						if (event.currentTarget.matches(':focus-visible')) {
							handleActivate(index);
						}
					}}
					onBlur={handleBlur}
					data-ui="link"
				>
					<span className={s.fakeShadow} aria-hidden={true}>
						{t(entry.labelKey)}
					</span>
					<span className={s.text}>{t(entry.labelKey)}</span>
				</Link>
			</li>
		);
	};

	useEffect(() => {
		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => Boolean(el));

		if (!sections.length) {
			setActiveSection(null);
			return undefined;
		}

		let rafId = 0;

		const updateActiveSection = () => {
			const viewportAnchor = window.innerHeight * 0.4;
			let nextId = sections[0]?.id ?? null;

			for (const section of sections) {
				const { top, bottom } = section.getBoundingClientRect();
				if (bottom < 0) {
					continue;
				}
				if (top <= viewportAnchor) {
					nextId = section.id;
				} else {
					break;
				}
			}

			// When scrolled to the bottom, force the last section
			const nearBottom =
				window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
			if (nearBottom && sections.length) {
				nextId = sections[sections.length - 1].id;
			}

			setActiveSection((prev) => (prev === nextId ? prev : nextId));
		};

		const requestUpdate = () => {
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				updateActiveSection();
			});
		};

		updateActiveSection();

		window.addEventListener('scroll', requestUpdate, { passive: true });
		window.addEventListener('resize', requestUpdate);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);
		};
	}, [sectionIds]);

	useEffect(() => {
		if (!activeSection) return;

		const { pathname, search, hash } = window.location;
		const currentHash = hash.replace(/^#/, '');
		if (currentHash === activeSection) return;

		const url = `${pathname}${search}#${activeSection}`;
		window.history.replaceState(window.history.state, '', url);
	}, [activeSection]);

	useEffect(() => {
		if (typeof document === 'undefined') {
			setFontsReady(true);
			return;
		}
		const fonts = document.fonts;
		if (!fonts) {
			setFontsReady(true);
			return undefined;
		}
		if (fonts.status === 'loaded') {
			setFontsReady(true);
			return undefined;
		}
		let cancelled = false;
		fonts.ready.then(
			() => {
				if (!cancelled) setFontsReady(true);
			},
			() => {
				if (!cancelled) setFontsReady(true);
			},
		);
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!fontsReady) {
			setMounted(false);
			return undefined;
		}
		let raf1 = 0;
		let raf2 = 0;
		raf1 = requestAnimationFrame(() => {
			raf2 = requestAnimationFrame(() => setMounted(true));
		});
		return () => {
			if (raf1) cancelAnimationFrame(raf1);
			if (raf2) cancelAnimationFrame(raf2);
		};
	}, [fontsReady]);
	return (
		<>
			<div className={s.root} data-mounted={mounted}>
				<Arch ready={mounted}>
					<nav
						className={clsx(s.nav)}
						ref={navRef}
						onMouseLeave={handleNavMouseLeave}
					>
						<div className={s.highlightLayer} aria-hidden>
							{debugMiniBokeh && debugArch ? (
								<svg
									className={s.debugArch}
									viewBox={`0 0 ${debugArch.width} ${debugArch.height}`}
									width={debugArch.width}
									height={debugArch.height}
									preserveAspectRatio="none"
								>
									<path
										d={debugArch.path}
										fill="none"
										stroke="rgba(255,255,255,0.35)"
										strokeWidth={1}
										strokeDasharray="4 4"
									/>
								</svg>
							) : null}
							<div className={s.miniBokeh} style={highlightStyle} />
						</div>
						<div className={clsx(s.contents)}>
							<div className={clsx(s.logoItem, s.item)}>
								<Link
									href={root}
									className={s.logoLink}
									prefetch={false}
									ref={(el) => {
										linkRefs.current[0] = el;
									}}
									onMouseEnter={handleLogoMouseEnter}
									onMouseLeave={handleLogoMouseLeave}
									onFocus={handleLogoFocus}
									onBlur={handleBlur}
									data-ui="link"
									data-logo-anim={logoAnimationState}
								>
									<Logo className={s.logo} />
								</Link>
							</div>

							<ul
								className={s.list}
								aria-label={t('menu-left_label')}
								data-side="left"
								style={getRotationStyle('left', navMetricsRef.current.width)}
							>
								{anchors.slice(0, 2).map((entry, idx) =>
									renderNavLink(entry, idx + 1, 'left', idx === 0, {
										item: s.item,
										index: idx === 0 ? s.item_1 : s.item_2,
									}),
								)}
							</ul>

							<ul
								className={s.list}
								aria-label={t('menu-right_label')}
								data-side="right"
								style={getRotationStyle('right', navMetricsRef.current.width)}
							>
								{anchors.slice(2).map((entry, idx) =>
									renderNavLink(entry, idx + 3, 'right', idx === 1, {
										item: s.item,
										index: idx === 0 ? s.item_3 : s.item_4,
									}),
								)}
							</ul>
						</div>
					</nav>
					<nav className={s.localeChanger} aria-label={t('localeChange')}>
						{AVAILABLE_LOCALES.filter((l) => l !== locale).map((l) => (
							<Link
								key={l}
								href={`/${l}`}
								className={clsx(s.link, s.localeLink)}
								hrefLang={l}
								data-ui="link"
							>
								{TRANSLATIONS[l]['abbreviated-label']}
								<span className={s.fakeShadow} aria-hidden={true}>
									{TRANSLATIONS[l]['abbreviated-label']}
								</span>
							</Link>
						))}
					</nav>
				</Arch>
			</div>
		</>
	);
}
