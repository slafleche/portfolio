import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { Message } from '../messageCentre.types';

type ContactFormBlockId = string;

export type ContactFormBlockValidationResult = {
  id: ContactFormBlockId;
  valid: boolean;
};

export type ContactFormBlockPayload<Value = unknown> = {
  id: ContactFormBlockId;
  value: Value;
};

export type ContactFormBlockContract<Payload = unknown> = {
  order: number;
  isSubmitting: boolean;
  validate: () => ContactFormBlockValidationResult;
  getPayload: () => ContactFormBlockPayload<Payload>;
  getValue: () => string;
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
