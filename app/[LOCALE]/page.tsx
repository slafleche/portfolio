'use client';
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/userContent.css';
import { Head } from 'next/document';
import ReactMarkdown from 'react-markdown';

export default function HomePage() {
  const t = useT();

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta property="og:title" content={t('title')} />
        <meta property="og:description" content={t('description')} />
        <meta property="og:type" content="website" />
      </Head>
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

      <section id={t('href-projects')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('content-projects')}</ReactMarkdown>
        </div>
      </section>
    </>
  );
}
