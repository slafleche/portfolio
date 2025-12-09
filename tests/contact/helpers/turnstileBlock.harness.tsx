import { renderBlockWithFormBlocks } from './formBlocks.harness';
import { TurnstileBlock } from '@/components/contact/blocks/TurnstileBlock';
import type { TurnstileBlockProps } from '@/components/contact/blocks/TurnstileBlock';
import type {
  ContactFormBlockContract,
  ContactFormBlockValidationResult,
} from '@/components/contact/types/form.types';
import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';

type TurnstileBlockHarnessResult = ReturnType<
  typeof renderBlockWithFormBlocks<TurnstileBlockProps>
> & {
  getRegistration: () => FormBlockRegistration | null;
  getTurnstileContract: () => ContactFormBlockContract<string> | null;
  validateTurnstile: () => ContactFormBlockValidationResult;
};

export const renderTurnstileBlockWithFormBlocks = (
  props: TurnstileBlockProps,
  options?: Parameters<typeof renderBlockWithFormBlocks<TurnstileBlockProps>>[2],
): TurnstileBlockHarnessResult => {
  const renderResult = renderBlockWithFormBlocks(
    TurnstileBlock,
    props,
    options,
  );

  const getRegistration = () => renderResult.getLatestRegistration();

  const getTurnstileContract = () => {
    const registration = getRegistration();
    const contract = registration?.getContract?.();
    if (!contract) return null;
    return contract as ContactFormBlockContract<string>;
  };

  const validateTurnstile = () => {
    const contract = getTurnstileContract();
    if (!contract) {
      throw new Error('TurnstileBlock contract is not available');
    }
    return contract.validate();
  };

  return {
    ...renderResult,
    getRegistration,
    getTurnstileContract,
    validateTurnstile,
  };
};

