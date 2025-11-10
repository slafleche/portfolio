'use client';

import { useMemo } from 'react';
import ContactForm, {
  type ContactFormDebugState,
} from '@/components/contact/ContactForm';
import {
  ContactDialogContext,
  type ContactDialogContextValue,
} from '@/components/contact/ContactDialogProvider';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';

type ContactFormPreviewProps = {
  copy: ContactFormCopy;
  privacyCopy: PrivacyCopy;
  locale: string;
  debugState: ContactFormDebugState;
};

const noop = () => {};

export default function ContactFormPreview({
  copy,
  privacyCopy,
  locale,
  debugState,
}: ContactFormPreviewProps) {
  const contextValue = useMemo<ContactDialogContextValue>(
    () => ({
      open: noop,
      close: noop,
      isOpen: false,
      openPrivacy: noop,
      closePrivacy: noop,
      isPrivacyOpen: false,
    }),
    [],
  );

  return (
    <ContactDialogContext.Provider value={contextValue}>
      <ContactForm
        copy={copy}
        locale={locale}
        privacyCopy={privacyCopy}
        debugState={debugState}
      />
    </ContactDialogContext.Provider>
  );
}
