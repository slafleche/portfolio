import { renderBlockWithFormBlocks } from './formBlocks.harness';
import { MessageBlock } from '@/components/contact/blocks/MessageBlock';
import type { MessageBlockProps } from '@/components/contact/blocks/MessageBlock';
import type {
  ContactFormBlockContract,
  ContactFormBlockValidationResult,
} from '@/components/contact/types/form.types';
import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';

type MessageBlockHarnessResult = ReturnType<
  typeof renderBlockWithFormBlocks<MessageBlockProps>
> & {
  getRegistration: () => FormBlockRegistration | null;
  getMessageContract: () => ContactFormBlockContract<string> | null;
  validateMessage: () => ContactFormBlockValidationResult;
};

export const renderMessageBlockWithFormBlocks = (
  props: MessageBlockProps,
  options?: Parameters<typeof renderBlockWithFormBlocks<MessageBlockProps>>[2],
): MessageBlockHarnessResult => {
  const renderResult = renderBlockWithFormBlocks(
    MessageBlock,
    props,
    options,
  );

  const getRegistration = () => renderResult.getLatestRegistration();

  const getMessageContract = () => {
    const registration = getRegistration();
    const contract = registration?.getContract?.();
    if (!contract) return null;
    return contract as ContactFormBlockContract<string>;
  };

  const validateMessage = () => {
    const contract = getMessageContract();
    if (!contract) {
      throw new Error('MessageBlock contract is not available');
    }
    return contract.validate();
  };

  return {
    ...renderResult,
    getRegistration,
    getMessageContract,
    validateMessage,
  };
};

