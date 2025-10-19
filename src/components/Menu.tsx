'use client';

import Link from 'next/link';
import { SkipNavLink } from '@reach/skip-nav';
import * as s from '@/styles/components/menu.css';
import type { Locale } from '@/data/locales';
import { menuVars } from '@/styles/vars';
import transforms from '@/styles/helpers/transforms';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, PointerEvent } from 'react';
import { getRotationStyle } from '../lib/arch/archHelper';
import { useMenuAnchors } from './menu/hooks/useMenuAnchors';
import {
	useMenuHighlight,
	type MiniBokehDebugOptions,
} from './menu/hooks/useMenuHighlight';
import {
	LOGO_ENTER_DELAY,
	LOGO_MOUSE_LEAVE_EXIT_DELAY,
	useLogoAnimation,
} from './menu/hooks/useLogoAnimation';
import type { AnchorEntry } from './menu/menuUtils';
import * as skipNavStyles from '@/styles/components/skipNav.css';

type MenuProps = {
	root: string;
	skipNavLabel: string;
	leftLabel: string;
	rightLabel: string;
	localeChangeLabel: string;
	sections: ReadonlyArray<{ id: string; label: string }>;
	localeLinks: ReadonlyArray<{ locale: Locale; label: string }>;
	bokehDebug?: MiniBokehDebugOptions;
	debugGlow?: boolean;
};

const LOGO_GLOW_TOP_THRESHOLD = 3;
const LOGO_GLOW_DURATION = 500;
const LOGO_GLOW_HOLD_DELAY = 100;

