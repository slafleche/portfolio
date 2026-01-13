'use client';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Markdown } from '@/components/Markdown';
import { stripContactFormScenarioFromLocation } from '@/dev/scenarios/contactForm.adapter';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { sharedStrings } from '@/lib/sharedStrings';
import * as dialogStyles from '@/styles/components/contactDialog.css';
import * as privacyStyles from '@/styles/components/privacy.css';

import { GlassPanel } from '../GlassPanel';
import ImageByName from '../ImageByName';
import Content from '../responsive/Content';
import { CloseButton } from './CloseButton';
import {
  ContactDialogTitleContext,
  type ContactDialogTitleKey,
} from './contactDialogTitle.context';
import ContactForm from './ContactForm';

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

const resolveIntentFromHash = (hash?: string | null): ModalIntent => {
  const normalized = normalizeHash(hash);
  if (!normalized) return 'none';

  const direct = HASH_TO_INTENT[normalized];
  if (direct) return direct;

  const entries = Object.entries(HASH_TO_INTENT).sort(
    (
      [
        a,
      ],
      [
        b,
      ],
    ) => b.length - a.length,
  );

  for (const [
    key,
    intent,
  ] of entries) {
    if (normalized.startsWith(key)) {
      return intent;
    }
  }

  return 'none';
};

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

const resolveTitleKey = (
  rawKey: ContactDialogTitleKey | null,
): ContactDialogTitleKey => {
  if (
    rawKey === 'loading' ||
    rawKey === 'success' ||
    rawKey === 'failure' ||
    rawKey === 'catastrophic'
  ) {
    return rawKey;
  }
  return 'form';
};

const resolveDialogTitle = (
  copy: ContactFormCopy,
  key: ContactDialogTitleKey,
) => {
  switch (key) {
    case 'loading':
      return copy.statuses.sending;
    case 'success':
      return copy.headings.success;
    case 'failure':
    case 'catastrophic':
      return copy.headings.error;
    case 'form':
    default:
      return copy.headings.form;
  }
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
  turnstileSiteKey?: string | null;
};

export function ContactDialogProvider({
  children,
  formCopy,
  privacyCopy,
  closeLabel,
  turnstileSiteKey = null,
}: ContactDialogProviderProps) {
  const [
    intent,
    setIntent,
  ] = useState<ModalIntent>('none');
  const [
    titleKey,
    setTitleKey,
  ] = useState<ContactDialogTitleKey | null>(null);
  const intentRef = useRef<ModalIntent>('none');
  const baseHistorySeededRef = useRef(false);
  const previousIntentRef = useRef<ModalIntent>('none');
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const lastNonModalHashRef = useRef<string | null>(null);

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
      const { hash } = window.location;
      const hashIntent = resolveIntentFromHash(hash);
      if (hash && hashIntent === 'none') {
        lastNonModalHashRef.current = hash;
      }
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
    setTitleKey('form');
    if (typeof window !== 'undefined') {
      const { hash } = window.location;
      const normalizedHash = normalizeHash(hash);
      const intentForCurrent = resolveIntentFromHash(normalizedHash);
      if (hash && intentForCurrent === 'none') {
        lastNonModalHashRef.current = hash;
      }
    }
    applyIntent('contact', { history: 'push' });
  }, [
    applyIntent,
    captureFocusAnchor,
    setTitleKey,
  ]);

  const closeContact = useCallback(() => {
    applyIntent('none', { history: 'none' });
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location;
      const previousHash = lastNonModalHashRef.current;
      const intentForPrevious = resolveIntentFromHash(previousHash);
      const shouldRestoreHash =
        Boolean(previousHash) && intentForPrevious === 'none';
      const nextUrl = shouldRestoreHash
        ? `${pathname}${search}${previousHash}`
        : `${pathname}${search}`;
      window.history.replaceState(window.history.state, '', nextUrl);
    }
    stripContactFormScenarioFromLocation();
    setTitleKey(null);
    setTimeout(restoreFocusAnchor, 0);
  }, [
    applyIntent,
    setTitleKey,
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

  const effectiveTitleKey = resolveTitleKey(titleKey);
  const dialogTitle = resolveDialogTitle(formCopy, effectiveTitleKey);

  const titleContextValue = useMemo(
    () => ({
      titleKey,
      setTitleKey,
    }),
    [
      titleKey,
      setTitleKey,
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
          <Dialog.Overlay className={dialogStyles.overlay}>
            <Dialog.Content className={dialogStyles.content}>
              <div className={dialogStyles.panel}>
                <ImageByName
                  className={dialogStyles.bgImage}
                  title={formCopy.bgTitle}
                  name={'night_forest'}
                  alt={formCopy.bgDescription}
                />
                <Content
                  className={dialogStyles.panelContent}
                  data-ui="contact-form"
                >
                  <GlassPanel>
                    <div className={dialogStyles.header}>
                      <Dialog.Title
                        className={dialogStyles.heading}
                        data-modal="title"
                      >
                        {dialogTitle}
                      </Dialog.Title>
                      <div className={dialogStyles.closeButtonWrap}>
                        <Dialog.Close asChild>
                          <CloseButton
                            label={closeLabel}
                            className={dialogStyles.closeButton}
                            closeOverlayClassName={
                              dialogStyles.scoopGradient
                            }
                          />
                        </Dialog.Close>
                      </div>
                    </div>
                    <Dialog.Description asChild>
                      <p data-visible="sc-only">{dialogTitle}</p>
                    </Dialog.Description>
                    <ContactDialogTitleContext.Provider
                      value={titleContextValue}
                    >
                      <ContactForm
                        copy={formCopy}
                        turnstileSiteKey={turnstileSiteKey}
                        onOpenPrivacy={openPrivacy}
                      />
                    </ContactDialogTitleContext.Provider>
                  </GlassPanel>
                </Content>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={isPrivacyOpen}
        onOpenChange={handlePrivacyOpenChange}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={privacyStyles.overlay} />
          <Dialog.Content className={privacyStyles.dialog}>
            <div className={privacyStyles.panel}>
              <div
                className={clsx(
                  privacyStyles.header,
                  privacyStyles.glassyBack,
                )}
              >
                <Dialog.Title
                  className={privacyStyles.title}
                  data-modal="title"
                >
                  {privacyCopy.title}
                </Dialog.Title>
                <div className={privacyStyles.closeButtonWrap}>
                  <Dialog.Close asChild>
                    <CloseButton
                      label={formCopy.privacy.closeLabel}
                      closeOverlayClassName={
                        dialogStyles.scoopGradient
                      }
                      className={dialogStyles.closeButton}
                    />
                  </Dialog.Close>
                </div>
              </div>

              <Dialog.Description asChild>
                <Content
                  data-ui="privacy-content"
                  className={privacyStyles.content}
                >
                  <div className={privacyStyles.scrollArea}>
                    <div className={privacyStyles.container}>
                      <Markdown
                        source={privacyCopy.content}
                        className={privacyStyles.text}
                      />
                    </div>
                  </div>
                </Content>
              </Dialog.Description>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ContactDialogContext.Provider>
  );
}
