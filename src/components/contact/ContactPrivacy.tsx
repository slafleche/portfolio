'use client';

import { type MouseEvent, useCallback } from 'react';

import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import { sharedStrings } from '@/lib/sharedStrings';
import * as s from '@/styles/components/privacy.css';

type ContactPrivacyProps = {
  copy: ContactFormCopy['privacy'];
  onOpenPrivacy: () => void;
};

export function ContactPrivacy({
  copy,
  onOpenPrivacy,
}: ContactPrivacyProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onOpenPrivacy();
    },
    [
      onOpenPrivacy,
    ],
  );

  return (
    <div className={s.privacyFinePrint}>
      {copy.text}{' '}
      <a
        href={sharedStrings.contactFormPolicyHash}
        className={s.link}
        onClick={handleClick}
        aria-haspopup="dialog"
      >
        {copy.linkLabel}
      </a>
    </div>
  );
}
