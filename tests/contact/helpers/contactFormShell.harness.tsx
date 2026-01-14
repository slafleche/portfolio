import {
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react';
import React, { useMemo } from 'react';

import { MessageCentreBlock } from '@/components/contact/blocks/MessageCentreBlock';
import {
  TestFormBlocksProvider,
  useFormBlock,
} from '@/components/contact/formBlocks.context';
import { SubmitButton } from '@/components/contact/primitives/SubmitButton';
import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import {
  type ContactFormFlowState,
  useContactFormFlow,
} from '@/components/contact/useContactFormFlow';
import {
  type ContactFormOutcomeResult,
  useContactFormOutcome,
} from '@/components/contact/useContactFormOutcome';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';

import { enFormTranslator } from './enFormTranslator';

export type ShellStubBlockConfig = {
  key: string;
  id: string;
  validationResult: ContactFormBlockValidationResult;
  payload: ContactFormBlockPayload<unknown>;
};

type ShellStubBlockProps = {
  config: ShellStubBlockConfig;
};

function ShellStubBlock({ config }: ShellStubBlockProps) {
  const contract = useMemo(
    () => ({
      validate: () => config.validationResult,
      getPayload: () => config.payload,
      focus: () => {},
    }),
    [
      config.payload,
      config.validationResult,
    ],
  );

  useFormBlock(
    useMemo(
      () => ({
        key: config.key,
        focus: contract.focus,
        getValue: () => config.payload.value,
        validate: () => contract.validate().valid,
        getValidationSummary: () => null,
        liveValidation: false,
        getContract: () => contract,
      }),
      [
        config.key,
        config.payload.value,
        contract,
      ],
    ),
  );

  return null;
}

export type ContactFormShellHarnessOptions = {
  blocks: ShellStubBlockConfig[];
  submitHelper: ContactFormFlowSubmitHelper;
  statusMessages: Record<FormStatusKey, string>;
  blockOrder?: string[];
  onSuccessStateChange?: (visible: boolean) => void;
  onFlowChange?: (state: ContactFormFlowState) => void;
  onOutcomeChange?: (outcome: ContactFormOutcomeResult) => void;
  onJumpToFirstIssue?: (scrollTarget: string | undefined) => void;
};

type ContactFormShellHarnessProps = ContactFormShellHarnessOptions;

const formCopy = buildContactFormCopy(enFormTranslator);

function ContactFormShellHarnessInner({
  blocks,
  submitHelper,
  statusMessages,
  blockOrder,
  onSuccessStateChange,
  onFlowChange,
  onOutcomeChange,
  onJumpToFirstIssue,
}: ContactFormShellHarnessProps) {
  const flow = useContactFormFlow({
    submitHelper,
    onSuccessStateChange,
  });

  const outcome = useContactFormOutcome({
    submitStatus: flow.submitStatus,
    latestValidationResults: flow.latestValidationResults,
    config: {
      statusMessages,
      blockOrder,
    },
  });

  if (onFlowChange) {
    onFlowChange(flow);
  }
  if (onOutcomeChange) {
    onOutcomeChange(outcome);
  }

  const priorityScrollTarget = outcome.priority.message?.scrollTarget;

  const isCatastrophic = outcome.isCatastrophic;
  const isInvalid = flow.invalid;
  const isSubmitting = flow.isSubmitting;
  const disableSubmit = isSubmitting || isInvalid || isCatastrophic;

  return (
    <>
      {blocks.map((config) => (
        <ShellStubBlock key={config.key} config={config} />
      ))}
      <form
        aria-label="contact-form-shell"
        onSubmit={flow.handleSubmit}
      >
        <MessageCentreBlock messages={outcome.messagesForUi} />
        {isInvalid && !isCatastrophic ? (
          <button
            type="button"
            data-testid="jump-to-first-issue"
            onClick={() => {
              if (onJumpToFirstIssue) {
                onJumpToFirstIssue(priorityScrollTarget);
              }
            }}
          >
            {formCopy.blocks.messageCentre.statuses.validation_error_jump}
          </button>
        ) : null}
        <SubmitButton disabled={disableSubmit}>
          {formCopy.submitLabel}
        </SubmitButton>
      </form>
    </>
  );
}

export type ContactFormShellHarnessRenderResult = RenderResult & {
  submit: () => void;
};

export function renderContactFormShellHarness(
  options: ContactFormShellHarnessOptions,
): ContactFormShellHarnessRenderResult {
  const renderResult = render(
    <TestFormBlocksProvider>
      <ContactFormShellHarnessInner {...options} />
    </TestFormBlocksProvider>,
  );

  const submit = () => {
    const button = renderResult.getByRole('button', {
      name: formCopy.submitLabel,
    });
    fireEvent.click(button);
  };

  return {
    ...renderResult,
    submit,
  };
}
