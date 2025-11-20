'use client';

import { useState, useCallback } from 'react';
import type { ContactFormProps } from './contactForm.types';
import * as s from '@/styles/components/forms.css';
import { FormBlocksProvider } from './formBlocks.context';
import { NameBlock } from './blocks/NameBlock';
import { EmailBlock } from './blocks/EmailBlock';
import { MessageBlock } from './blocks/MessageBlock';

const DEFAULT_ACTION_URL = '/api/contact';

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  formRef = null,
  copy,
  debugState,
  ...rest
}: ContactFormProps) {
  void rest;

  const [nameValue, setNameValue] = useState(
    debugState?.values?.name ?? '',
  );
  const [emailValue, setEmailValue] = useState(
    debugState?.values?.email ?? '',
  );
  const [messageValue, setMessageValue] = useState(
    debugState?.values?.message ?? '',
  );

  const handleNameChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setNameValue(event.target.value);
  }, []);

  const handleEmailChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setEmailValue(event.target.value);
  }, []);

  const handleMessageChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >((event) => {
    setMessageValue(event.target.value);
  }, []);

  return (
    <FormBlocksProvider>
      <form
        ref={formRef}
        className={s.form}
        action={actionUrl}
        noValidate
      >
        <NameBlock
          copy={copy.blocks.name}
          value={nameValue}
          onChange={handleNameChange}
          onBlur={debugState ? undefined : undefined}
          readOnly={debugState?.fieldStates?.name?.readOnly}
          disabled={debugState?.fieldStates?.name?.disabled}
        />
        <EmailBlock
          copy={copy.blocks.email}
          value={emailValue}
          onChange={handleEmailChange}
          onBlur={debugState ? undefined : undefined}
          readOnly={debugState?.fieldStates?.email?.readOnly}
          disabled={debugState?.fieldStates?.email?.disabled}
        />
        <MessageBlock
          copy={copy.blocks.message}
          value={messageValue}
          onChange={handleMessageChange}
          onBlur={debugState ? undefined : undefined}
          helperText={debugState?.inlineHelpers?.message ?? null}
          errorText={debugState?.inlineErrors?.message ?? null}
        />
      </form>
    </FormBlocksProvider>
  );
}
