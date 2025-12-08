import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { MessageBase, TranslatedErrorMessage } from '../messageCentre.types';

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
}

export type ContactFormBlockPayload<Value> = {
  id: ContactFormBlockId;
  value: Value;
};

export type ContactFormBlockContract<Value> = {
  validate: () => ContactFormBlockValidationResult;
  focus: () => void;
  requestFocusBefore: () => void;
  requestFocusAfter: () => void;
  getPayload: () => ContactFormBlockPayload<Value>;
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
