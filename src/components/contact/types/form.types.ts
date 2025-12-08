import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { Message } from '../messageCentre.types';

type ContactFormBlockId = string;

export type ContactFormBlockValidationResult = {
  id: ContactFormBlockId;
  valid: boolean;
  messages: Message[];
};

export type ContactFormBlockBaseProps = {
  id: ContactFormBlockId; 
  order: number;
  disabled: boolean;
  required?: boolean;
}

export type ContactFormBlockContract<Value> = {
  validate: () => ContactFormBlockValidationResult;
  getValue: () => Value;
  focus: () => void;
  requestFocusBefore: () => void;
  requestFocusAfter: () => void;
};

export type ContactFormDebugFieldState = {
  disabled: boolean;
};

export type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  onSuccessStateChange?: (visible: boolean) => void;
};


export type MessageBundle = {
  globals: string[]; // from here
  blocks: string[];
  priority?: Message; // set here
};
