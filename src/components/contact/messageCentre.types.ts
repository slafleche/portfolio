export type CategoryErrorKey =
  | 'RequiredInput'
  | 'InvalidInput'
  | 'SubmissionError';

export type TranslatedErrorMessage = string;

// Raw message shape produced by blocks / form internals before category/source are attached.
export type MessageBase = {
  type: 'catastrophic' | 'error' | 'warning' | 'info';
  code: string; // Internal code to identify the message scenario (e.g., 'turnstile.missing').
  text: string; // User-facing message text.
  scrollTarget?: string; // Optional key for scroll & focus (usually a block id).
};

// Generic envelope used when sending messages toward the message centre.
export type MessageCentreTransmission<
  TMessage extends MessageBase = MessageBase,
> = {
  source: string; // Block key or 'form' / other logical sources.
  messages: TMessage[];
};

// Flattened message summaries used by the MessageCentreBlock for display.
// `globals` are form-level messages; `blocks` are block-specific summaries.
export type MessageCentreMessages = {
  globals: string[];
  blocks: string[];
  toastFallback?: string;
};
