import React, {
  type ReactElement,
  type ReactNode,
  type ComponentType,
  useEffect,
} from 'react';
import {
  render,
  type RenderResult,
  act,
} from '@testing-library/react';
import { FocusSentinelWrapper } from '../components/FocusSentinelWrapper';
import * as formBlocksModule from '@/components/contact/formBlocks.context';
import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';

type RenderBlockOptions = {
  wrapWithFocusSentinels?: boolean;
};

type RenderBlockResult = RenderResult & {
  getLatestRegistration: () => FormBlockRegistration | null;
  enableContinuousValidation: () => void;
};

let lastEnableContinuousValidation: (() => void) | null = null;

const HarnessControl = () => {
  const { enableContinuousValidation } =
    formBlocksModule.useFormBlocksContext();

  useEffect(() => {
    lastEnableContinuousValidation = enableContinuousValidation;
  }, [
    enableContinuousValidation,
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

  const wrappedBlock: ReactElement =
    options?.wrapWithFocusSentinels ? (
      <FocusSentinelWrapper>
        <BlockComponent {...props} />
      </FocusSentinelWrapper>
    ) : (
      <BlockComponent {...props} />
    );

  const renderResult = render(
    <HarnessShell onRegisterBlock={handleRegisterBlock}>
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

  const getLatestRegistration = () => latestRegistration;

  return {
    ...renderResult,
    getLatestRegistration,
    enableContinuousValidation,
  };
}
