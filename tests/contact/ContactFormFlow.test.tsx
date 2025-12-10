import React, { useEffect, useMemo } from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import {
  TestFormBlocksProvider,
  useFormBlock,
} from '@/components/contact/formBlocks.context';
import { useContactFormFlow } from '@/components/contact/useContactFormFlow';
import type { ContactFormFlowState } from '@/components/contact/useContactFormFlow';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

type StubBlockConfig = {
  key: string;
  validationResult: ContactFormBlockValidationResult;
  payload: ContactFormBlockPayload<unknown>;
  onContinuousValidationChange?: (value: boolean) => void;
  validateMock?: () => ContactFormBlockValidationResult;
};

type StubBlockProps = {
  config: StubBlockConfig;
};

function StubBlock({ config }: StubBlockProps) {
  const contract = useMemo(() => {
    const validate =
      config.validateMock ?? (() => config.validationResult);
    return {
      validate,
      getPayload: () => config.payload,
      focus: () => {},
    };
  }, [
    config,
  ]);

  const { continuousValidation } = useFormBlock(
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

  useEffect(() => {
    if (config.onContinuousValidationChange) {
      config.onContinuousValidationChange(continuousValidation);
    }
  }, [
    config,
    continuousValidation,
  ]);

  return null;
}

type FlowHarnessProps = {
  blocks: StubBlockConfig[];
  submitHelper: ContactFormFlowSubmitHelper;
  onSuccessStateChange?: (visible: boolean) => void;
  onFlowChange?: (state: ContactFormFlowState) => void;
};

function FlowHarnessInner({
  blocks,
  submitHelper,
  onSuccessStateChange,
  onFlowChange,
}: FlowHarnessProps) {
  const flow = useContactFormFlow({
    submitHelper,
    onSuccessStateChange,
  });

  useEffect(() => {
    if (!onFlowChange) return;
    onFlowChange({
      isSubmitting: flow.isSubmitting,
      invalid: flow.invalid,
      submitStatus: flow.submitStatus,
      latestValidationResults: flow.latestValidationResults,
      latestPayload: flow.latestPayload,
    });
  }, [
    flow.invalid,
    flow.isSubmitting,
    flow.latestPayload,
    flow.latestValidationResults,
    flow.submitStatus,
    onFlowChange,
  ]);

  return (
    <>
      {blocks.map((config) => (
        <StubBlock key={config.key} config={config} />
      ))}
      <form aria-label="flow form" onSubmit={flow.handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

function FlowHarness(props: FlowHarnessProps) {
  return (
    <TestFormBlocksProvider>
      <FlowHarnessInner {...props} />
    </TestFormBlocksProvider>
  );
}

const createValidationResult = (
  id: string,
  valid: boolean,
  messages: ContactFormBlockValidationResult['messages'] = [],
): ContactFormBlockValidationResult => ({
  id,
  valid,
  messages,
});

const createPayload = (
  id: string,
  value: unknown,
): ContactFormBlockPayload<unknown> => ({
  id,
  value,
});

const getLastFlowState = (
  onFlowChange: (state: ContactFormFlowState) => void,
) => {
  const mock = onFlowChange as unknown as {
    mock?: { calls: [ContactFormFlowState][] };
  };
  const calls = mock.mock?.calls ?? [];
  if (!calls.length) {
    throw new Error('No flow state recorded');
  }
  return calls[calls.length - 1][0];
};

describe('ContactFormFlow', () => {
  it('submits payload and reports success when all blocks are valid', async () => {
    const valueBlock: StubBlockConfig = {
      key: 'value-block',
      validationResult: createValidationResult('value', true),
      payload: createPayload('value', 'Alice'),
    };
    const tokenBlock: StubBlockConfig = {
      key: 'token-block',
      validationResult: createValidationResult('token', true),
      payload: createPayload('token', 'token-123'),
    };
    const gateBlock: StubBlockConfig = {
      key: 'gate-block',
      validationResult: createValidationResult('gate', true),
      payload: createPayload('gate', 'hp-value'),
    };

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');
    const onFlowChange = vi.fn();
    const onSuccessStateChange = vi.fn();

    render(
      <FlowHarness
        blocks={[
          valueBlock,
          tokenBlock,
          gateBlock,
        ]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
        onSuccessStateChange={onSuccessStateChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const lastState = getLastFlowState(onFlowChange);

      expect(lastState.isSubmitting).toBe(false);
      expect(lastState.invalid).toBe(false);
      expect(lastState.submitStatus).toBe('success');
      expect(lastState.latestValidationResults).toHaveLength(3);
      expect(
        lastState.latestValidationResults.every(
          (result) => result.valid,
        ),
      ).toBe(true);
      expect(lastState.latestPayload).toEqual([
        valueBlock.payload,
        tokenBlock.payload,
        gateBlock.payload,
      ]);
    });

    const sawSubmittingState = (
      onFlowChange as unknown as {
        mock?: { calls: [ContactFormFlowState][] };
      }
    ).mock?.calls.some(
      ([
        state,
      ]) => state.isSubmitting,
    );
    expect(sawSubmittingState).toBe(true);

    expect(onSuccessStateChange).toHaveBeenCalledWith(true);
    expect(onSuccessStateChange).not.toHaveBeenCalledWith(false);
  });

  it('marks the form invalid and does not submit when any block is invalid', async () => {
    const invalidContinuousSpy = vi.fn();

    const invalidBlock: StubBlockConfig = {
      key: 'invalid-block',
      validationResult: createValidationResult('field', false, [
        {
          type: 'error',
          code: 'field.required',
          text: 'Required field',
        },
      ]),
      payload: createPayload('field', ''),
      onContinuousValidationChange: invalidContinuousSpy,
    };
    const validBlock: StubBlockConfig = {
      key: 'valid-block',
      validationResult: createValidationResult('other', true),
      payload: createPayload('other', 'value'),
    };

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');
    const onFlowChange = vi.fn();
    const onSuccessStateChange = vi.fn();

    render(
      <FlowHarness
        blocks={[
          invalidBlock,
          validBlock,
        ]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
        onSuccessStateChange={onSuccessStateChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onFlowChange).toHaveBeenCalled();
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const lastState = getLastFlowState(onFlowChange);
    expect(lastState.isSubmitting).toBe(false);
    expect(lastState.invalid).toBe(true);
    expect(lastState.submitStatus).toBe('validation_error');
    expect(lastState.latestValidationResults).toHaveLength(2);
    expect(lastState.latestPayload).toBeNull();

    const invalidResult = lastState.latestValidationResults.find(
      (result) => result.id === 'field',
    );
    expect(invalidResult).toBeDefined();
    if (!invalidResult) return;
    expect(invalidResult.messages).toEqual([
      {
        type: 'error',
        code: 'field.required',
        text: 'Required field',
      },
    ]);

    const continuousCalls =
      (
        invalidContinuousSpy as unknown as {
          mock?: { calls: [boolean][] };
        }
      ).mock?.calls ?? [];
    expect(
      continuousCalls.some(
        ([
          value,
        ]) => value === true,
      ),
    ).toBe(true);

    expect(onSuccessStateChange).not.toHaveBeenCalled();
  });

  it('ignores duplicate submits while a submission is in flight', async () => {
    const validationResult = createValidationResult('field', true);
    const validateMock = vi.fn(() => validationResult);

    const block: StubBlockConfig = {
      key: 'valid-block',
      validationResult,
      payload: createPayload('field', 'value'),
      validateMock,
    };

    let resolveSubmit:
      | ((code: FormServerResponseCode) => void)
      | null = null;

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          }),
      );

    const onFlowChange = vi.fn();

    render(
      <FlowHarness
        blocks={[
          block,
        ]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(submitHelper).toHaveBeenCalledTimes(1);
    expect(validateMock).toHaveBeenCalledTimes(1);

    if (!resolveSubmit) {
      throw new Error('Expected submit promise resolver');
    }
    resolveSubmit('success');

    await waitFor(() => {
      const lastState = getLastFlowState(onFlowChange);
      expect(lastState.isSubmitting).toBe(false);
      expect(lastState.submitStatus).toBe('success');
    });
  });

  it('maps submit helper failures to a generic error and leaves invalid false', async () => {
    const block: StubBlockConfig = {
      key: 'valid-block',
      validationResult: createValidationResult('field', true),
      payload: createPayload('field', 'value'),
    };

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockRejectedValue(new Error('network error'));
    const onFlowChange = vi.fn();
    const onSuccessStateChange = vi.fn();

    render(
      <FlowHarness
        blocks={[
          block,
        ]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
        onSuccessStateChange={onSuccessStateChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const lastState = getLastFlowState(onFlowChange);
      expect(lastState.isSubmitting).toBe(false);
      expect(lastState.invalid).toBe(false);
      expect(lastState.submitStatus).toBe('generic_error');
      expect(lastState.latestPayload).toEqual([
        block.payload,
      ]);
    });

    expect(onSuccessStateChange).toHaveBeenCalledWith(false);
    expect(onSuccessStateChange).not.toHaveBeenCalledWith(true);
  });

  it('surfaces a not_configured status and does not submit when there are no blocks', async () => {
    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');
    const onFlowChange = vi.fn();
    const onSuccessStateChange = vi.fn();

    render(
      <FlowHarness
        blocks={[]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
        onSuccessStateChange={onSuccessStateChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onFlowChange).toHaveBeenCalled();
    });

    expect(submitHelper).not.toHaveBeenCalled();

    const lastState = getLastFlowState(onFlowChange);
    expect(lastState.isSubmitting).toBe(false);
    expect(lastState.invalid).toBe(false);
    expect(lastState.submitStatus).toBe('not_configured');
    expect(lastState.latestValidationResults).toHaveLength(0);
    expect(lastState.latestPayload).toBeNull();

    expect(onSuccessStateChange).toHaveBeenCalledWith(false);
  });

  it('treats a server-side validation_error as invalid and enables continuous validation', async () => {
    const continuousSpy = vi.fn();

    const block: StubBlockConfig = {
      key: 'field-block',
      validationResult: createValidationResult('field', true),
      payload: createPayload('field', 'value'),
      onContinuousValidationChange: continuousSpy,
    };

    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('validation_error');
    const onFlowChange = vi.fn();
    const onSuccessStateChange = vi.fn();

    render(
      <FlowHarness
        blocks={[
          block,
        ]}
        submitHelper={submitHelper}
        onFlowChange={onFlowChange}
        onSuccessStateChange={onSuccessStateChange}
      />,
    );

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitHelper).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const lastState = getLastFlowState(onFlowChange);
      expect(lastState.isSubmitting).toBe(false);
      expect(lastState.invalid).toBe(true);
      expect(lastState.submitStatus).toBe('validation_error');
      expect(lastState.latestPayload).toEqual([
        block.payload,
      ]);
    });

    const continuousCalls =
      (
        continuousSpy as unknown as {
          mock?: { calls: [boolean][] };
        }
      ).mock?.calls ?? [];
    expect(
      continuousCalls.some(
        ([
          value,
        ]) => value === true,
      ),
    ).toBe(true);

    expect(onSuccessStateChange).toHaveBeenCalledWith(false);
  });

  it('maps non-success server statuses to submitStatus and keeps invalid false', async () => {
    const block: StubBlockConfig = {
      key: 'field-block',
      validationResult: createValidationResult('field', true),
      payload: createPayload('field', 'value'),
    };

    const statusCodes: FormServerResponseCode[] = [
      'rate_limited',
      'service_unavailable',
      'blocked',
      'generic_error',
    ];

    for (const code of statusCodes) {
      const submitHelper: ContactFormFlowSubmitHelper = vi
        .fn()
        .mockResolvedValue(code);
      const onFlowChange = vi.fn();
      const onSuccessStateChange = vi.fn();

      const { getByRole, unmount } = render(
        <FlowHarness
          blocks={[
            block,
          ]}
          submitHelper={submitHelper}
          onFlowChange={onFlowChange}
          onSuccessStateChange={onSuccessStateChange}
        />,
      );

      const submitButton = getByRole('button', {
        name: 'Submit',
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitHelper).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const lastState = getLastFlowState(onFlowChange);
        expect(lastState.isSubmitting).toBe(false);
        expect(lastState.invalid).toBe(false);
        expect(lastState.submitStatus).toBe(code);

        expect(onSuccessStateChange).toHaveBeenCalledWith(false);
      });

      unmount();
    }
  });
});
