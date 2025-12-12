'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FormBlocksProvider,
  useFormBlocksContext,
} from './formBlocks.context';
import { NameBlock } from './blocks/NameBlock';
import { EmailBlock } from './blocks/EmailBlock';
import { MessageBlock } from './blocks/MessageBlock';
import { TurnstileBlock } from './blocks/TurnstileBlock';
import { HoneypotBlock } from './blocks/HoneypotBlock';
import { MessageCentreBlock } from './blocks/MessageCentreBlock';
import { SubmitButton } from './primitives/SubmitButton';
import { ContactPrivacy } from './ContactPrivacy';
import { useContactFormFlow } from './useContactFormFlow';
import { useContactFormOutcome } from './useContactFormOutcome';
import * as s from '@/styles/components/forms.css';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockPayload,
  ContactFormFlowSubmitHelper,
  ContactFormProps,
} from './types/form.types';
import type {
  ContactFormPayload,
  ContactFormResponse,
} from '@/modules/contactForm/mockSubmit';
import { useSafeId } from '../../lib/dom';
import { logContactFormDebugEvent } from './contactFormDebugLogger';
import ContactFormSuccess from './ContactFormSuccess';
import ContactFormError from './ContactFormError';

const DEFAULT_ACTION_URL = '/api/contact';

const buildContactFormPayload = (
  payloads: ContactFormBlockPayload<unknown>[],
  formMembers: ContactFormBlockBaseProps[],
): ContactFormPayload => {
  const findValueForMemberId = (memberId: string): string => {
    const match = payloads.find((entry) => entry.id === memberId);
    const value = match?.value;
    return typeof value === 'string' ? value : '';
  };

  const nameMember = formMembers[0];
  const emailMember = formMembers[1];
  const messageMember = formMembers[2];
  const turnstileMember = formMembers[3];

  const hpValue =
    typeof document === 'undefined'
      ? ''
      : (document.querySelector<HTMLInputElement>('input[name="hp"]')
          ?.value ?? '');

  return {
    name: nameMember ? findValueForMemberId(nameMember.id) : '',
    email: emailMember ? findValueForMemberId(emailMember.id) : '',
    message: messageMember
      ? findValueForMemberId(messageMember.id)
      : '',
    token: turnstileMember
      ? findValueForMemberId(turnstileMember.id)
      : '',
    hp: hpValue,
  };
};

type ContactFormInnerProps = {
  actionUrl: string;
  copy: ContactFormProps['copy'];
  formMembers: ContactFormBlockBaseProps[];
  submitHelper: ContactFormFlowSubmitHelper;
  onSuccessStateChange?: (visible: boolean) => void;
  onCatastrophic?: (source: string, reason: string) => void;
};

