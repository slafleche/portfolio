import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { FormHint } from '@/components/contact/primitives/FormHint';
import type { TurnstileBlockLocale } from '@/lib/locales/form/form.turnstile';
import * as s from '@/styles/components/forms.css';
import { useMedia } from '@/styles/responsive';

import { useFormBlock } from '../formBlocks.context';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockContract,
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
} from '../types/form.types';
import {
  TurnstileWidgetHost,
  type TurnstileWidgetSize,
} from './TurnstileWidgetHost';

export type TurnstileBlockProps = Omit<
  ContactFormBlockBaseProps,
  'required'
> & {
  copy: TurnstileBlockLocale;
  logInputs?: boolean;
  logValidation?: boolean;
  logMessages?: boolean;
  disabled?: boolean;
  turnstileSiteKey: string | null;
};

export type TurnstileState =
  | 'loading'
  | 'ready'
  | 'verified'
  | 'expired'
  | 'error';

const COMPLETED_STATUSES: TurnstileState[] = [
  'verified',
];

type ExtendedWindow = Window & { turnstile?: Window['turnstile'] };

const buildTurnstileValidationResult = (
  id: string,
  status: TurnstileState,
  copy: TurnstileBlockLocale,
  token: string,
): ContactFormBlockValidationResult => {
  const hasToken = token.trim().length > 0;
  const valid =
    COMPLETED_STATUSES.includes(status) ||
    (hasToken && status !== 'expired' && status !== 'error');
  if (valid) {
    return {
      id,
      valid: true,
      messages: [],
    };
  }

  const code =
    status === 'expired'
      ? 'turnstile.expired'
      : status === 'error'
        ? 'turnstile.error'
        : 'turnstile.missing';

  const text =
    status === 'expired'
      ? copy.summary.expired
      : status === 'error'
        ? copy.summary.error
        : copy.summary.missing;

  return {
    id,
    valid: false,
    messages: [
      {
        type: 'error',
        code,
        text,
        scrollTarget: id,
      },
    ],
  };
};

const buildTurnstileContract = (
  id: string,
  status: TurnstileState,
  copy: TurnstileBlockLocale,
  token: string,
): ContactFormBlockContract<string> => ({
  validate: () =>
    buildTurnstileValidationResult(id, status, copy, token),
  getPayload: (): ContactFormBlockPayload<string> => ({
    id,
    value: token,
  }),
  focus: () => {
    // Placeholder: focus behaviour can be refined once the form orchestrator uses it.
  },
});

