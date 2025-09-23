'use client';
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/userContent.css';
import ReactMarkdown from 'react-markdown';
import Card from '../../src/components/Card';
// import * as hero from '@/styles/components/hero.css';
import ImageByName from '../../src/components/ImageByName';


export default function HomePage() {
  const t = useT();

  return (
    <>
      {/* <ImageByName className={hero.image} name={'tech_bg'} alt={'Temp'} /> */}

      <h1>{t('hero')}</h1>

      <section>
        <Card
          title={t('split-dev_title')}
        >
          <ReactMarkdown>{t('split-dev_content')}</ReactMarkdown>
        </Card>

        <ImageByName
          name="portrait"
          title={t('image_portrait-title')}
          alt={t('image_portrait-alt')}
        />

        <Card title={t('split-design_title')}
        gradient="b">
          <ReactMarkdown>{t('split-design_content')}</ReactMarkdown>
        </Card>
      </section>

      <section id={t('about-href')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('about-content')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('approach-href')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('approach-content')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('case_study-href')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('case_study-content')}</ReactMarkdown>
        </div>
      </section>

      <section id={t('projects-href')}>
        <div className={s.userContent}>
          <ReactMarkdown>{t('projects-content')}</ReactMarkdown>
        </div>
      </section>
    </>
  );
}
