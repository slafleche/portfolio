'use client';

import { useCallback, type MouseEvent } from 'react';
import * as s from '@/styles/components/privacy.css';
import { sharedStrings } from '@/lib/sharedStrings';
import { useContactDialog } from './ContactDialogProvider';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';

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
