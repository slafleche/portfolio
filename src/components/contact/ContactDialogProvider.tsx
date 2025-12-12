'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as dialogStyles from '@/styles/components/contactDialog.css';
import * as formStyles from '@/styles/components/forms.css';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { Markdown } from '@/components/Markdown';
import { sharedStrings } from '@/lib/sharedStrings';
import ContactForm from './ContactForm';
import { CloseButton } from './CloseButton';

type ModalIntent = 'none' | 'contact' | 'contact-policy';

const CONTACT_HASH = sharedStrings.contactFormHash;
const POLICY_HASH = sharedStrings.contactFormPolicyHash;

const HASH_BY_INTENT: Record<ModalIntent, string> = {
  none: '',
  contact: CONTACT_HASH,
  'contact-policy': POLICY_HASH,
};

const HASH_TO_INTENT: Record<string, ModalIntent> = Object.entries(
  HASH_BY_INTENT,
).reduce(
  (
    map,
    [
      intent,
      hash,
    ],
  ) => {
    if (!hash) return map;
    map[hash.toLowerCase()] = intent as ModalIntent;
    return map;
  },
  {} as Record<string, ModalIntent>,
);

const HASH_ALIASES: Record<string, ModalIntent> = {
  '#contact': 'contact',
  '#contactform': 'contact',
  '#contactpolicy': 'contact-policy',
};

Object.assign(HASH_TO_INTENT, HASH_ALIASES);

const normalizeHash = (hash?: string | null) =>
  typeof hash === 'string' ? hash.trim().toLowerCase() : '';

const resolveIntentFromHash = (hash?: string | null): ModalIntent =>
  HASH_TO_INTENT[normalizeHash(hash)] ?? 'none';

const buildUrlForIntent = (intent: ModalIntent) => {
  if (typeof window === 'undefined') return '';
  const { pathname, search } = window.location;
  return `${pathname}${search}${HASH_BY_INTENT[intent]}`;
};

const getCurrentUrl = () => {
  if (typeof window === 'undefined') return '';
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

export type ContactDialogContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  openPrivacy: () => void;
  closePrivacy: () => void;
  isPrivacyOpen: boolean;
};

export const ContactDialogContext =
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
  privacyCopy: PrivacyCopy;
  closeLabel: string;
};

