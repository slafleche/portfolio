'use client';

// Debug sandbox: inline every bit of styling so we don't share space with "real" styles.
// No shared CSS, no production polish—just enough layout to preview primitives in isolation.

import { useCallback, useMemo, useRef, useState } from 'react';
import { FormLabel } from '@/components/contact/primitives/FormLabel';
import { FormError } from '@/components/contact/primitives/FormError';
import { TextInput } from '@/components/contact/primitives/TextInput';
import { TextareaInput } from '@/components/contact/primitives/TextareaInput';
import { SubmitButton } from '@/components/contact/primitives/SubmitButton';

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
  const [
    name,
    setName,
  ] = useState('');
  const [
    email,
    setEmail,
  ] = useState('ada@bad-email');
  const [
    message,
    setMessage,
  ] = useState('');
  const autoResizeHandlers = useAutoResizeHandlers();

  return (
    <main style={rootStyle}>
      <h1 style={{ fontSize: '40px', marginBottom: 16 }}>
        Contact Form — Debug Playground
      </h1>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Primitives</h2>
        <div style={gridStyle}>
          <article style={cardStyle}>
            <span style={labelStyle}>FormLabel</span>
            <FormLabel
              htmlFor="debug-name"
              label="Full name"
              required
              requiredText="required"
            />
            <TextInput
              id="debug-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
            />
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>FormError + TextInput</span>
            <FormLabel htmlFor="debug-email" label="Email" required />
            <FormError
              error="Please provide a valid email."
              errorId="debug-email-error"
            >
              <TextInput
                id="debug-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby="debug-email-error"
                placeholder="ada@example.com"
                disabled
              />
            </FormError>
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>
              TextareaInput (auto-resize)
            </span>
            <FormLabel
              htmlFor="debug-message"
              label="Message"
              required
            />
            <TextareaInput
              id="debug-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Auto-resize kicks in as you type…"
              autoResizeHandlers={autoResizeHandlers}
            />
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>TextareaInput (standard)</span>
            <FormLabel
              htmlFor="debug-message-static"
              label="Static notes"
              required
            />
            <TextareaInput
              id="debug-message-static"
              rows={4}
              placeholder="This textarea keeps a fixed height."
            />
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>SubmitButton</span>
            <SubmitButton>Send message</SubmitButton>
            <SubmitButton disabled>Disabled state</SubmitButton>
          </article>
        </div>
      </section>
    </main>
  );
}
