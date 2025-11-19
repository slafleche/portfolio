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
  const requiredText = 'Required field';
  const autoResizeHandlers = useAutoResizeHandlers();
  const lockedMessage =
    'Here is a very long message that reaches the maximum length and contains multiple links: https://example.com https://foo.com https://bar.com';
  const counterTemplate = '{count} characters remaining';
  const maxCharactersMessage = 'Maximum characters reached.';
  const urlUsageTemplate = 'Links used: {used} of {limit}';
  const maxUrlsMessage = 'Maximum links reached.';
  const noopChange = () => {};
  const noopFocus = () => {};

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
              requiredText="Required field"
            />
            <TextInput
              id="debug-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
            />
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>FormHint (error)</span>
            <FormLabel
              htmlFor="debug-email"
              label="Email"
              required
              requiredText="Required field"
            />
            <TextInput
              id="debug-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby="debug-email-error"
              aria-invalid="true"
              placeholder="ada@example.com"
              disabled
            />
            <FormHint tone="error" id="debug-email-error">
              Please provide a valid email.
            </FormHint>
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>FormHint (helper)</span>
            <FormLabel
              htmlFor="debug-helper"
              label="Short code"
              required
              requiredText="Required field"
            />
            <TextInput
              id="debug-helper"
              value={name.slice(0, 6)}
              onChange={(event) => setName(event.target.value)}
              aria-describedby="debug-helper-hint"
              placeholder="ABC123"
            />
            <FormHint tone="helper" id="debug-helper-hint">
              Use up to 6 characters.
            </FormHint>
          </article>

          <article style={cardStyle}>
            <span style={labelStyle}>
              TextareaInput (auto-resize)
            </span>
            <FormLabel
              htmlFor="debug-message"
              label="Message"
              required
              requiredText="Required field"
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
              requiredText="Required field"
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

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Blocks</h2>
        <div style={gridStyle}>
          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>NameBlock (locked)</span>
              <NameBlock
                label="Name"
                requiredText={requiredText}
                value={'A'.repeat(NAME_LIMIT.max)}
                onChange={noopChange}
                helperText="Maximum reached"
                errorText={null}
                readOnly
                disabled
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>

          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>NameBlock (interactive)</span>
              <NameBlock
                label="Name"
                requiredText={requiredText}
                value={name}
                onChange={(event) => setName(event.target.value)}
                helperText={
                  name.length >= NAME_LIMIT.max
                    ? 'Maximum reached'
                    : `${NAME_LIMIT.max - name.length} characters remaining`
                }
                errorText={null}
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>

          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>EmailBlock (locked)</span>
              <EmailBlock
                label="Email"
                requiredText={requiredText}
                value="not-an-email"
                onChange={noopChange}
                helperText="We'll only use this to reply."
                errorText="Please provide a valid email."
                disabled
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>

          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>EmailBlock (interactive)</span>
              <EmailBlock
                label="Email"
                requiredText={requiredText}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                helperText="We'll only use this to reply."
                errorText={null}
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>

          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>MessageBlock (locked)</span>
              <MessageBlock
                label="Message"
                requiredText={requiredText}
                value={lockedMessage}
                counterTemplate={counterTemplate}
                maxCharactersMessage={maxCharactersMessage}
                urlUsageTemplate={urlUsageTemplate}
                maxUrlsMessage={maxUrlsMessage}
                onChange={() => {}}
                helperText={null}
                errorText={null}
                readOnly
                disabled
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>

          <FormBlocksProvider>
            <article style={cardStyle}>
              <span style={labelStyle}>MessageBlock (interactive)</span>
              <MessageBlock
                label="Message"
                requiredText={requiredText}
                value={message}
                counterTemplate={counterTemplate}
                maxCharactersMessage={maxCharactersMessage}
                urlUsageTemplate={urlUsageTemplate}
                maxUrlsMessage={maxUrlsMessage}
                onChange={(event) => setMessage(event.target.value)}
                helperText="Share up to 2000 characters."
                errorText={null}
                onFocusBefore={noopFocus}
                onFocusAfter={noopFocus}
              />
            </article>
          </FormBlocksProvider>
        </div>
      </section>
    </main>
  );
}
