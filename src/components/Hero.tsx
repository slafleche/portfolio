'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
// import BokehOverlay from './Bokeh';
import { useT } from '@/lib/locales/useT';

type Props = {
  className?: string;
};

export default function Hero({ className }: Props) {
  const t = useT();
  return (
    <section className={clsx(s.hero, className)}>
      <h1 className={s.heading}>{t('hero')}</h1>
      <p className={s.paragraph}>{t('hero-subtitle')}</p>
    </section>
  );
}
