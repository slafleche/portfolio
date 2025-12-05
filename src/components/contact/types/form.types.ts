import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';

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
};

export type ContactFormDebugFieldState = {
  disabled: boolean;
};

export type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  onSuccessStateChange?: (visible: boolean) => void;
};
