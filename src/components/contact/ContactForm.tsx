'use client';

import type {
  ContactFormProps,
} from './contactForm.types';
import * as s from '@/styles/components/forms.css';
import { FormBlocksProvider } from './formBlocks.context';

const DEFAULT_ACTION_URL = '/api/contact';

export default function ContactForm({
  actionUrl = DEFAULT_ACTION_URL,
  formRef = null,
  ...rest
}: ContactFormProps) {
  void rest;

  return (
    <FormBlocksProvider>
      <form
        ref={formRef}
        className={s.form}
        action={actionUrl}
        noValidate
      >
        {/* Blocks will be rendered here as they come online */}
      </form>
    </FormBlocksProvider>
  );
}
