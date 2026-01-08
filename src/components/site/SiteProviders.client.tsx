'use client';

import type { ReactNode } from 'react';

import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';

type SiteProvidersProps = {
  children: ReactNode;
  formCopy: ContactFormCopy;
  privacyCopy: PrivacyCopy;
  closeLabel: string;
  turnstileSiteKey?: string | null;
};

export default function SiteProviders({
  children,
  formCopy,
  privacyCopy,
  closeLabel,
  turnstileSiteKey = null,
}: SiteProvidersProps) {
  return (
    <WindowSizeProvider>
      <ResponsiveProvider>
        <ContactDialogProvider
          formCopy={formCopy}
          privacyCopy={privacyCopy}
          closeLabel={closeLabel}
          turnstileSiteKey={turnstileSiteKey}
        >
          {children}
        </ContactDialogProvider>
      </ResponsiveProvider>
    </WindowSizeProvider>
  );
}
