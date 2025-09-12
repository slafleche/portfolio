'use client';
import * as s from '@/styles/components/card.css.ts';
import type { ReactNode } from 'react';

type Props = {
  title?: ReactNode;
  children?: ReactNode;
  level?: '3' | '4' | '5';
};

export default function Card({ title, children }: Props) {
  return (
    <div className={s.card}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