export default function Menu({
	root,
	skipNavLabel,
	leftLabel,
	rightLabel,
	localeChangeLabel,
	sections,
	localeLinks,
	bokehDebug,
	debugGlow = false,
}: MenuProps) {
	const [
		mounted,
		setMounted,
	] = useState(false);
	const [
		activeSection,
		setActiveSection,
	] = useState<string | null>(null);
	const [
		logoGlowState,
		setLogoGlowState,
	] = useState<'idle' | 'pulse' | 'hold'>('idle');
	const pointerInsideLogoRef = useRef(false);
	const logoGlowTimeoutRef = useRef<number | null>(null);
	const logoGlowRafRef = useRef<number | null>(null);
	const logoGlowHoldIntentRef = useRef(false);
	const logoGlowHoldActiveRef = useRef(false);
	const logoGlowHoldTimerRef = useRef<number | null>(null);
	const logoGlowClickSuppressRef = useRef(false);
	// no pending animation once we leave the top; we only fire when already there

	const sectionIds = sections.map((section) => section.id);
	const { anchors, anchorCount, sectionIds: derivedSectionIds } =
		useMenuAnchors(sectionIds);

	const [
		prefersReducedMotion,
		setPrefersReducedMotion,
	] = useState<boolean | null>(null);
	const [
		decorReady,
		setDecorReady,
	] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updatePreference = () => {
			setPrefersReducedMotion(media.matches);
		};
		updatePreference();
		media.addEventListener('change', updatePreference);
		return () => {
			media.removeEventListener('change', updatePreference);
		};
	}, []);

	useEffect(() => {
		if (prefersReducedMotion !== false) {
			setDecorReady(false);
			return;
		}
		let cancelled = false;
		let timeoutId: number | null = null;
		let idleHandle: number | null = null;

		const activate = () => {
			if (cancelled) return;
			setDecorReady(true);
		};

		if (typeof window === 'undefined') {
			activate();
			return;
		}

		const win = window as typeof window & {
			requestIdleCallback?: (
				callback: IdleRequestCallback,
				options?: IdleRequestOptions,
			) => number;
			cancelIdleCallback?: (handle: number) => void;
		};

		if (win.requestIdleCallback) {
			idleHandle = win.requestIdleCallback(
				() => {
					activate();
				},
				{ timeout: 200 },
			);
		} else {
			timeoutId = window.setTimeout(activate, 150);
		}

		return () => {
			cancelled = true;
			if (timeoutId != null) {
				window.clearTimeout(timeoutId);
			}
			if (idleHandle != null && win.cancelIdleCallback) {
				win.cancelIdleCallback(idleHandle);
			}
		};
	}, [
		prefersReducedMotion,
	]);

	const debugActive = Boolean(bokehDebug);
	const highlightEnabled =
		debugActive || (decorReady && prefersReducedMotion === false);
	const fontsReady = highlightEnabled;
	const motionPreference =
		prefersReducedMotion === true ? 'reduced' : 'standard';
	const debugOptions: MiniBokehDebugOptions | undefined = bokehDebug;
	const lockTarget = debugOptions?.lockTo;
	const raiseLayer =
		debugOptions?.raiseLayer ?? lockTarget !== undefined;
	const showArchPath = debugOptions?.showArchPath ?? false;

	const {
		navRef,
		linkRefs,
		navMetrics,
		highlightStyles,
		highlightVisible,
		miniBokehActive,
		debugArch,
		activate,
		hideHighlight,
	} = useMenuHighlight({
		anchors,
		anchorCount,
		bokehDebug,
		fontsReady,
		animationEnabled: highlightEnabled,
	});

	const {
		state: logoAnimationState,
		scheduleEnter,
		scheduleExit,
		clearEnterDelay,
		clearExitDelay,
		resetToIdle,
	} = useLogoAnimation();

	const clearLogoGlowTimeout = useCallback(() => {
		if (logoGlowTimeoutRef.current) {
			clearTimeout(logoGlowTimeoutRef.current);
			logoGlowTimeoutRef.current = null;
		}
	}, []);

	const clearLogoGlowRaf = useCallback(() => {
		if (logoGlowRafRef.current !== null) {
			cancelAnimationFrame(logoGlowRafRef.current);
			logoGlowRafRef.current = null;
		}
	}, []);

	const clearLogoGlowHoldTimer = useCallback(() => {
		if (logoGlowHoldTimerRef.current !== null) {
			clearTimeout(logoGlowHoldTimerRef.current);
			logoGlowHoldTimerRef.current = null;
		}
	}, []);

	const startLogoGlowPulse = useCallback(() => {
		if (typeof window === 'undefined') return;
		logoGlowHoldActiveRef.current = false;
		clearLogoGlowHoldTimer();
		clearLogoGlowTimeout();
		clearLogoGlowRaf();
		setLogoGlowState((prev) => (prev === 'pulse' ? 'idle' : prev));
		logoGlowRafRef.current = window.requestAnimationFrame(() => {
			logoGlowRafRef.current = null;
			setLogoGlowState('pulse');
			logoGlowTimeoutRef.current = window.setTimeout(() => {
				logoGlowTimeoutRef.current = null;
				if (!logoGlowHoldActiveRef.current) {
					setLogoGlowState('idle');
				}
			}, LOGO_GLOW_DURATION);
		});
	}, [
		clearLogoGlowHoldTimer,
		clearLogoGlowRaf,
		clearLogoGlowTimeout,
	]);

	const beginLogoGlowHold = useCallback(() => {
		if (typeof window === 'undefined') return;
		clearLogoGlowTimeout();
		clearLogoGlowRaf();
		logoGlowHoldActiveRef.current = true;
		setLogoGlowState((prev) => (prev === 'hold' ? prev : 'hold'));
	}, [
		clearLogoGlowRaf,
		clearLogoGlowTimeout,
	]);

	const queueLogoGlow = useCallback(
		(mode: 'pulse' | 'hold') => {
			if (typeof window === 'undefined') return false;
			if (window.scrollY > LOGO_GLOW_TOP_THRESHOLD) return false;
			if (mode === 'hold') {
				beginLogoGlowHold();
			} else {
				startLogoGlowPulse();
			}
			return true;
		},
		[
			beginLogoGlowHold,
			startLogoGlowPulse,
		],
	);

	const handleLogoPointerDown = useCallback(
		(event: PointerEvent<HTMLAnchorElement>) => {
			if (typeof window === 'undefined') return;
			if (event.pointerType === 'mouse' && event.button !== 0) return;
			const { pathname } = window.location;
			const isRootPath = pathname === root || pathname === `${root}/`;
			if (!isRootPath) return;
			logoGlowHoldIntentRef.current = true;
			logoGlowHoldActiveRef.current = false;
			if (event.currentTarget.setPointerCapture) {
				try {
					event.currentTarget.setPointerCapture(event.pointerId);
				} catch {
					// ignore capture errors
				}
			}
			clearLogoGlowHoldTimer();
			logoGlowHoldTimerRef.current = window.setTimeout(() => {
				if (!logoGlowHoldIntentRef.current) return;
				logoGlowHoldTimerRef.current = null;
				queueLogoGlow('hold');
			}, LOGO_GLOW_HOLD_DELAY);
		},
		[
			clearLogoGlowHoldTimer,
			queueLogoGlow,
			root,
		],
	);

	const handleLogoPointerUp = useCallback(
		(event: PointerEvent<HTMLAnchorElement>) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			const wasHolding = logoGlowHoldActiveRef.current;
			logoGlowHoldIntentRef.current = false;
			logoGlowHoldActiveRef.current = false;
			clearLogoGlowHoldTimer();
			if (wasHolding) {
				logoGlowClickSuppressRef.current = true;
				window.setTimeout(() => {
					logoGlowClickSuppressRef.current = false;
				}, LOGO_GLOW_DURATION);
				startLogoGlowPulse();
			} else {
				queueLogoGlow('pulse');
			}
		},
		[
			clearLogoGlowHoldTimer,
			queueLogoGlow,
			startLogoGlowPulse,
		],
	);

	const handleLogoPointerCancel = useCallback(
		(event: PointerEvent<HTMLAnchorElement>) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			const wasHolding = logoGlowHoldActiveRef.current;
			logoGlowHoldIntentRef.current = false;
			logoGlowHoldActiveRef.current = false;
			clearLogoGlowHoldTimer();
			if (wasHolding && logoGlowState === 'hold') {
				setLogoGlowState('idle');
			}
			clearLogoGlowTimeout();
			clearLogoGlowRaf();
		},
		[
			clearLogoGlowHoldTimer,
			clearLogoGlowRaf,
			clearLogoGlowTimeout,
			logoGlowState,
		],
	);

	const handleActivate = useCallback(
		(index: number) => {
			activate(index);
			if (index === 0) {
				clearExitDelay();
			} else {
				clearEnterDelay();
			}
		},
		[
			activate,
			clearEnterDelay,
			clearExitDelay,
		],
	);

	const triggerLogoEnter = useCallback(() => {
		handleActivate(0);
		clearExitDelay();
		scheduleEnter(LOGO_ENTER_DELAY);
	}, [
		handleActivate,
		clearExitDelay,
		scheduleEnter,
	]);

	const triggerLogoLeave = useCallback(() => {
		clearEnterDelay();
		scheduleExit(LOGO_MOUSE_LEAVE_EXIT_DELAY);
	}, [
		clearEnterDelay,
		scheduleExit,
	]);

	const handleLogoMouseEnter = useCallback(() => {
		pointerInsideLogoRef.current = true;
		// previously blocked when "at top" — removed
		triggerLogoEnter();
	}, [
		triggerLogoEnter,
	]);

	const handleLogoMouseLeave = useCallback(() => {
		pointerInsideLogoRef.current = false;
		triggerLogoLeave();
	}, [
		triggerLogoLeave,
	]);

	const handleLogoFocus = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			const focusVisible =
				event.currentTarget.matches(':focus-visible');
			pointerInsideLogoRef.current = true;
			if (focusVisible) {
				resetToIdle();
				// previously blocked when "at top" — removed
				triggerLogoEnter();
			}
		},
		[
			resetToIdle,
			triggerLogoEnter,
		],
	);

	const handleLogoClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			if (typeof window === 'undefined') return;
			if (logoGlowClickSuppressRef.current) {
				logoGlowClickSuppressRef.current = false;
				return;
			}
			const { pathname: currentPath, search, hash } = window.location;
			const isRootPath =
				currentPath === root || currentPath === `${root}/`;
			if (!isRootPath) return;
			event.preventDefault();
			if (hash) {
				window.history.replaceState(
					window.history.state,
					'',
					`${currentPath}${search}`,
				);
			}
			window.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
			if (event.detail === 0) {
				queueLogoGlow('pulse');
			}
		},
		[
			root,
			queueLogoGlow,
		],
	);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			pointerInsideLogoRef.current = false;
			const related = event.relatedTarget as HTMLElement | null;
			if (related && navRef.current?.contains(related)) return;
			hideHighlight();
			triggerLogoLeave();
		},
		[
			hideHighlight,
			navRef,
			triggerLogoLeave,
		],
	);

	const handleNavMouseLeave = useCallback(() => {
		const activeElement =
			document.activeElement as HTMLElement | null;
		if (activeElement && navRef.current?.contains(activeElement))
			return;
		hideHighlight();
		clearEnterDelay();
		scheduleExit();
	}, [
		hideHighlight,
		navRef,
		clearEnterDelay,
		scheduleExit,
	]);

	// Wait for fonts to load, then mark as mounted (for transitions)
	useEffect(() => {
		let raf1 = 0;
		let raf2 = 0;
		raf1 = requestAnimationFrame(() => {
			raf2 = requestAnimationFrame(() => setMounted(true));
		});
		return () => {
			if (raf1) cancelAnimationFrame(raf1);
			if (raf2) cancelAnimationFrame(raf2);
		};
	}, []);

	useEffect(
		() => () => {
			clearLogoGlowHoldTimer();
			clearLogoGlowTimeout();
			clearLogoGlowRaf();
			logoGlowHoldIntentRef.current = false;
			logoGlowHoldActiveRef.current = false;
		},
		[
			clearLogoGlowHoldTimer,
			clearLogoGlowTimeout,
			clearLogoGlowRaf,
		],
	);

	// Track active section for hash updates & highlighting
	useEffect(() => {
		const sections = derivedSectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => Boolean(el));

		if (!sections.length) {
			setActiveSection(null);
			return;
		}

		let rafId = 0;

		const updateActiveSection = () => {
			const viewportAnchor = window.innerHeight * 0.4;
			let nextId = sections[0]?.id ?? null;

			for (const section of sections) {
				const { top, bottom } = section.getBoundingClientRect();
				if (bottom < 0) continue;
				if (top <= viewportAnchor) {
					nextId = section.id;
				} else {
					break;
				}
			}

			const nearBottom =
				window.innerHeight + window.scrollY >=
				document.body.scrollHeight - 2;
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
		window.addEventListener('scroll', requestUpdate, {
			passive: true,
		});
		window.addEventListener('resize', requestUpdate);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);
		};
	}, [
		derivedSectionIds,
	]);

	const firstSectionId = derivedSectionIds[0] ?? null;

	// Keep URL hash synced with active section
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const { pathname, search, hash } = window.location;
		const currentHash = hash.replace(/^#/, '');

		if (
			!activeSection ||
			(firstSectionId && activeSection === firstSectionId)
		) {
			if (hash) {
				window.history.replaceState(
					window.history.state,
					'',
					`${pathname}${search}`,
				);
			}
			return;
		}

		if (currentHash === activeSection) return;
		const url = `${pathname}${search}#${activeSection}`;
		window.history.replaceState(window.history.state, '', url);
	}, [
		activeSection,
		firstSectionId,
	]);

