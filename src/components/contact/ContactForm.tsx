'use client';

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  type MouseEvent,
} from 'react';
import * as s from '@/styles/components/forms.css';
import { FormBlocksProvider } from './formBlocks.context';
import { NameBlock } from './blocks/NameBlock';
import { EmailBlock } from './blocks/EmailBlock';
import { MessageBlock } from './blocks/MessageBlock';
import { TurnstileBlock } from './blocks/TurnstileBlock';
import { HoneypotBlock } from './blocks/HoneypotBlock';
import type {
  ContactFormProps,
  TurnstileState,
} from './contactForm.types';
import { sharedStrings } from '@/lib/sharedStrings';
import { ContactDialogContext } from './ContactDialogProvider';

const DEFAULT_ACTION_URL = '/api/contact';
const DEFAULT_TURNSTILE_TOKEN = 'mock-turnstile-token';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (id?: string) => void;
};

type ExtendedWindow = Window & { turnstile?: TurnstileApi };

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Turnstile requires a browser environment.'),
    );
  }
  const extendedWindow = window as ExtendedWindow;
  if (extendedWindow.turnstile) {
    return Promise.resolve();
  }
  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }
  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), {
        once: true,
      });
      existing.addEventListener(
        'error',
        () => {
          turnstileScriptPromise = null;
          reject(new Error('Turnstile script failed to load.'));
        },
        { once: true },
      );
      return;
    }
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error('Turnstile script failed to load.'));
    };
    document.head.appendChild(script);
  });
  return turnstileScriptPromise;
};

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  formRef = null,
  copy,
  ...rest
}: ContactFormProps) {
  void rest;

  const [
    nameValue,
    setNameValue,
  ] = useState('');
  const [
    emailValue,
    setEmailValue,
  ] = useState('');
  const [
    messageValue,
    setMessageValue,
  ] = useState('');
  const [
    honeypotValue,
    setHoneypotValue,
  ] = useState('');
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
  const turnstileEnabled = Boolean(turnstileSiteKey);
  const [
    turnstileStatus,
    setTurnstileStatus,
  ] = useState<TurnstileState>(
    turnstileEnabled ? 'loading' : 'bypassed',
  );
  const [
    turnstileToken,
    setTurnstileToken,
  ] = useState(
    turnstileEnabled ? '' : DEFAULT_TURNSTILE_TOKEN,
  );
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const contactDialog = useContext(ContactDialogContext);

  const handleNameChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setNameValue(event.target.value);
  }, []);

  const handleEmailChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setEmailValue(event.target.value);
  }, []);

  const handleMessageChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >((event) => {
    setMessageValue(event.target.value);
  }, []);
  const handleHoneypotChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setHoneypotValue(event.target.value);
  }, []);
  const shouldRenderTurnstileWidget =
    turnstileEnabled;

  useEffect(() => {
    if (!shouldRenderTurnstileWidget || !turnstileSiteKey) return;
    let cancelled = false;
    setTurnstileStatus('loading');
    const mountWidget = async () => {
      try {
        await loadTurnstileScript();
        if (cancelled) return;
        const extendedWindow = window as ExtendedWindow;
        const turnstileApi = extendedWindow.turnstile;
        const container = turnstileContainerRef.current;
        if (!turnstileApi || !container) {
          throw new Error('Turnstile unavailable');
        }
        const widgetId = turnstileApi.render(container, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => {
            if (cancelled) return;
            setTurnstileToken(token);
            setTurnstileStatus('verified');
          },
          'expired-callback': () => {
            if (cancelled) return;
            setTurnstileToken('');
            setTurnstileStatus('expired');
          },
          'error-callback': () => {
            if (cancelled) return;
            setTurnstileStatus('error');
          },
        });
        turnstileWidgetIdRef.current = widgetId;
        setTurnstileStatus('ready');
      } catch {
        if (!cancelled) {
          setTurnstileStatus('error');
        }
      }
    };
    void mountWidget();
    return () => {
      cancelled = true;
      const extendedWindow = window as ExtendedWindow;
      const turnstileApi = extendedWindow.turnstile;
      if (turnstileApi && turnstileWidgetIdRef.current) {
        turnstileApi.reset(turnstileWidgetIdRef.current);
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [
    shouldRenderTurnstileWidget,
    turnstileSiteKey,
  ]);

  const handlePrivacyLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!contactDialog) return;
      event.preventDefault();
      contactDialog.openPrivacy();
    },
    [contactDialog],
  );

  return (
    <FormBlocksProvider>
      <form
        ref={formRef}
        className={s.form}
        action={actionUrl}
        noValidate
      >
        <NameBlock
          copy={copy.blocks.name}
          value={nameValue}
          onChange={handleNameChange}
          onBlur={undefined}
          readOnly={undefined}
          disabled={undefined}
        />
        <EmailBlock
          copy={copy.blocks.email}
          value={emailValue}
          onChange={handleEmailChange}
          onBlur={undefined}
          readOnly={undefined}
          disabled={undefined}
        />
        <MessageBlock
          copy={copy.blocks.message}
          value={messageValue}
          onChange={handleMessageChange}
          onBlur={undefined}
          helperText={null}
          errorText={null}
        />
        <HoneypotBlock
          copy={copy.blocks.honeypot}
          value={honeypotValue}
          onChange={handleHoneypotChange}
        />
        <input type="hidden" name="token" value={turnstileToken} />
        <TurnstileBlock
          copy={copy.blocks.turnstile}
          status={turnstileStatus}
          widgetRef={turnstileContainerRef}
        />
        <p className={s.privacy}>
          {copy.privacy.text}{' '}
          <a
            href={sharedStrings.contactFormPolicyHash}
            className={s.privacyLink}
            onClick={handlePrivacyLinkClick}
            aria-haspopup="dialog"
          >
            {copy.privacy.linkLabel}
          </a>
        </p>
      </form>
    </FormBlocksProvider>
  );
}
