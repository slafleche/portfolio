'use client';

import Link from 'next/link';
import * as s from '@/styles/components/menu.css';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS } from '@/data/locales';
import { menuVars } from '@/styles/vars';
import transforms from '@/styles/helpers/transforms';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import { useCallback, useEffect, useState } from 'react';
import type { FocusEvent, MouseEvent } from 'react';
import { getRotationStyle } from '../lib/arch/archHelper';
import { useMenuAnchors } from './menu/hooks/useMenuAnchors';
import { useMenuHighlight } from './menu/hooks/useMenuHighlight';
import {
	LOGO_ENTER_DELAY,
	LOGO_MOUSE_LEAVE_EXIT_DELAY,
	useLogoAnimation,
} from './menu/hooks/useLogoAnimation';
import type { AnchorEntry } from './menu/menuUtils';

type MenuProps = {
	debugMiniBokeh?: boolean;
};

export default function Menu({ debugMiniBokeh = false }: MenuProps = {}) {
	const t = useT();
	const { locale, root } = useLocale({ withLabel: true });
	const [mounted, setMounted] = useState(false);
	const [fontsReady, setFontsReady] = useState(false);
	const [activeSection, setActiveSection] = useState<string | null>(null);
	const [isAtTop, setIsAtTop] = useState(true);

	const { anchors, anchorCount, sectionIds } = useMenuAnchors(locale);

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
		debugMiniBokeh,
		fontsReady,
	});

	const {
		state: logoAnimationState,
		scheduleEnter,
		scheduleExit,
		clearEnterDelay,
		clearExitDelay,
		resetToIdle,
	} = useLogoAnimation();

	const handleActivate = useCallback(
		(index: number) => {
			activate(index);
			if (index === 0) {
				clearExitDelay();
			} else {
				clearEnterDelay();
			}
		},
		[activate, clearEnterDelay, clearExitDelay],
	);

	const handleLogoMouseEnter = useCallback(() => {
		if (isAtTop) return;
		handleActivate(0);
		clearExitDelay();
		scheduleEnter(LOGO_ENTER_DELAY);
	}, [handleActivate, clearExitDelay, scheduleEnter, isAtTop]);

	const handleLogoMouseLeave = useCallback(() => {
		if (isAtTop && logoAnimationState === 'idle') return;
		clearEnterDelay();
		scheduleExit(LOGO_MOUSE_LEAVE_EXIT_DELAY);
	}, [clearEnterDelay, scheduleExit, isAtTop, logoAnimationState]);

	const handleLogoFocus = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			resetToIdle();
			if (isAtTop) return;
			if (event.currentTarget.matches(':focus-visible')) {
				handleActivate(0);
			}
		},
		[resetToIdle, handleActivate, isAtTop],
	);

	const handleLogoClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			if (typeof window === 'undefined') return;
			const { pathname: currentPath, search, hash } = window.location;
			const isRootPath = currentPath === root || currentPath === `${root}/`;
			if (!isRootPath) return;
			event.preventDefault();
			if (hash) {
				window.history.replaceState(
					window.history.state,
					'',
					`${currentPath}${search}`,
				);
			}
			window.scrollTo({ top: 0, behavior: 'smooth' });
		},
		[root],
	);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			const related = event.relatedTarget as HTMLElement | null;
			if (related && navRef.current?.contains(related)) return;
			hideHighlight();
			clearEnterDelay();
			scheduleExit();
		},
		[hideHighlight, navRef, clearEnterDelay, scheduleExit],
	);

	const handleNavMouseLeave = useCallback(() => {
		const activeElement = document.activeElement as HTMLElement | null;
		if (activeElement && navRef.current?.contains(activeElement)) return;
		hideHighlight();
		clearEnterDelay();
		scheduleExit();
	}, [hideHighlight, navRef, clearEnterDelay, scheduleExit]);

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
				if (bottom < 0) continue;
				if (top <= viewportAnchor) {
					nextId = section.id;
				} else {
					break;
				}
			}

			const nearBottom =
				window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
			if (nearBottom && sections.length) {
				nextId = sections[sections.length - 1].id;
			}

			setActiveSection((prev) => (prev === nextId ? prev : nextId));
			const atTop = window.scrollY <= 1;
			setIsAtTop((prev) => (prev === atTop ? prev : atTop));
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

	const firstSectionId = sectionIds[0] ?? null;

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
	}, [activeSection, firstSectionId]);

	const renderNavLink = (
		entry: AnchorEntry,
		index: number,
		side: 'left' | 'right',
		isOuter: boolean,
		classes?: { item?: string; index?: string },
	) => {
		const id = t(entry.hrefKey);
		const isActive = activeSection === id;
		const skew = isOuter ? menuVars.skew : menuVars.skew.half();
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
						{t(entry.labelKey)}
					</span>
					<span className={s.text}>{t(entry.labelKey)}</span>
				</Link>
			</li>
		);
	};

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
									onMouseEnter={handleLogoMouseEnter}
									onMouseLeave={handleLogoMouseLeave}
									onFocus={handleLogoFocus}
									onBlur={handleBlur}
									data-ui="link"
									data-at-top={isAtTop ? 'true' : 'false'}
									data-logo-anim={logoAnimationState}
								>
									<div className={s.logoClip}>
										<div className={s.logoWrap}>
											<Logo
												className={s.logo}
												colourState={
													logoAnimationState === 'enter' ? 'color' : 'mono'
												}
											/>
										</div>
									</div>
								</Link>
							</div>

							<ul
								className={clsx(s.list, s.transitionAfterFonts)}
								aria-label={t('menu-left_label')}
								data-side="left"
								style={getRotationStyle('left', navMetrics.width)}
							>
								{anchors.slice(0, 2).map((entry, idx) =>
									renderNavLink(entry, idx + 1, 'left', idx === 0, {
										item: s.item,
										index: idx === 0 ? s.item_1 : s.item_2,
									}),
								)}
							</ul>

							<ul
								className={clsx(s.list, s.transitionAfterFonts)}
								aria-label={t('menu-right_label')}
								data-side="right"
								style={getRotationStyle('right', navMetrics.width)}
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
					<nav
						className={clsx(s.localeChanger, s.transitionAfterFonts)}
						aria-label={t('localeChange')}
					>
						{AVAILABLE_LOCALES.filter((l) => l !== locale).map((l) => (
							<Link
								key={l}
								href={`/${l}`}
								className={clsx(s.link, s.localeLink)}
								hrefLang={l}
								data-ui="link"
							>
								<span className={s.fakeShadow} aria-hidden={true}>
									{TRANSLATIONS[l]['abbreviated-label']}
								</span>
								<span className={s.text}>
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
