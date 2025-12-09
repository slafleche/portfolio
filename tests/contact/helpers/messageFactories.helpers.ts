import type { MessageBase } from '@/components/contact/messageCentre.types';
import type { ContactFormBlockValidationResult } from '@/components/contact/types/form.types';

export type MessageFactoryOptions = Partial<MessageBase>;

export function makeMessageBase(
  overrides: MessageFactoryOptions = {},
): MessageBase {
  return {
    type: 'error',
    code: 'test.message',
    text: 'Test message',
    ...overrides,
  };
}

export type ValidationResultFactoryOptions = {
  id: string;
  valid?: boolean;
  messages?: MessageBase[];
};

export function makeValidationResult({
  id,
  valid,
  messages,
}: ValidationResultFactoryOptions): ContactFormBlockValidationResult {
  const resolvedMessages = messages ?? [];
  const resolvedValid =
    typeof valid === 'boolean'
      ? valid
      : resolvedMessages.length === 0;

  return {
    id,
    valid: resolvedValid,
    messages: resolvedMessages,
  };
}

