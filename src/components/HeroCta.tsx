import clsx from 'clsx';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import SendIcon from '@/components/icons/SendIcon';
import * as ctaStyles from '@/styles/components/cta.css';
import {
  glassLinkShine,
  glassyHover,
} from '@/styles/components/glassyButtons.css';

type HeroCtaCopy = {
  ctaLabel: string;
  ctaText: string;
};

type HeroCtaProps = {
  copy: HeroCtaCopy;
};

export function HeroCta({ copy }: HeroCtaProps) {
  return (
    <ContactDialogTrigger
      className={clsx(ctaStyles.root, glassyHover)}
      data-ready="true"
      aria-label={copy.ctaLabel}
    >
      <span
        className={clsx(
          ctaStyles.ctaInner,
          ctaStyles.scoopedGradient,
        )}
      >
        <SendIcon className={ctaStyles.ctaIcon} aria-hidden />
        <span className={ctaStyles.ctaText}>{copy.ctaText}</span>
      </span>
      <div className={glassLinkShine} aria-hidden="true" />
    </ContactDialogTrigger>
  );
}
