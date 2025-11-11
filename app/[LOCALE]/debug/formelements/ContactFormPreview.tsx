'use client';

import { useMemo, useRef, useState } from 'react';
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
  debugState: ContactFormDebugState;
};

const noop = () => {};

export default function ContactFormPreview({
  copy,
  privacyCopy,
  debugState,
}: ContactFormPreviewProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const overlayButtonRef = useRef<HTMLButtonElement | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

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

  const showOverlay = () => setOverlayVisible(true);
  const hideOverlay = () => setOverlayVisible(false);

  return (
    <ContactDialogContext.Provider value={contextValue}>
      <div
        style={{
          position: 'relative',
          paddingBottom: debugState.showSubmitOverlay ? 32 : 0,
        }}
        onMouseEnter={showOverlay}
        onMouseLeave={hideOverlay}
        onFocusCapture={showOverlay}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            hideOverlay();
          }
        }}
      >
        <ContactForm
          copy={copy}
          privacyCopy={privacyCopy}
          debugState={debugState}
          formRef={formRef}
        />

        {debugState.showSubmitOverlay ? (
          <button
            ref={overlayButtonRef}
            type="button"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid rgba(245,240,255,0.4)',
              background: 'rgba(7,5,14,0.85)',
              color: '#f5f0ff',
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              opacity: overlayVisible ? 0.85 : 0,
              transition: 'opacity 160ms ease',
              pointerEvents: overlayVisible ? 'auto' : 'none',
            }}
            onFocus={showOverlay}
            onBlur={hideOverlay}
            tabIndex={overlayVisible ? 0 : -1}
            aria-label="Déclencher un submit (debug uniquement)"
          >
            Test submit
          </button>
        ) : null}
      </div>
    </ContactDialogContext.Provider>
  );
}
