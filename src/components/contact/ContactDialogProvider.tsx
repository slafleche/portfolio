'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as s from '@/styles/components/contactDialog.css';

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
};

export function ContactDialogProvider({
  children,
}: ContactDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

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
                  Let's work together
                </Dialog.Title>
                <Dialog.Description asChild>
                  <div className={s.body}>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p>
                      Ut enim ad minim veniam, quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex
                      ea commodo consequat.
                    </p>
                  </div>
                </Dialog.Description>
                <p className={s.body}>
                  (TODO: swap the placeholder text with the real
                  contact details.)
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ContactDialogContext.Provider>
  );
}
