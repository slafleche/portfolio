'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import SendIcon from '@/components/icons/SendIcon';
import * as ctaStyles from '@/styles/components/ctaHero.css';
import {
  glassLinkShine,
  glassyButtonHover,
} from '@/styles/components/glassyButtons.css';

type HeroCtaCopy = {
  ctaLabel: string;
  ctaText: string;
};

type HeroCtaProps = {
  copy: HeroCtaCopy;
};

export function HeroCta({ copy }: HeroCtaProps) {
  const [
    ctaAnim,
    setCtaAnim,
  ] = useState<'forward' | null>(null);
  const [
    ctaSeq,
    setCtaSeq,
  ] = useState(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);

  const triggerAnim = () => {
    setCtaSeq((prev) => (prev + 1) % 2);
    setCtaAnim('forward');
  };

  const handlePointerEnter = () => {
    hoverRef.current = true;
    if (!focusRef.current) {
      triggerAnim();
    }
  };
  const handlePointerLeave = () => {
    hoverRef.current = false;
  };
  const handleFocus = () => {
    focusRef.current = true;
    if (!hoverRef.current) {
      triggerAnim();
    }
  };
  const handleBlur = () => {
    focusRef.current = false;
  };

  return (
    <ContactDialogTrigger
      className={clsx(ctaStyles.root, glassyButtonHover)}
      data-ready="true"
      data-cta-anim={ctaAnim ?? undefined}
      data-cta-seq={ctaSeq}
      aria-label={copy.ctaLabel}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className={clsx(ctaStyles.ctaInner, ctaStyles.scoopedGradient)}>
        <SendIcon className={ctaStyles.ctaIcon} aria-hidden />
        <span className={ctaStyles.ctaText}>{copy.ctaText}</span>
      </span>
      <div className={glassLinkShine} aria-hidden="true" />
    </ContactDialogTrigger>
  );
}
