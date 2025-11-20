import type { RefObject } from 'react';
import type { ContactFormCopy, FormStatusKey } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import type { ContactFormResponse } from '@/modules/contactForm/mockSubmit';
import type { ContactFormDraft, FieldName, FieldErrorMap } from '@/modules/contactForm/validation';
import type { ContactFormToastDebugScenario } from '@/components/contact/contact.types';

export type DebugFieldKey = Exclude<FieldName, 'token'>;

export type ContactFormDebugFieldState = {
  readOnly?: boolean;
  disabled?: boolean;
  dataDebug?: string;
};

export type ContactFormDebugState = {
  values?: Partial<ContactFormDraft>;
  fieldErrors?: FieldErrorMap;
  inlineErrors?: Partial<Record<DebugFieldKey, string>>;
  inlineHelpers?: Partial<Record<DebugFieldKey, string>>;
  statusState?: {
    status: FormStatusKey;
    message?: string;
  };
  responseSimulation?: ContactFormResponse;
  isSubmitting?: boolean;
  hasAttemptedSubmit?: boolean;
  fieldStates?: Partial<Record<DebugFieldKey, ContactFormDebugFieldState>>;
  logFocusEvents?: boolean;
  showSubmitOverlay?: boolean;
  scrollStatusIntoView?: boolean;
  enableTelemetryLogs?: boolean;
  turnstileSimulation?: 'missing' | 'expired';
};

export type TurnstileState =
  | 'bypassed'
  | 'loading'
  | 'ready'
  | 'verified'
  | 'expired'
  | 'error';

export type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  privacyCopy: PrivacyCopy;
  formRef?: RefObject<HTMLFormElement | null> | null;
  privacyHref?: string;
  onSubmitted?: (response: ContactFormResponse) => void;
  debugState?: ContactFormDebugState;
  locale?: string;
  toastDebugScenario?: ContactFormToastDebugScenario;
  onSuccessStateChange?: (visible: boolean) => void;
};
