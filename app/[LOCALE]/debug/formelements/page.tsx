'use client';

// Debug sandbox: inline every bit of styling so we don't share space with "real" styles.
// No shared CSS, no production polish—just enough layout to preview primitives in isolation.

import { useCallback, useMemo, useRef, useState } from 'react';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import { FormHint } from '@/components/contact/primitives/FormHint';
import { TextInput } from '@/components/contact/primitives/TextInput';
import { TextareaInput } from '@/components/contact/primitives/TextareaInput';
import { SubmitButton } from '@/components/contact/primitives/SubmitButton';
import { NameBlock } from '@/components/contact/blocks/NameBlock';
import { EmailBlock } from '@/components/contact/blocks/EmailBlock';
import { MessageBlock } from '@/components/contact/blocks/MessageBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import { NAME_LIMIT } from '@/modules/contactForm/validation.constants';

const rootStyle = {
  padding: '32px 16px',
  maxWidth: 1200,
  margin: '0 auto',
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 24,
} as const;

const cardStyle = {
  borderRadius: 8,
  padding: 20,
  border: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const;

const labelStyle = {
  fontSize: 13,
  textTransform: 'uppercase',
  color: '#fafafa',
} as const;

const useAutoResizeHandlers = () => {
  const baseHeightRef = useRef<number | null>(null);

  const onInit = useCallback((node: HTMLTextAreaElement) => {
    baseHeightRef.current = node.scrollHeight;
  }, []);

  const onSync = useCallback((node: HTMLTextAreaElement) => {
    node.style.height = 'auto';
    const minimum = baseHeightRef.current ?? node.scrollHeight;
    node.style.height = `${Math.max(node.scrollHeight, minimum)}px`;
  }, []);

  return useMemo(
    () => ({
      onInit,
      onSync,
    }),
    [
      onInit,
      onSync,
    ],
  );
};

export default function ContactFormDebugPagePlaceholder() {
  return (
    <main style={rootStyle}>
      <h1 style={{ fontSize: '40px', marginBottom: 16 }}>
        Contact Form — Debug Playground
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6 }}>
        This playground is temporarily disabled while we refactor the form
        blocks.
      </p>
    </main>
  );
}
