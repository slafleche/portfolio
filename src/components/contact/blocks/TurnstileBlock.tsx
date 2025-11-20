import { useMemo } from 'react';
import type { RefObject } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/forms.css';
import { useFormBlock } from '../formBlocks.context';
import type { TurnstileBlockLocale } from '@/lib/locales/form/form.turnstile';
import type { TurnstileState } from '../contactForm.types';

export type TurnstileBlockProps = {
  copy: TurnstileBlockLocale;
  status: TurnstileState;
  widgetRef?: RefObject<HTMLDivElement | null>;
};

const COMPLETED_STATUSES: TurnstileState[] = ['verified', 'bypassed'];

export function TurnstileBlock({
  copy,
  status,
  widgetRef,
}: TurnstileBlockProps) {
  const statusMessage = useMemo(() => {
    if (status === 'expired') return copy.statuses.expired;
    if (status === 'error') return copy.statuses.error;
    return null;
  }, [copy.statuses, status]);

  const validationSummary = useMemo(() => {
    if (COMPLETED_STATUSES.includes(status)) return null;
    if (status === 'expired') return copy.summary.expired;
    if (status === 'error') return copy.summary.error;
    return copy.summary.missing;
  }, [copy.summary, status]);

  useFormBlock(
    useMemo(
      () => ({
        key: 'turnstile',
        validate: () => COMPLETED_STATUSES.includes(status),
        getValidationSummary: () => validationSummary,
      }),
      [status, validationSummary],
    ),
  );

  return (
    <div className={clsx(s.turnstileSection)} data-state={status}>
      <div
        ref={widgetRef}
        className={s.turnstileWidget}
        data-rendered={status !== 'bypassed'}
      >
        {status === 'bypassed' ? (
          <span className={s.turnstilePlaceholder}>{copy.preview}</span>
        ) : null}
      </div>
      {statusMessage ? (
        <p className={s.turnstileStatus}>{statusMessage}</p>
      ) : null}
    </div>
  );
}
