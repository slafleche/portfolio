'use client';
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/userContent.css';
import ReactMarkdown from 'react-markdown';

export default function HomePage() {
  const t = useT();

  return (
    <>
      <h1>{t('title')}</h1>

      <section id={t('href-about')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('content-about')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('href-philosophy')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('content-philosophy')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('href-case_study')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('content-case_study')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('href-clients')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('content-clients')}</ReactMarkdown>
        </div>
      </section>
    </>
  );
}
