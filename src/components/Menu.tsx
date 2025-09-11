'use client';

import Link from 'next/link';
import * as s from '@/styles/menu.css';
import Logo from '@/assets/SVG/logo.svg';
import { useT } from '@/lib/locales/useT';
import { useLocale } from '@/lib/locales/localeContext';
import { AVAILABLE_LOCALES, TRANSLATIONS } from '@/data/locales';

export default function Menu() {
  const t = useT();
  const { locale, root } = useLocale({ withLabel: true });

  // Todo add active link state and data-prop

  return (
    <>
      <div className={s.header}>
        <nav className={s.nav}>
          <ul className={s.list}>
            <li className={s.item}>
              <Link href={`#${t('href-about')}`}>{t('about')}</Link>
            </li>
            <li className={s.item}>
              <Link href={`#${t('href-philosophy')}`}>{t('philosophy')}</Link>
            </li>

            <li className={s.logo}>
              <Link href={root} className={s.logoLink} prefetch={false}>
                <Logo className={s.logo} />
              </Link>
            </li>

            <li className={s.item}>
              <Link href={`#${t('href-case_study')}`}>{t('case_study')}</Link>
            </li>

            <li className={s.item}>
              <Link href={`#${t('href-clients')}`}>{t('clients')}</Link>
            </li>

            <li className={s.headerNavItem}>
              {AVAILABLE_LOCALES.filter((l) => l !== locale).map((l) => (
                <Link key={l} href={`/${l}`} className={s.link} hrefLang={l}>
                  {TRANSLATIONS[l]['abbreviated-label']}
                </Link>
              ))}
            </li>
          </ul>
        </nav>
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
