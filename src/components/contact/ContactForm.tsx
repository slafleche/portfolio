'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { resolveContactFormScenarioIdFromLocation } from '@/dev/scenarios/contactForm.adapter';
import { contactFormScenarioMap } from '@/dev/scenarios/contactForm.scenarios';
import type {
  ContactFormPayload,
  ContactFormResponse,
} from '@/modules/contactForm/mockSubmit';
import * as s from '@/styles/components/forms.css';

import { useSafeId } from '../../lib/dom';
import { notRelease } from '../../lib/runtimeEnv';
import ToTopArrow from '../icons/ToTopArrow';
import { EmailBlock } from './blocks/EmailBlock';
import { HoneypotBlock } from './blocks/HoneypotBlock';
import { MessageBlock } from './blocks/MessageBlock';
import { MessageCentreBlock } from './blocks/MessageCentreBlock';
import { NameBlock } from './blocks/NameBlock';
import { TurnstileBlock } from './blocks/TurnstileBlock';
import { useContactDialogTitle } from './contactDialogTitle.context';
import { logContactFormDebugEvent } from './contactFormDebugLogger';
import ContactFormError from './ContactFormError';
import ContactFormLoading from './ContactFormLoading';
import ContactFormSuccess from './ContactFormSuccess';
import { ContactPrivacy } from './ContactPrivacy';
import {
  FormBlocksProvider,
  useFormBlocksContext,
} from './formBlocks.context';
import { SubmitButton } from './primitives/SubmitButton';
import type {
  ContactFormBlockBaseProps,
  ContactFormBlockInitialValues,
  ContactFormBlockPayload,
  ContactFormFlowSubmitHelper,
  ContactFormProps,
} from './types/form.types';
import { useContactFormFlow } from './useContactFormFlow';
import { useContactFormOutcome } from './useContactFormOutcome';

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
  initialBlocks?: ContactFormBlockInitialValues | null;
  turnstileSiteKey: string | null;
  onOpenPrivacy?: () => void;
};