function ContactFormInner({
  actionUrl,
  copy,
  formMembers,
  submitHelper,
  onSuccessStateChange,
  onCatastrophic,
}: ContactFormInnerProps) {
  const { getRegistrationsSnapshot } = useFormBlocksContext();

  const flow = useContactFormFlow({
    submitHelper,
    onSuccessStateChange,
  });

  const outcome = useContactFormOutcome({
    submitStatus: flow.submitStatus,
    latestValidationResults: flow.latestValidationResults,
    config: {
      statusMessages: copy.blocks.messageCentre.statuses,
      blockOrder: formMembers.map((member) => member.id),
    },
  });

  const isCatastrophic = outcome.isCatastrophic;
  const isInvalid = flow.invalid;
  const isSubmitting = flow.isSubmitting;
  const disableFields = isSubmitting || isCatastrophic;
  const disableSubmit = isSubmitting || isInvalid || isCatastrophic;

  const scrollToPriorityTarget = useCallback(() => {
    if (typeof document === 'undefined') return;
    const priorityMessage = outcome.priority.message;

    const scrollTarget = priorityMessage?.scrollTarget;
    if (!scrollTarget) return;

    const element = document.getElementById(scrollTarget);
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }

    const registrations = getRegistrationsSnapshot();
    registrations.forEach((registration) => {
      if (!registration.getContract || !registration.focus) {
        return;
      }
      try {
        const contract = registration.getContract();
        if (!contract) return;
        const result = contract.validate();
        if (result.id === scrollTarget) {
          registration.focus();
        }
      } catch {
        // Ignore focus failures in recovery helper.
      }
    });
  }, [
    getRegistrationsSnapshot,
    outcome.priority.message,
  ]);

  const wasCatastrophicRef = useRef(isCatastrophic);

  useEffect(() => {
    if (isCatastrophic && !wasCatastrophicRef.current) {
      if (onCatastrophic) {
        const reason =
          flow.submitStatus === 'not_configured'
            ? 'form.not_configured'
            : `form.${flow.submitStatus}`;
        onCatastrophic('form', reason);
      }
    }
    wasCatastrophicRef.current = isCatastrophic;
  }, [
    flow.submitStatus,
    isCatastrophic,
    onCatastrophic,
  ]);

  const handleJumpToFirstIssue = useCallback(() => {
    if (!isInvalid || isCatastrophic) return;
    scrollToPriorityTarget();
  }, [
    isInvalid,
    isCatastrophic,
    scrollToPriorityTarget,
  ]);

  return (
    <form
      className={s.form}
      action={actionUrl}
      noValidate
      data-form="form"
      onSubmit={(event) => {
        const registrations = getRegistrationsSnapshot();
        const payloads: ContactFormBlockPayload<unknown>[] = [];
        registrations.forEach((registration) => {
          const contract = registration.getContract?.();
          if (!contract) return;
          try {
            const payload = contract.getPayload();
            payloads.push(payload);
          } catch {
            // Ignore payload failures in debug helper.
          }
        });

        const normalizedPayload = buildContactFormPayload(
          payloads,
          formMembers,
        );

        logContactFormDebugEvent('submit_attempt', {
          name: normalizedPayload.name,
          email: normalizedPayload.email,
          messageLength: normalizedPayload.message.length,
          tokenPresent:
            typeof normalizedPayload.token === 'string' &&
            normalizedPayload.token.trim().length > 0,
          hpValue: normalizedPayload.hp,
        });

        void flow.handleSubmit(event);
      }}
    >
      <MessageCentreBlock messages={outcome.messagesForUi} />
      <NameBlock
        {...formMembers[0]}
        disabled={disableFields}
        copy={copy.blocks.name}
      />
      <EmailBlock
        {...formMembers[1]}
        disabled={disableFields}
        copy={copy.blocks.email}
      />
      <MessageBlock
        {...formMembers[2]}
        disabled={disableFields}
        copy={copy.blocks.message}
      />
      <TurnstileBlock
        {...formMembers[3]}
        disabled={disableFields}
        copy={copy.blocks.turnstile}
      />
      <ContactPrivacy copy={copy.privacy} />
      <HoneypotBlock copy={copy.blocks.honeypot} />
      {isInvalid ? (
        <button
          type="button"
          data-testid="jump-to-first-issue"
          onClick={handleJumpToFirstIssue}
        >
          {copy.blocks.messageCentre.statuses.validation_error}
        </button>
      ) : null}
      <SubmitButton disabled={disableSubmit}>
        {copy.submitLabel}
      </SubmitButton>
    </form>
  );
}

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  copy,
  onSuccessStateChange,
  ...rest
}: ContactFormProps) {
  void rest;
  const idPrefix = useSafeId('contact-form-');

  type ContactFormView = 'form' | 'success';

  const [
    formMembers,
  ] = useState<ContactFormBlockBaseProps[]>(() => [
    {
      id: `${idPrefix}name`,
      order: 1,
      disabled: false,
      required: true,
    },
    {
      id: `${idPrefix}email`,
      order: 2,
      disabled: false,
      required: true,
    },
    {
      id: `${idPrefix}message`,
      order: 3,
      disabled: false,
      required: true,
    },
    {
      id: `${idPrefix}turnstile`,
      order: 4,
      disabled: false,
      required: true,
    },
  ]);

  const [
    view,
    setView,
  ] = useState<ContactFormView>('form');

  const [
    catastrophicReason,
    setCatastrophicReason,
  ] = useState<string | null>(null);

  const handleSuccessStateChange = useCallback(
    (visible: boolean) => {
      setView(visible ? 'success' : 'form');
      if (onSuccessStateChange) {
        onSuccessStateChange(visible);
      }
    },
    [
      onSuccessStateChange,
    ],
  );

  const submitHelper = useCallback<ContactFormFlowSubmitHelper>(
    async (blockPayloads) => {
      const payload = buildContactFormPayload(
        blockPayloads,
        formMembers,
      );

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as ContactFormResponse;
        return data.code;
      } catch {
        throw new Error('contact_form_submit_failed');
      }
    },
    [
      actionUrl,
      formMembers,
    ],
  );

  const handleCatastrophic = useCallback(
    (source: string, reason: string) => {
      // Log catastrophic transitions with an explicit reason and
      // mark the catastrophic view as active. This is the only way
      // the error view should be activated.
      // eslint-disable-next-line no-console
      console.error('[contact][catastrophic]', {
        source,
        reason,
      });
      // eslint-disable-next-line no-console
      console.error('[contact][catastrophic-view]', {
        reason,
      });
      setCatastrophicReason(reason);
    },
    [],
  );

  return (
    <FormBlocksProvider onCatastrophic={handleCatastrophic}>
      {catastrophicReason ? (
        <ContactFormError
          title={copy.headings.error}
          description={copy.errorBody}
        />
      ) : view === 'success' ? (
        <ContactFormSuccess
          title={copy.headings.success}
          description={copy.successBody}
        />
      ) : (
        <ContactFormInner
          actionUrl={actionUrl}
          copy={copy}
          formMembers={formMembers}
          submitHelper={submitHelper}
          onSuccessStateChange={handleSuccessStateChange}
          onCatastrophic={handleCatastrophic}
        />
      )}
    </FormBlocksProvider>
  );
}
