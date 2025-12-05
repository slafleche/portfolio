'use client';

import { FormBlocksProvider } from './formBlocks.context';
import { NameBlock } from './blocks/NameBlock';
import { EmailBlock } from './blocks/EmailBlock';
import { MessageBlock } from './blocks/MessageBlock';
import { TurnstileBlock } from './blocks/TurnstileBlock';
import { HoneypotBlock } from './blocks/HoneypotBlock';
import { ContactPrivacy } from './ContactPrivacy';
import * as s from '@/styles/components/forms.css';
import type { ContactFormProps } from './types/form.types';

const DEFAULT_ACTION_URL = '/api/contact';

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  copy,
  ...rest
}: ContactFormProps) {
  void rest;

  return (
    <FormBlocksProvider>
      <form
        className={s.form}
        action={actionUrl}
        noValidate
      >
        <NameBlock copy={copy.blocks.name} />
        <EmailBlock copy={copy.blocks.email} />
        <MessageBlock copy={copy.blocks.message} />
        <HoneypotBlock copy={copy.blocks.honeypot} />
        <TurnstileBlock copy={copy.blocks.turnstile} />
        <ContactPrivacy copy={copy.privacy} />
      </form>
    </FormBlocksProvider>
  );
}