export function ContactDialogProvider({
  children,
  formCopy,
  privacyCopy,
  closeLabel,
}: ContactDialogProviderProps) {
  const [
    intent,
    setIntent,
  ] = useState<ModalIntent>('none');
  const intentRef = useRef<ModalIntent>('none');
  const baseHistorySeededRef = useRef(false);
  const previousIntentRef = useRef<ModalIntent>('none');
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const captureFocusAnchor = useCallback(() => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement;
    if (active && active instanceof HTMLElement) {
      previousFocusRef.current = active;
    }
  }, []);

  const restoreFocusAnchor = useCallback(() => {
    const target = previousFocusRef.current;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
    previousFocusRef.current = null;
  }, []);

  const applyIntent = useCallback(
    (
      nextIntent: ModalIntent,
      options?: { history?: 'push' | 'replace' | 'none' },
    ) => {
      const prevIntent = intentRef.current;
      if (prevIntent === nextIntent) return;

      intentRef.current = nextIntent;
      setIntent(nextIntent);

      const historyMode = options?.history ?? 'none';
      if (historyMode === 'none') return;
      if (typeof window === 'undefined') return;

      const targetUrl = buildUrlForIntent(nextIntent);
      const currentUrl = getCurrentUrl();
      if (targetUrl === '' || currentUrl === targetUrl) {
        return;
      }

      const method =
        historyMode === 'replace' ? 'replaceState' : 'pushState';
      window.history[method](window.history.state, '', targetUrl);
    },
    [],
  );

  const ensureBaseEntry = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (baseHistorySeededRef.current) return null;
    const { hash } = window.location;
    if (!hash) return null;
    const baseUrl = buildUrlForIntent('none');
    if (!baseUrl) return null;
    const originalHash = hash;
    const historyState: unknown = window.history.state;
    baseHistorySeededRef.current = true;
    window.history.replaceState(historyState, '', baseUrl);
    return {
      baseUrl,
      hash: originalHash,
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { hash } = window.location;
    const normalizedHash = normalizeHash(hash);
    if (!hash) return;
    if (normalizedHash === POLICY_HASH) {
      return;
    }
    const baseSeed = ensureBaseEntry();
    if (!baseSeed) return;
    const restoredUrl = `${baseSeed.baseUrl}${baseSeed.hash}`;
    window.history.pushState(window.history.state, '', restoredUrl);
  }, [
    ensureBaseEntry,
  ]);

  /**
   * Always ensure the browser history reads: base (no hash) →
   * #contact-form → #contact-form-policy This protects Back-button
   * behavior for deep links, manual hash edits, and programmatic
   * privacy opens across locales.
   */
  const seedPolicyStack = useCallback(() => {
    if (typeof window === 'undefined') return;
    ensureBaseEntry();
    const contactUrl = buildUrlForIntent('contact');
    const policyUrl = buildUrlForIntent('contact-policy');
    if (!contactUrl || !policyUrl) return;
    const historyState: unknown = window.history.state;
    window.history.pushState(historyState, '', contactUrl);
    window.history.pushState(historyState, '', policyUrl);
  }, [
    ensureBaseEntry,
  ]);

  useEffect(() => {
    const prevIntent = previousIntentRef.current;
    if (intent === 'contact-policy' && prevIntent !== 'contact') {
      seedPolicyStack();
    }
    previousIntentRef.current = intent;
  }, [
    intent,
    seedPolicyStack,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromLocation = () => {
      const hashIntent = resolveIntentFromHash(window.location.hash);
      applyIntent(hashIntent, { history: 'none' });
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [
    applyIntent,
  ]);

  const openContact = useCallback(() => {
    captureFocusAnchor();
    applyIntent('contact', { history: 'push' });
  }, [
    applyIntent,
    captureFocusAnchor,
  ]);

  const closeContact = useCallback(() => {
    applyIntent('none', { history: 'replace' });
    setTimeout(restoreFocusAnchor, 0);
  }, [
    applyIntent,
    restoreFocusAnchor,
  ]);

  const openPrivacy = useCallback(() => {
    const prevIntent = intentRef.current;
    const historyMode = prevIntent === 'contact' ? 'push' : 'none';
    applyIntent('contact-policy', { history: historyMode });
  }, [
    applyIntent,
  ]);

  const closePrivacy = useCallback(() => {
    applyIntent('contact', { history: 'replace' });
  }, [
    applyIntent,
  ]);

  const isOpen = intent !== 'none';
  const isPrivacyOpen = intent === 'contact-policy';

  const handlePrivacyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openPrivacy();
      } else {
        closePrivacy();
      }
    },
    [
      closePrivacy,
      openPrivacy,
    ],
  );

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        closeContact();
      } else {
        openContact();
      }
    },
    [
      closeContact,
      openContact,
    ],
  );

  const privacyUpdated =
    typeof privacyCopy.updated === 'string'
      ? privacyCopy.updated.trim()
      : '';

  const contextValue = useMemo(
    () => ({
      isOpen,
      open: openContact,
      close: closeContact,
      openPrivacy,
      closePrivacy,
      isPrivacyOpen,
    }),
    [
      closeContact,
      isOpen,
      isPrivacyOpen,
      openContact,
      openPrivacy,
      closePrivacy,
    ],
  );

  return (
    <ContactDialogContext.Provider value={contextValue}>
      <Dialog.Root
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
      >
        {children}
        <Dialog.Portal>
          <Dialog.Overlay className={dialogStyles.overlay} />
          <Dialog.Content className={dialogStyles.content}>
            <div className={dialogStyles.panel}>
              <div className={dialogStyles.panelContent}>
                <Dialog.Close asChild>
                  <CloseButton
                    label={closeLabel}
                    className={dialogStyles.closeButton}
                  />
                </Dialog.Close>
                <Dialog.Title className={dialogStyles.heading}>
                  {formCopy.heading}
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className={formStyles.visuallyHidden}>
                    {formCopy.heading}
                  </p>
                </Dialog.Description>
                <ContactForm copy={formCopy} />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={isPrivacyOpen}
        onOpenChange={handlePrivacyOpenChange}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={formStyles.privacyOverlay} />
          <Dialog.Content className={formStyles.privacyDialog}>
            <div className={formStyles.privacyPanel}>
              <Dialog.Title className={formStyles.privacyTitle}>
                {privacyCopy.title}
              </Dialog.Title>
              {privacyUpdated ? (
                <p className={formStyles.privacyUpdated}>
                  {privacyUpdated}
                </p>
              ) : null}
              <Dialog.Description asChild>
                <Markdown
                  source={privacyCopy.content}
                  className={formStyles.privacyBody}
                />
              </Dialog.Description>
              <Dialog.Close asChild>
                <CloseButton
                  label={formCopy.privacy.closeLabel}
                  className={formStyles.privacyCloseIcon}
                />
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ContactDialogContext.Provider>
  );
}
