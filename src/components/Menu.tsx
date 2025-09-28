'use client';

import Link from 'next/link';
import * as s from '@/styles/menu.css';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS, type Messages } from '@/data/locales';
import { archVars, menuHighlightVars } from '@/styles/vars';
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
					computeArchY(navMetrics.width, centerX) +
					menuHighlightVars.yOffset.value;
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
			const archBase =
				computeArchY(width, centerX) + menuHighlightVars.yOffset.value;
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

		const highlightHeightValue = menuHighlightVars.height.value;
		const widthPaddingValue = menuHighlightVars.widthPadding.value;

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
				const y = computeArchY(width, x) + menuHighlightVars.yOffset.value;
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
	}, [activeIndex, updateHighlightFromMetric, debugMiniBokeh]);

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
					computeArchY(width, centerX) + menuHighlightVars.yOffset.value;
				const highlightWidth = clamp(
					rect.width + menuHighlightVars.widthPadding.value,
					rect.width,
					width,
				);
				const highlightHeight = menuHighlightVars.height.value;
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
	},
	[updateHighlightFromMetric, linkMetrics],
);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			const related = event.relatedTarget as HTMLElement | null;
			if (related && navRef.current?.contains(related)) return;
			hideHighlight();
		},
		[hideHighlight],
	);

	const handleNavMouseLeave = useCallback(() => {
		const activeElement = document.activeElement as HTMLElement | null;
		if (activeElement && navRef.current?.contains(activeElement)) return;
		hideHighlight();
	}, [hideHighlight]);

	const highlightStyle = useMemo<CSSProperties>(() => {
		if (!highlight.width || !highlight.height) {
			return { opacity: 0, transform: 'translate3d(0, 0, 0)' };
		}

		const style: CSSProperties = {
			width: `${highlight.width}px`,
			height: `${highlight.height}px`,
			transform: `translate3d(${highlight.left}px, ${highlight.top}px, 0)`,
			opacity: highlight.visible ? 1 : 0,
			transition: transitionDisabled ? 'none' : highlightTransition,
		};

		if (debugMiniBokeh) {
			style.outline = '1px dashed rgba(255,255,255,0.4)';
		}

		return style;
	}, [highlight, transitionDisabled, debugMiniBokeh]);

	const renderNavLink = (
		entry: AnchorEntry,
		index: number,
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
					data-active={isActive}
					aria-current={isActive ? 'true' : undefined}
					onMouseEnter={() => handleActivate(index)}
					onMouseLeave={hideHighlight}
					onFocus={(event) => {
						if (event.currentTarget.matches(':focus-visible')) {
							handleActivate(index);
						}
					}}
					onBlur={handleBlur}
				>
					{t(entry.labelKey)}
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
		const f1 = requestAnimationFrame(() => {
			requestAnimationFrame(() => setMounted(true));
		});
		return () => cancelAnimationFrame(f1);
	}, []);
	return (
		<>
			<div className={s.menu} data-mounted={mounted}>
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
									onMouseEnter={() => handleActivate(0)}
									onFocus={(event) => {
										if (event.currentTarget.matches(':focus-visible')) {
											handleActivate(0);
										}
									}}
									onBlur={handleBlur}
								>
									<Logo className={s.logo} />
								</Link>
							</div>

							<ul
								className={s.list}
								aria-label={t('menu-left_label')}
								data-side="left"
							>
								{anchors.slice(0, 2).map((entry, idx) =>
									renderNavLink(entry, idx + 1, {
										item: s.item,
										index: idx === 0 ? s.item_1 : s.item_2,
									}),
								)}
							</ul>

							<ul
								className={s.list}
								aria-label={t('menu-right_label')}
								data-side="right"
							>
								{anchors.slice(2).map((entry, idx) =>
									renderNavLink(entry, idx + 3, {
										item: s.item,
										index: idx === 0 ? s.item_3 : s.item_4,
									}),
								)}
							</ul>
						</div>
					</nav>
					<nav className={s.localeChanger} aria-label={t('localeChange')}>
						{AVAILABLE_LOCALES.filter((l) => l !== locale).map((l) => (
							<Link key={l} href={`/${l}`} className={s.link} hrefLang={l}>
								{TRANSLATIONS[l]['abbreviated-label']}
							</Link>
						))}
					</nav>
				</Arch>
			</div>

			{/* 
        <div className={s.nav}>
          {locales
            .filter((l) => l !== current) // only other locales (your rule)
            .map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                className={s.link}
                hrefLang={l}
                data-active={false}
              >
                {LOCALE_LABELS[l]}
              </Link>
            ))}
          
          <span className={s.link} data-active aria-current="page">
            {LOCALE_LABELS[current]}
          </span>
          */}
		</>
	);
}
