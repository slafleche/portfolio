import type { NameBlockProps } from '@/components/contact/blocks/NameBlock';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';
import type {
  ContactFormBlockContract,
  ContactFormBlockValidationResult,
} from '@/components/contact/types/form.types';

import { renderBlockWithFormBlocks } from './formBlocks.harness';

type NameBlockHarnessResult = ReturnType<
  typeof renderBlockWithFormBlocks<NameBlockProps>
> & {
  getRegistration: () => FormBlockRegistration | null;
  getNameContract: () => ContactFormBlockContract<string> | null;
  validateName: () => ContactFormBlockValidationResult;
};

export const renderNameBlockWithFormBlocks = (
  props: NameBlockProps,
  options?: Parameters<
    typeof renderBlockWithFormBlocks<NameBlockProps>
  >[2],
): NameBlockHarnessResult => {
  const renderResult = renderBlockWithFormBlocks(
    NameBlock,
    props,
    options,
  );

  const getRegistration = () => renderResult.getLatestRegistration();

  const getNameContract = () => {
    const registration = getRegistration();
    const contract = registration?.getContract?.();
    if (!contract) return null;
    return contract as ContactFormBlockContract<string>;
  };

  const validateName = () => {
    const contract = getNameContract();
    if (!contract) {
      throw new Error('NameBlock contract is not available');
    }
    return contract.validate();
  };

  return {
    ...renderResult,
    getRegistration,
    getNameContract,
    validateName,
  };
};
