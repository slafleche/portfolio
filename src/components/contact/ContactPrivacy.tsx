'use client';

import { type MouseEvent,useCallback } from 'react';

import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import { sharedStrings } from '@/lib/sharedStrings';
import * as s from '@/styles/components/privacy.css';

import { useContactDialog } from './ContactDialogProvider';

type ContactPrivacyProps = {
  copy: ContactFormCopy['privacy'];
};

export function ContactPrivacy({ copy }: ContactPrivacyProps) {
  const contactDialog = useContactDialog();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      contactDialog.openPrivacy();
    },
    [
      contactDialog,
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
