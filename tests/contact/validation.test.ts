import { describe, expect, it } from 'vitest';
import {
  MESSAGE_URL_LIMIT,
  normalizeInput,
  validateDraft,
} from '@/modules/contactForm/validation';
import { formTokens } from '@/tokens/forms.tokens';

const baseInput = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello there! This is a valid message.',
  token: 'turnstile-token',
  hp: '',
};

describe('contactForm validation', () => {
  it('normalizes casing, trims values, and clamps lengths', () => {
    const draft = normalizeInput({
      name: '  Jane  ',
      email: 'USER@Example.COM ',
      message: 'hi',
      token: ' tok ',
      hp: ' trap ',
    });
    expect(draft.name).toBe('Jane');
    expect(draft.email).toBe('user@example.com');
    expect(draft.message).toBe('hi');
    expect(draft.token).toBe('tok');
    expect(draft.hp).toBe('trap');
  });

  it('accepts valid payloads without errors', () => {
    const result = validateDraft(baseInput);
    expect(result.errors).toEqual({});
    expect(result.status).toBeNull();
  });

  it('captures required field violations and invalid email', () => {
    const result = validateDraft({
      name: 'J',
      email: 'invalid-email',
      message: 'short',
      token: '',
      hp: '',
    });
    expect(result.errors.name).toBe('form-error-name-required');
    expect(result.errors.email).toBe('form-error-email-invalid');
    expect(result.errors.message).toBe('form-error-message-required');
    expect(result.errors.token).toBe('form-error-token-missing');
    expect(result.status).toBe('validation_error');
  });

  it('enforces max length, URL limit, and token presence', () => {
    const longMessage = 'a'.repeat(2050);
    const links = Array.from(
      { length: MESSAGE_URL_LIMIT + 1 },
      (_, i) => `https://example${i}.com`,
    ).join(' ');

    const result = validateDraft({
      ...baseInput,
      message: `${'ok '.repeat(5)} ${links} ${links}`,
    });
    expect(result.errors.message).toBe(
      'form-error-message-too_many_links',
    );

    const tooLong = validateDraft({
      ...baseInput,
      message: longMessage,
    });
    expect(tooLong.draft.message.length).toBe(
      formTokens.message.maxChars,
    );
  });

  it('ignores honeypot content for validation but preserves in draft', () => {
    const result = validateDraft({
      ...baseInput,
      hp: 'bot',
    });
    expect(result.draft.hp).toBe('bot');
    expect(result.errors).toEqual({});
  });
});
