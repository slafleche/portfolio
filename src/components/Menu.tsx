'use client';

import Link from 'next/link';
import * as s from '@/styles/menu.css';
import Logo from '@/assets/SVG/logo.svg';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS } from '@/data/locales';
import clsx from 'clsx';
import Arch from './Arch';

export default function Menu() {
  const t = useT();
  const { locale, root } = useLocale({ withLabel: true });

  // Todo add active link state and data-prop

  return (
    <>
      <div className={s.menu}>
        <Arch>
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
                <Link href={`#${t('about-href')}`} className={s.navLink}>
                  {t('about')}
                </Link>
              </li>
              <li className={clsx(s.item, s.item_2)}>
                <Link href={`#${t('approach-href')}`} className={s.navLink}>
                  {t('approach')}
                </Link>
              </li>
            </ul>

            <ul
              className={s.list}
              aria-label={t('menu-left_label')}
              data-side="right"
              role="group"
            >
              <li className={clsx(s.item, s.item_3)}>
                <Link href={`#${t('case_study-href')}`} className={s.navLink}>
                  {t('case_study')}
                </Link>
              </li>
              <li className={clsx(s.item, s.item_4)}>
                <Link href={`#${t('projects-href')}`} className={s.navLink}>
                  {t('projects')}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t('localeChange')}>
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
