'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as s from '@/styles/components/contactDialog.css';
import ContactForm from './ContactForm';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import { resolveLocale } from '@/lib/locales/locale';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';

type ContactDialogContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const ContactDialogContext =
  createContext<ContactDialogContextValue | null>(null);

export function useContactDialog() {
  const ctx = useContext(ContactDialogContext);
  if (!ctx) {
    throw new Error(
      'useContactDialog must be used within a ContactDialogProvider',
    );
  }
  return ctx;
}

type ContactDialogProviderProps = {
  children: ReactNode;
  formCopy: ContactFormCopy;
  locale: string;
  privacyHref?: string;
};

export function ContactDialogProvider({
  children,
  formCopy,
  locale,
  privacyHref,
}: ContactDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resolvedLocale = resolveLocale(locale);
  const localizedPrivacySlug =
    canonicalToLocalizedSlugs[resolvedLocale]?.privacy ??
    'privacy';
  const privacyPath =
    privacyHref ?? `/${resolvedLocale}/${localizedPrivacySlug}`;

  const contextValue = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <ContactDialogContext.Provider value={contextValue}>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        {children}
        <Dialog.Portal>
          <Dialog.Overlay className={s.overlay} />
          <Dialog.Content className={s.content}>
            <div className={s.panel}>
              <div className={s.panelContent}>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className={s.closeButton}
                    aria-label="Close contact dialog"
                  >
                    ×
                  </button>
                </Dialog.Close>
                <Dialog.Title className={s.heading}>
                  {formCopy.heading}
                </Dialog.Title>
                <Dialog.Description asChild>
                  <div className={s.body}>
                    <p>{formCopy.intro}</p>
                  </div>
                </Dialog.Description>
                <ContactForm
                  copy={formCopy}
                  locale={locale}
                  privacyHref={privacyPath}
                />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ContactDialogContext.Provider>
  );
}
