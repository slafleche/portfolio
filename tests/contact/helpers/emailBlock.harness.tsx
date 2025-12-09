import { renderBlockWithFormBlocks } from './formBlocks.harness';
import { EmailBlock } from '@/components/contact/blocks/EmailBlock';
import type { EmailBlockProps } from '@/components/contact/blocks/EmailBlock';
import type {
  ContactFormBlockContract,
  ContactFormBlockValidationResult,
} from '@/components/contact/types/form.types';
import type { FormBlockRegistration } from '@/components/contact/formBlocks.context';

type EmailBlockHarnessResult = ReturnType<
  typeof renderBlockWithFormBlocks<EmailBlockProps>
> & {
  getRegistration: () => FormBlockRegistration | null;
  getEmailContract: () => ContactFormBlockContract<string> | null;
  validateEmail: () => ContactFormBlockValidationResult;
};

export const renderEmailBlockWithFormBlocks = (
  props: EmailBlockProps,
  options?: Parameters<typeof renderBlockWithFormBlocks<EmailBlockProps>>[2],
): EmailBlockHarnessResult => {
  const renderResult = renderBlockWithFormBlocks(EmailBlock, props, options);

  const getRegistration = () => renderResult.getLatestRegistration();

  const getEmailContract = () => {
    const registration = getRegistration();
    const contract = registration?.getContract?.();
    if (!contract) return null;
    return contract as ContactFormBlockContract<string>;
  };

  const validateEmail = () => {
    const contract = getEmailContract();
    if (!contract) {
      throw new Error('EmailBlock contract is not available');
    }
    return contract.validate();
  };

  return {
    ...renderResult,
    getRegistration,
    getEmailContract,
    validateEmail,
  };
};

