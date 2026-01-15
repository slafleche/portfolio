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
   * Initial data for a block, mirroring the value stored in its
   * payload. For simple fields this is typically a string; for richer
   * blocks it can be an object containing multiple related values.
   */
  initialData?: Value;
  /**
   * When true, the block should run its validation logic on mount
   * using the initial data, so any relevant errors are visible
   * without user interaction.
   */
  validateOnMount?: boolean;
};

export type ContactFormBlockInitialValues = {
  /** Initial configuration for the Name block. */
  name?: ContactFormBlockInitialConfig<string>;
  /** Initial configuration for the Email block. */
  email?: ContactFormBlockInitialConfig<string>;
  /** Initial configuration for the Message block. */
  message?: ContactFormBlockInitialConfig<string>;
  /**
   * Initial configuration for the Turnstile block.
   *
   * For now this mirrors the token payload shape; it can be widened
   * later if the block stores richer data.
   */
  turnstile?: ContactFormBlockInitialConfig<string>;
  /** Initial configuration for the honeypot field. */
  honeypot?: ContactFormBlockInitialConfig<string>;
  /**
   * Optional initial flow-level state for the form itself. These
   * values are intended only for first-render seeding (for example,
   * styling scenarios) and must not be treated as live overrides once
   * the internal state has changed.
   */
  form?: {
    server?: {
      /**
       * Initial server-style submit status to surface in the message
       * centre (success, validation_error, rate_limited,
       * service_unavailable, not_configured, blocked, etc.).
       */
      submitStatus?: FormServerResponseCode;
      /**
       * Whether the form should appear to be in a submitting /
       * loading state on first render.
       */
      isSubmitting?: boolean;
    };
  };
};

export type ContactFormDebugFieldState = {
  disabled: boolean;
};

export type ContactFormDebugMode = {
  logInputs?: boolean;
  logValidation?: boolean;
  logMessages?: boolean;
};

export type ContactFormProps = {
  copy: ContactFormCopy;
  actionUrl?: string;
  onSuccessStateChange?: (visible: boolean) => void;
  /**
   * Optional initial values for individual form blocks. This is a
   * generic data shape for consumers (scenarios, tests, or other
   * hosts) to prefill and optionally validate blocks on mount.
   */
  initialBlocks?: ContactFormBlockInitialValues;
  /**
   * Public Turnstile site key to use when rendering the Turnstile
   * block. This should be derived from runtime env helpers at a
   * server/page boundary and passed into the form as plain data,
   * rather than reading env vars directly in components.
   */
  turnstileSiteKey?: string | null;
  debugMode?: ContactFormDebugMode;
  onOpenPrivacy?: () => void;
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