const renderNavLink = (
	entry: AnchorEntry,
	section: { id: string; label: string } | undefined,
	index: number,
	side: 'left' | 'right',
	isOuter: boolean,
	classes?: {
		item?: string;
		index?: string;
	},
) => {
	if (!section) return null;
	const { id, label } = section;
	const isActive = activeSection === id;
		const skew = isOuter ? menuVars.skew : menuVars.skew.half();
		return (
			<li
				className={clsx(classes?.item, classes?.index)}
				key={entry.hrefKey}
			>
				<Link
					href={`#${id}`}
					className={s.navLink}
					ref={(el) => {
						linkRefs.current[index] = el;
					}}
					data-side={side}
					data-active={isActive}
					data-outer={isOuter}
					aria-current={isActive ? 'true' : undefined}
					style={transforms(
						transforms.skewX(skew).negate(side === 'right'),
						transforms.translateY(0).when(isOuter),
						transforms
							.rotate(0.5)
							.negate(side === 'left')
							.when(isOuter),
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
						{label}
					</span>
					<span className={s.text}>{label}</span>
				</Link>
			</li>
		);
	};

	return (
		<>
			<div className={s.root} data-mounted={mounted}>
		<SkipNavLink contentId="body" className={skipNavStyles.link}>
			{skipNavLabel}
		</SkipNavLink>
				<Arch
					ready={mounted}
					glow={logoGlowState === 'idle' ? null : logoGlowState}
					debugGlow={debugGlow}
				>
					<nav
						className={clsx(s.nav)}
						ref={navRef}
						onMouseLeave={handleNavMouseLeave}
						data-mini-bokeh={highlightEnabled ? 'enabled' : 'disabled'}
						data-motion={motionPreference}
					>
						{highlightEnabled ? (
							<div
								className={s.highlightLayer}
								aria-hidden
								style={raiseLayer ? { zIndex: 5 } : undefined}
							>
								{showArchPath && debugArch ? (
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
								<div
									className={s.miniBokehContainer}
									style={highlightStyles.containerStyle}
									data-active={miniBokehActive ? 'true' : 'false'}
								>
									<div
										className={s.miniBokeh}
										style={highlightStyles.innerStyle}
										data-highlight={highlightVisible ? 'true' : 'false'}
									/>
								</div>
							</div>
						) : null}

						<div className={clsx(s.contents)}>
							<div className={clsx(s.logoItem, s.item)}>
								<Link
									href={root}
									className={s.logoLink}
									prefetch={false}
									ref={(el) => {
										linkRefs.current[0] = el;
									}}
									onClick={handleLogoClick}
									onPointerDown={handleLogoPointerDown}
									onPointerUp={handleLogoPointerUp}
									onPointerCancel={handleLogoPointerCancel}
									onMouseEnter={handleLogoMouseEnter}
									onMouseLeave={handleLogoMouseLeave}
									onFocus={handleLogoFocus}
									onBlur={handleBlur}
									data-ui="link"
									/* removed: data-at-top */
									data-logo-anim={logoAnimationState}
								>
									<div className={s.logoClip}>
										<div className={s.logoWrap}>
											<Logo
												className={s.logo}
												colourState={
													logoAnimationState === 'enter'
														? 'color'
														: 'mono'
												}
											/>
										</div>
									</div>
								</Link>
							</div>

			<ul
				className={clsx(s.list, s.transitionAfterFonts)}
				aria-label={leftLabel}
				data-side="left"
				style={getRotationStyle('left', navMetrics.width)}
			>
				{anchors.slice(0, 2).map((entry, idx) =>
					renderNavLink(entry, sections[idx], idx + 1, 'left', idx === 0, {
						item: s.item,
						index: idx === 0 ? s.item_1 : s.item_2,
					}),
				)}
			</ul>

			<ul
				className={clsx(s.list, s.transitionAfterFonts)}
				aria-label={rightLabel}
				data-side="right"
				style={getRotationStyle('right', navMetrics.width)}
			>
				{anchors.slice(2).map((entry, idx) =>
					renderNavLink(
						entry,
						sections[idx + 2],
						idx + 3,
						'right',
						idx === 1,
						{
						item: s.item,
						index: idx === 0 ? s.item_3 : s.item_4,
					},
					),
				)}
			</ul>
						</div>
					</nav>

			<nav
				className={clsx(s.localeChanger, s.transitionAfterFonts)}
				aria-label={localeChangeLabel}
			>
				{localeLinks.map((link) => (
					<Link
						key={link.locale}
						href={`/${link.locale}`}
						className={clsx(s.link, s.localeLink)}
						hrefLang={link.locale}
						data-ui="link"
					>
						<span className={s.fakeShadow} aria-hidden={true}>
							{link.label}
						</span>
						<span className={s.text}>{link.label}</span>
					</Link>
				))}
			</nav>
				</Arch>
			</div>
		</>
	);
}
