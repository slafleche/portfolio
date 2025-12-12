'use client';

import {
  createContext,
  useContext,
} from 'react';

export type ContactDialogTitleKey =
  | 'form'
  | 'loading'
  | 'success'
  | 'failure'
  | 'catastrophic';

export type ContactDialogTitleContextValue = {
  titleKey: ContactDialogTitleKey | null;
  setTitleKey: (key: ContactDialogTitleKey | null) => void;
};

const defaultContextValue: ContactDialogTitleContextValue = {
  titleKey: null,
  // Default no-op implementation so ContactForm and related
  // components can safely call setTitleKey even when rendered
  // outside of a ContactDialogProvider (for example, in tests
  // that stub only the open/close context).
  setTitleKey: () => {},
};

export const ContactDialogTitleContext =
  createContext<ContactDialogTitleContextValue>(defaultContextValue);

export function useContactDialogTitle() {
  return useContext(ContactDialogTitleContext);
}

