"use client";
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/content.css.ts';

export default function HomePage() {
  const t = useT();

  return (
    <>
      <h1>{t('title')}</h1>

      <section id={t('href-about')}>
        <div className={s.userContent}>{t('content-about')}</div>
      </section>

      <section id={t('href-philosophy')}>
        <div className={s.userContent}>{t('content-philosophy')}</div>
      </section>

      <section id={t('href-case_study')}>
        <div className={s.userContent}>{t('content-case_study')}</div>
      </section>

      <section id={t('href-clients')}>
        <div className={s.userContent}>{t('content-clients')}</div>
      </section>
    </>
  );
}
