'use client';

import Link from 'next/link';
import * as s from '@/styles/menu.css';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS } from '@/data/locales';
import clsx from 'clsx';
import Arch from './Arch';
import Logo from './Logo';
import { useEffect, useMemo, useState } from 'react';

export default function Menu() {
  const t = useT();
  const { locale, root } = useLocale({ withLabel: true });
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sectionIds = useMemo(
    () => [
      t('about-href'),
      t('approach-href'),
      t('case_study-href'),
      t('projects-href'),
    ],
    [t, locale],
  );

  const renderNavLink = (idKey: string, labelKey: string) => {
    const id = t(idKey);
    const isActive = activeSection === id;
    return (
      <Link
        href={`#${id}`}
        className={s.navLink}
        data-active={isActive}
        aria-current={isActive ? 'true' : undefined}
      >
        {t(labelKey)}
      </Link>
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

    let ticking = false;

    const updateActiveSection = () => {
      ticking = false;
      const threshold = window.innerHeight * 0.25;
      let currentId: string | null = sections[0]?.id ?? null;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top - threshold <= 0) {
          currentId = section.id;
        }
      }

      setActiveSection((prev) => (prev === currentId ? prev : currentId));
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionIds]);

  useEffect(() => {
    const base = `${window.location.pathname}${window.location.search}`;
    const target = activeSection ? `${base}#${activeSection}` : base;
    const current = `${base}${window.location.hash}`;

    if (target !== current) {
      window.history.replaceState(null, '', target);
    }
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
            <li className={clsx(s.logoItem, s.item)}>
              <Link href={root} className={s.logoLink} prefetch={false}>
                <Logo className={s.logo} />
              </Link>
            </li>

            <ul
              className={s.list}
              aria-label={t('menu-left_label')}
              data-side="left"
              role="group"
            >
              <li className={clsx(s.item, s.item_1)}>
                {renderNavLink('about-href', 'about')}
              </li>
              <li className={clsx(s.item, s.item_2)}>
                {renderNavLink('approach-href', 'approach')}
              </li>
            </ul>

            <ul
              className={s.list}
              aria-label={t('menu-left_label')}
              data-side="right"
              role="group"
            >
              <li className={clsx(s.item, s.item_3)}>
                {renderNavLink('case_study-href', 'case_study')}
              </li>
              <li className={clsx(s.item, s.item_4)}>
                {renderNavLink('projects-href', 'projects')}
              </li>
            </ul>
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
