'use client';

import { useState } from 'react';
import { FormBlocksProvider } from './formBlocks.context';
import { NameBlock } from './blocks/NameBlock';
import { EmailBlock } from './blocks/EmailBlock';
import { MessageBlock } from './blocks/MessageBlock';
import { TurnstileBlock } from './blocks/TurnstileBlock';
import { HoneypotBlock } from './blocks/HoneypotBlock';
import { ContactPrivacy } from './ContactPrivacy';
import * as s from '@/styles/components/forms.css';
import type {
  ContactFormBlockBaseProps,
  ContactFormProps,
} from './types/form.types';
import { useSafeId } from '../../lib/dom';

const DEFAULT_ACTION_URL = '/api/contact';

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  copy,
  ...rest
}: ContactFormProps) {
  void rest;
  const idPrefix = useSafeId('contact-form-');

  const [formMembers] = useState<ContactFormBlockBaseProps[]>(() => [
    { id: `${idPrefix}name`, order: 1, disabled: false, required: true },
    { id: `${idPrefix}email`, order: 2, disabled: false, required: true },
    { id: `${idPrefix}message`, order: 3, disabled: false, required: true },
    { id: `${idPrefix}turnstile`, order: 4, disabled: false, required: true },
  ]);
  return (
    <FormBlocksProvider>
      <form
        className={s.form}
        action={actionUrl}
        noValidate
      >
        <NameBlock
          {...formMembers[0]}
          copy={copy.blocks.name}
        />
        <EmailBlock
          {...formMembers[1]}
          copy={copy.blocks.email}
        />
        <MessageBlock
          {...formMembers[2]}
          copy={copy.blocks.message}
        />
        <TurnstileBlock
          {...formMembers[3]}
          copy={copy.blocks.turnstile}
        />
        <ContactPrivacy copy={copy.privacy} />
        <HoneypotBlock copy={copy.blocks.honeypot} />
      </form>
    </FormBlocksProvider>
  );
}