function ContactFormInner({
  actionUrl,
  copy,
  formMembers,
  submitHelper,
  onSuccessStateChange,
  onCatastrophic,
  initialBlocks,
  turnstileSiteKey,
  onOpenPrivacy,
}: ContactFormInnerProps) {
  const [
    initialBlocksSnapshot,
  ] = useState<ContactFormBlockInitialValues | null | undefined>(
    () => initialBlocks ?? null,
  );
  const {
    getRegistrationsSnapshot,
    recordValidationResult,
    enableContinuousValidation,
  } = useFormBlocksContext();

  const flow = useContactFormFlow({
    submitHelper,
    onSuccessStateChange,
  });

  const initialServerState = initialBlocksSnapshot?.form?.server;

  const [
    useInitialServerState,
    setUseInitialServerState,
  ] = useState(() => Boolean(initialServerState));

  const submitStatusForUi =
    useInitialServerState && initialServerState?.submitStatus
      ? initialServerState.submitStatus
      : flow.submitStatus;

  const isSubmittingForUi =
    useInitialServerState &&
    typeof initialServerState?.isSubmitting !== 'undefined'
      ? Boolean(initialServerState.isSubmitting)
      : flow.isSubmitting;

  const outcome = useContactFormOutcome({
    submitStatus: submitStatusForUi,
    latestValidationResults: flow.latestValidationResults,
    config: {
      statusMessages: copy.blocks.messageCentre.statuses,
      blockOrder: formMembers.map((member) => member.id),
    },
  });

  const messagesForUi = outcome.messagesForUi;

  const isCatastrophic = outcome.isCatastrophic;
  const isInvalid = flow.invalid;
  const hasInitialMockData =
    Boolean(initialBlocksSnapshot?.name) ||
    Boolean(initialBlocksSnapshot?.email) ||
    Boolean(initialBlocksSnapshot?.message) ||
    Boolean(initialBlocksSnapshot?.turnstile) ||
    Boolean(initialBlocksSnapshot?.honeypot) ||
    Boolean(initialServerState);

  const hasRunInitialMockValidationRef = useRef(false);

  const disableFields = isSubmittingForUi || isCatastrophic;
  const disableSubmit =
    isSubmittingForUi || isInvalid || isCatastrophic;

  const { setTitleKey } = useContactDialogTitle();

  const formRef = useRef<HTMLFormElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const wasSubmittingRef = useRef(isSubmittingForUi);

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

      const header = document.querySelector<HTMLElement>(
        '[data-ui="form-header"]',
      );
      const headerOffset =
        header?.getBoundingClientRect().height ?? 0;
      if (headerOffset > 0) {
        let scrollParent = element.parentElement;
        while (scrollParent) {
          if (scrollParent.scrollHeight > scrollParent.clientHeight) {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }
        if (scrollParent) {
          scrollParent.scrollBy({
            top: -headerOffset,
            behavior: 'smooth',
          });
        } else {
          window.scrollBy({
            top: -headerOffset,
            behavior: 'smooth',
          });
        }
      }
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
  const initialSubmitStatus = initialServerState?.submitStatus;

  useEffect(() => {
    if (
      !hasInitialMockData ||
      hasRunInitialMockValidationRef.current
    ) {
      return;
    }
    const registrations = getRegistrationsSnapshot();
    registrations.forEach((registration) => {
      const contract = registration.getContract?.();
      if (!contract) return;
      try {
        const result = contract.validate();
        recordValidationResult(result);
      } catch {
        // Ignore validation failures in initialisation helper.
      }
    });
    hasRunInitialMockValidationRef.current = true;
    if (initialSubmitStatus === 'validation_error') {
      enableContinuousValidation();
    }
  }, [
    enableContinuousValidation,
    getRegistrationsSnapshot,
    hasInitialMockData,
    initialSubmitStatus,
    recordValidationResult,
  ]);

  useEffect(() => {
    if (isCatastrophic) return;
    if (isSubmittingForUi) {
      setTitleKey('loading');
    } else {
      setTitleKey('form');
    }
  }, [
    isCatastrophic,
    isSubmittingForUi,
    setTitleKey,
  ]);

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

  const handleOpenPrivacy = useCallback(() => {
    if (onOpenPrivacy) {
      onOpenPrivacy();
    }
  }, [
    onOpenPrivacy,
  ]);

  useEffect(() => {
    const wasSubmitting = wasSubmittingRef.current;
    if (
      wasSubmitting &&
      !isSubmittingForUi &&
      !isCatastrophic &&
      flow.submitStatus !== 'success'
    ) {
      const target = lastFocusedElementRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    }
    wasSubmittingRef.current = isSubmittingForUi;
  }, [
    flow.submitStatus,
    isCatastrophic,
    isSubmittingForUi,
  ]);

  return (
    <form
      ref={formRef}
      className={s.form}
      action={actionUrl}
      noValidate
      data-form="form"
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (!formRef.current || !formRef.current.contains(target)) {
          return;
        }
        const tagName = target.tagName.toLowerCase();
        const isFormControl =
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select';
        if (!isFormControl) return;
        lastFocusedElementRef.current = target;
      }}
      onSubmit={(event) => {
        if (useInitialServerState) {
          setUseInitialServerState(false);
        }

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
      {isSubmittingForUi && !isCatastrophic ? (
        <ContactFormLoading
          message={copy.blocks.messageCentre.statuses.sending}
        />
      ) : null}
      <MessageCentreBlock messages={messagesForUi} />
      <NameBlock
        {...formMembers[0]}
        disabled={disableFields}
        copy={copy.blocks.name}
        initialConfig={initialBlocksSnapshot?.name}
      />
      <EmailBlock
        {...formMembers[1]}
        disabled={disableFields}
        copy={copy.blocks.email}
        initialConfig={initialBlocksSnapshot?.email}
      />
      <MessageBlock
        {...formMembers[2]}
        disabled={disableFields}
        copy={copy.blocks.message}
        initialConfig={initialBlocksSnapshot?.message}
      />
      <TurnstileBlock
        {...formMembers[3]}
        disabled={disableFields}
        copy={copy.blocks.turnstile}
        turnstileSiteKey={turnstileSiteKey}
      />

      <HoneypotBlock copy={copy.blocks.honeypot} />
      {isInvalid ? (
        <button
          type="button"
          data-testid="jump-to-first-issue"
          onClick={handleJumpToFirstIssue}
          className={s.jumpToFirstIssue}
        >
          <ToTopArrow className={s.toTopArrow} />
          <span className={s.jumpToFirstIssueText}>
            {copy.blocks.messageCentre.statuses.validation_error_jump}
          </span>
        </button>
      ) : null}
      <SubmitButton disabled={disableSubmit}>
        {copy.submitLabel}
      </SubmitButton>
      <ContactPrivacy
        copy={copy.privacy}
        onOpenPrivacy={handleOpenPrivacy}
      />
    </form>
  );
}

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  copy,
  onSuccessStateChange,
  initialBlocks,
  turnstileSiteKey = null,
  onOpenPrivacy,
}: ContactFormProps) {
  const idPrefix = useSafeId('contact-form-');
  const { setTitleKey } = useContactDialogTitle();

  const [
    devScenarioId,
  ] = useState<string | null>(() =>
    resolveContactFormScenarioIdFromLocation(),
  );

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
      console.error('[contact][catastrophic]', {
        source,
        reason,
      });
      console.error('[contact][catastrophic-view]', {
        reason,
      });
      setCatastrophicReason(reason);
    },
    [],
  );

  const isDevScenarioActive = notRelease() && devScenarioId != null;
  const isDevLoadingScenario =
    isDevScenarioActive && devScenarioId === 'loading';
  const isDevSuccessScenario =
    isDevScenarioActive && devScenarioId === 'success';
  const isDevFailureScenario =
    isDevScenarioActive && devScenarioId.startsWith('failure');

  const scenarioInitialBlocks: ContactFormBlockInitialValues | null =
    isDevScenarioActive && devScenarioId
      ? (() => {
          const config = contactFormScenarioMap[devScenarioId];
          if (!config) return null;
          const { initialValues, devState } = config;
          const blocks: ContactFormBlockInitialValues = {};

          if (initialValues) {
            if (initialValues.name !== undefined) {
              blocks.name = {
                initialData: initialValues.name,
              };
            }

            if (initialValues.email !== undefined) {
              blocks.email = {
                initialData: initialValues.email,
              };
            }

            if (initialValues.message !== undefined) {
              blocks.message = {
                initialData: initialValues.message,
              };
            }
          }

          if (devState) {
            const server: NonNullable<
              NonNullable<
                ContactFormBlockInitialValues['form']
              >['server']
            > = {};

            if (devState.forcedSubmitStatus) {
              server.submitStatus = devState.forcedSubmitStatus;
            }

            if (typeof devState.isSubmitting === 'boolean') {
              server.isSubmitting = devState.isSubmitting;
            }

            if (
              typeof server.submitStatus !== 'undefined' ||
              typeof server.isSubmitting !== 'undefined'
            ) {
              blocks.form = { server };
            }
          }

          // Turnstile and honeypot initial values are currently unused
          // by the form blocks. They are available here for future
          // wiring once the Turnstile and honeypot helpers support
          // dev initialisation.

          return blocks;
        })()
      : null;

  useEffect(() => {
    if (isDevLoadingScenario) {
      setTitleKey('loading');
      return;
    }
    if (isDevSuccessScenario) {
      setTitleKey('success');
      return;
    }
    if (isDevFailureScenario) {
      setTitleKey('failure');
      return;
    }
    if (catastrophicReason) {
      setTitleKey('catastrophic');
      return;
    }
    if (view === 'success') {
      setTitleKey('success');
      return;
    }
    // When none of the specific view states apply, the inner form
    // layer is responsible for keeping the title aligned with the
    // idle vs loading states.
  }, [
    catastrophicReason,
    isDevFailureScenario,
    isDevLoadingScenario,
    isDevSuccessScenario,
    setTitleKey,
    view,
  ]);

  return (
    <FormBlocksProvider onCatastrophic={handleCatastrophic}>
      {isDevLoadingScenario ? (
        <ContactFormLoading
          message={copy.blocks.messageCentre.statuses.sending}
        />
      ) : isDevSuccessScenario ? (
        <ContactFormSuccess
          title={copy.headings.success}
          description={copy.successBody}
        />
      ) : isDevFailureScenario ? (
        <ContactFormError
          title={copy.headings.error}
          description={copy.errorBody}
        />
      ) : catastrophicReason ? (
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
          initialBlocks={initialBlocks ?? scenarioInitialBlocks}
          turnstileSiteKey={turnstileSiteKey}
          onOpenPrivacy={onOpenPrivacy}
        />
      )}
    </FormBlocksProvider>
  );
}