export function TurnstileBlock({
  id,
  order,
  disabled = false,
  copy,
  logInputs = false,
  logValidation = false,
  logMessages = false,
  turnstileSiteKey,
}: TurnstileBlockProps) {
  const hasTurnstileConfig = Boolean(turnstileSiteKey);

  const hasInlineTurnstile =
    typeof window !== 'undefined' &&
    Boolean((window as ExtendedWindow).turnstile);

  const { compact } = useMedia();
  const turnstileSize: TurnstileWidgetSize =
    compact === true ? 'compact' : 'normal';

  const [
    status,
    setStatus,
  ] = useState<TurnstileState>('loading');
  const [
    token,
    setToken,
  ] = useState<string>('');

  const lastValidationStateRef = useRef<{
    valid: boolean;
    code: string | null;
  } | null>(null);
  const hasLoggedInitRef = useRef(false);

  const shouldRenderTurnstileWidget =
    hasTurnstileConfig || hasInlineTurnstile;

  const registration = useMemo(() => {
    const contract = buildTurnstileContract(id, status, copy, token);
    return {
      key: 'turnstile',
      getValue: () => token,
      validate: () => contract.validate().valid,
      getValidationSummary: () => {
        if (COMPLETED_STATUSES.includes(status)) return null;
        if (status === 'expired') return copy.summary.expired;
        if (status === 'error') return copy.summary.error;
        return copy.summary.missing;
      },
      focus: contract.focus,
      // Turnstile participates in validation only via the
      // continuous-validation flow after the first failed submit.
      liveValidation: false,
      getContract: () => contract,
    };
  }, [
    copy,
    id,
    status,
    token,
  ]);

  const {
    continuousValidation,
    recordValidationResult,
    reportCatastrophic,
  } = useFormBlock(registration);
  const reportCatastrophicRef = useRef(reportCatastrophic);

  useEffect(() => {
    reportCatastrophicRef.current = reportCatastrophic;
  }, [
    reportCatastrophic,
  ]);

  useEffect(() => {
    if (!logInputs || hasLoggedInitRef.current) return;
    const result = buildTurnstileValidationResult(
      id,
      status,
      copy,
      token,
    );
    const payload: {
      status?: TurnstileState;
      hasToken?: boolean;
      valid?: boolean;
      messages?: ContactFormBlockValidationResult['messages'];
    } = {
      status,
      hasToken: token.trim().length > 0,
    };
    if (logValidation) {
      payload.valid = result.valid;
    }
    if (logMessages) {
      payload.messages = result.messages;
    }
    console.info('[contact][debug][turnstile][init]', payload);
    hasLoggedInitRef.current = true;
  }, [
    copy,
    id,
    logInputs,
    logMessages,
    logValidation,
    status,
    token,
  ]);

  useEffect(() => {
    if (!logInputs) return;
    console.info('[contact][debug][turnstile][change]', {
      status,
      hasToken: token.trim().length > 0,
    });
  }, [
    logInputs,
    status,
    token,
  ]);

  useEffect(() => {
    if (!continuousValidation) {
      lastValidationStateRef.current = null;
      return;
    }

    const result = buildTurnstileValidationResult(
      id,
      status,
      copy,
      token,
    );

    const nextState = {
      valid: result.valid,
      code: result.messages[0]?.code ?? null,
    };

    const previousState = lastValidationStateRef.current;
    if (
      previousState &&
      previousState.valid === nextState.valid &&
      previousState.code === nextState.code
    ) {
      return;
    }

    lastValidationStateRef.current = nextState;
    if (logValidation || logMessages) {
      const payload: {
        status?: TurnstileState;
        hasToken?: boolean;
        valid?: boolean;
        messages?: ContactFormBlockValidationResult['messages'];
      } = {
        status,
        hasToken: token.trim().length > 0,
      };
      if (logValidation) {
        payload.valid = result.valid;
      }
      if (logMessages) {
        payload.messages = result.messages;
      }
      console.info(
        '[contact][debug][turnstile][validation]',
        payload,
      );
    }
    recordValidationResult(result);
  }, [
    continuousValidation,
    copy,
    id,
    logMessages,
    logValidation,
    recordValidationResult,
    status,
    token,
  ]);

  const handleLoading = useCallback(() => {
    setStatus('loading');
  }, []);

  const handleReady = useCallback(() => {
    setStatus((previous) => {
      if (
        previous === 'verified' ||
        previous === 'expired' ||
        previous === 'error'
      ) {
        return previous;
      }
      return 'ready';
    });
  }, []);

  const handleToken = useCallback((nextToken: string) => {
    setToken(nextToken);
    setStatus('verified');
  }, []);

  const handleExpired = useCallback(() => {
    setToken('');
    setStatus('expired');
  }, []);

  const handleError = useCallback((errorCode?: string | number) => {
    setStatus('error');
    const reason =
      errorCode === 'load_failed'
        ? 'Turnstile script failed to load or initialise.'
        : errorCode === 'unavailable'
          ? 'Turnstile unavailable: missing API or container.'
          : typeof errorCode === 'undefined' || errorCode === null
            ? 'Turnstile reported an error via error-callback.'
            : `Turnstile reported an error via error-callback (${String(
                errorCode,
              )}).`;
    reportCatastrophicRef.current(reason);
  }, []);

  const isComplete = COMPLETED_STATUSES.includes(status);
  const summaryText = !isComplete
    ? status === 'expired'
      ? copy.summary.expired
      : status === 'error'
        ? copy.summary.error
        : copy.summary.missing
    : null;
  const disabledText = disabled ? copy.statuses.disabled : null;
  const showError = Boolean(
    summaryText && continuousValidation && !disabled,
  );
  const hintText = disabledText ?? (showError ? summaryText : null);
  const hintId = `${id}-turnstile-hint`;

  return (
    <div
      id={id}
      data-order={order}
      className={clsx(s.turnstileSection)}
      data-state={status}
      data-disabled={disabled ? 'true' : 'false'}
      aria-disabled={disabled ? 'true' : undefined}
      onClickCapture={
        ((event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
          }
        })
      }
    >
      <div
        className={s.turnstileWidget}
        aria-describedby={hintText ? hintId : undefined}
        data-rendered="true"
      >
        {shouldRenderTurnstileWidget && turnstileSiteKey ? (
          <TurnstileWidgetHost
            siteKey={turnstileSiteKey}
            size={turnstileSize}
            onLoading={handleLoading}
            onReady={handleReady}
            onToken={handleToken}
            onExpired={handleExpired}
            onError={handleError}
          />
        ) : null}
      </div>
      <input type="hidden" name="token" value={token} />
      {hintText ? (
        <div
          data-form-turnstile="status"
          className={s.turnstileStatus}
        >
          <FormHint id={hintId} tone={showError ? 'error' : 'helper'}>
            {hintText}
          </FormHint>
        </div>
      ) : null}
    </div>
  );
}
