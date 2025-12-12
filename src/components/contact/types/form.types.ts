import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';
import type {
  MessageBase,
  TranslatedErrorMessage,
} from '../messageCentre.types';

type ContactFormBlockId = string;

export type ContactFormBlockValidationResult = {
  id: ContactFormBlockId;
  valid: boolean;
  messages: MessageBase[];
};

export type ContactFormBlockBaseProps = {
  id: ContactFormBlockId;
  order: number;
  disabled: boolean;
  required?: boolean;
};

export type ContactFormBlockPayload<Value> = {
  id: ContactFormBlockId;
  value: Value;
};

export type ContactFormBlockContract<Value> = {
  validate: () => ContactFormBlockValidationResult;
  focus: () => void;
  getPayload: () => ContactFormBlockPayload<Value>;
};

export type ContactFormBlockInitialConfig<Value> = {
  /**
   * Initial data for a block, mirroring the value stored in its payload.
   * For simple fields this is typically a string; for richer blocks it can
   * be an object containing multiple related values.
   */
  initialData?: Value;
  /**
   * When true, the block should run its validation logic on mount using
   * the initial data, so any relevant errors are visible without user
   * interaction.
   */
  validateOnMount?: boolean;
};

export type ContactFormDebugFieldState = {
  disabled: boolean;
};

export type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  onSuccessStateChange?: (visible: boolean) => void;
};

export type BlockMessage = Omit<MessageBase, 'code'> & {
  source: ContactFormBlockId;
  higherOrderErrorMessage: TranslatedErrorMessage;
};

export type ContactFormSubmitCode = FormServerResponseCode;

export type ContactFormSubmitStatus = ContactFormSubmitCode | 'idle';

export type ContactFormFlowSubmitHelper = (
  payload: ContactFormBlockPayload<unknown>[],
) => Promise<ContactFormSubmitCode>;
