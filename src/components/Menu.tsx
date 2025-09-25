'use client';

import Link from 'next/link';
import * as s from '@/styles/menu.css';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import {
	AVAILABLE_LOCALES,
	TRANSLATIONS,
	type Messages,
} from '@/data/locales';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import { useEffect, useMemo, useState } from 'react';

export default function Menu() {
	const t = useT();
	const { locale, root } = useLocale({ withLabel: true });
	const [mounted, setMounted] = useState(false);
	const [activeSection, setActiveSection] = useState<string | null>(null);

	type AnchorKey = Extract<keyof Messages, `${string}-href`>;
	type AnchorEntry = { hrefKey: AnchorKey; labelKey: keyof Messages };

	const anchors = useMemo<readonly AnchorEntry[]>(
		() => [
			{ hrefKey: 'about-href', labelKey: 'about' },
			{ hrefKey: 'approach-href', labelKey: 'approach' },
			{ hrefKey: 'case_study-href', labelKey: 'case_study' },
			{ hrefKey: 'projects-href', labelKey: 'projects' },
		],
		[],
	);

	const sectionIds = useMemo(() => {
		const messages = TRANSLATIONS[locale];
		return anchors.map(({ hrefKey }) => messages[hrefKey]);
	}, [anchors, locale]);

	const renderNavLink = (
		entry: AnchorEntry,
		classes?: { item?: string; index?: string },
	) => {
		const id = t(entry.hrefKey);
		const isActive = activeSection === id;
		return (
			<li className={clsx(classes?.item, classes?.index)}>
				<Link
					href={`#${id}`}
					className={s.navLink}
					data-active={isActive}
					aria-current={isActive ? 'true' : undefined}
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
					<nav className={clsx(s.nav)}>
						<div className={clsx(s.contents)}>
							<div className={clsx(s.logoItem, s.item)}>
								<Link href={root} className={s.logoLink} prefetch={false}>
									<Logo className={s.logo} />
								</Link>
							</div>

							<ul
								className={s.list}
								aria-label={t('menu-left_label')}
								data-side="left"
							>
								{renderNavLink(anchors[0], { item: s.item, index: s.item_1 })}
								{renderNavLink(anchors[1], { item: s.item, index: s.item_2 })}
							</ul>

							<ul
								className={s.list}
								aria-label={t('menu-right_label')}
								data-side="right"
							>
								{renderNavLink(anchors[2], { item: s.item, index: s.item_3 })}
								{renderNavLink(anchors[3], { item: s.item, index: s.item_4 })}
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
