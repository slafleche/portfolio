import {
  act,
  render,
  type RenderResult,
} from '@testing-library/react';
import React, {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useEffect,
} from 'react';

import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';
import * as formBlocksModule from '@/components/contact/formBlocks.context';

import { FocusSentinelWrapper } from '../components/FocusSentinelWrapper';

type RenderBlockOptions = {
  wrapWithFocusSentinels?: boolean;
  beforeChildren?: ReactNode;
};

type RenderBlockResult = RenderResult & {
  getLatestRegistration: () => FormBlockRegistration | null;
  enableContinuousValidation: () => void;
  markSubmitAttempted: () => void;
  rerenderBlock: (nextProps: Props) => void;
};

let lastEnableContinuousValidation: (() => void) | null = null;
let lastMarkSubmitAttempted: (() => void) | null = null;

const HarnessControl = () => {
  const { enableContinuousValidation, markSubmitAttempted } =
    formBlocksModule.useFormBlocksContext();

  useEffect(() => {
    lastEnableContinuousValidation = enableContinuousValidation;
    lastMarkSubmitAttempted = markSubmitAttempted;
  }, [
    enableContinuousValidation,
    markSubmitAttempted,
  ]);

  return null;
};

const HarnessShell = ({
  children,
  onRegisterBlock,
}: {
  children: ReactNode;
  onRegisterBlock?: (registration: FormBlockRegistration) => void;
}) => (
  <formBlocksModule.TestFormBlocksProvider
    onRegisterBlock={onRegisterBlock}
  >
    <HarnessControl />
    {children}
  </formBlocksModule.TestFormBlocksProvider>
);

export function renderBlockWithFormBlocks<Props extends object>(
  BlockComponent: ComponentType<Props>,
  props: Props,
  options?: RenderBlockOptions,
): RenderBlockResult {
  let latestRegistration: FormBlockRegistration | null = null;

  const handleRegisterBlock = (
    registration: FormBlockRegistration,
  ) => {
    latestRegistration = registration;
  };

  const buildWrappedBlock = (blockProps: Props): ReactElement =>
    options?.wrapWithFocusSentinels ? (
      <FocusSentinelWrapper>
        <BlockComponent {...blockProps} />
      </FocusSentinelWrapper>
    ) : (
      <BlockComponent {...blockProps} />
    );

  const wrappedBlock = buildWrappedBlock(props);

  const renderResult = render(
    <HarnessShell onRegisterBlock={handleRegisterBlock}>
      {options?.beforeChildren ?? null}
      {wrappedBlock}
    </HarnessShell>,
  );

  const enableContinuousValidation = () => {
    if (lastEnableContinuousValidation) {
      act(() => {
        lastEnableContinuousValidation?.();
      });
    }
  };

  const markSubmitAttempted = () => {
    if (lastMarkSubmitAttempted) {
      act(() => {
        lastMarkSubmitAttempted?.();
      });
    }
  };

  const rerenderBlock = (nextProps: Props) => {
    const nextWrappedBlock = buildWrappedBlock(nextProps);
    renderResult.rerender(
      <HarnessShell onRegisterBlock={handleRegisterBlock}>
        {options?.beforeChildren ?? null}
        {nextWrappedBlock}
      </HarnessShell>,
    );
  };

  const getLatestRegistration = () => latestRegistration;

  return {
    ...renderResult,
    getLatestRegistration,
    enableContinuousValidation,
    markSubmitAttempted,
    rerenderBlock,
  };
}
