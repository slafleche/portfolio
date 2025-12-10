'use client';

import { useCallback, type MouseEvent } from 'react';
import * as s from '@/styles/components/forms.css';
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
    <p className={s.privacy}>
      {copy.text}{' '}
      <a
        href={sharedStrings.contactFormPolicyHash}
        className={s.privacyLink}
        onClick={handleClick}
        aria-haspopup="dialog"
      >
        {copy.linkLabel}
      </a>
    </p>
  );
}
