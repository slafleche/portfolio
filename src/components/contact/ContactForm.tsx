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
          label={copy.labels.name}
          requiredText={copy.requiredIndicator}
          value={nameValue}
          onChange={handleNameChange}
          helperText={debugState?.inlineHelpers?.name ?? null}
          errorText={debugState?.inlineErrors?.name ?? null}
          readOnly={debugState?.fieldStates?.name?.readOnly}
          disabled={debugState?.fieldStates?.name?.disabled}
        />
        <EmailBlock
          label={copy.labels.email}
          requiredText={copy.requiredIndicator}
          value={emailValue}
          onChange={handleEmailChange}
          helperText={debugState?.inlineHelpers?.email ?? null}
          errorText={debugState?.inlineErrors?.email ?? null}
          readOnly={debugState?.fieldStates?.email?.readOnly}
          disabled={debugState?.fieldStates?.email?.disabled}
        />
        <MessageBlock
          value={messageValue}
          label={copy.labels.message}
          requiredText={copy.requiredIndicator}
          counterTemplate={copy.counterTemplate}
          maxCharactersMessage={copy.messages.maxChars}
          urlUsageTemplate={copy.messages.urlUsage}
          maxUrlsMessage={copy.messages.maxLinks}
          onChange={handleMessageChange}
          helperText={debugState?.inlineHelpers?.message ?? null}
          errorText={debugState?.inlineErrors?.message ?? null}
        />
      </form>
    </FormBlocksProvider>
  );
}
