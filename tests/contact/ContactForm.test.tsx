import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '@/components/contact/ContactForm';
import {
  ContactDialogContext,
} from '@/components/contact/ContactDialogProvider';
import type { ContactFormCopy } from '@/lib/locales/sections/form.locale';
import type { PrivacyCopy } from '@/lib/locales/sections/privacy.locale';

const mockSubmitFn = vi.fn();
const styleModule = vi.hoisted(() => {
  const handler = {
    get: (_target: Record<string, string>, prop: PropertyKey) =>
      typeof prop === 'string' ? prop : '',
    has: () => true,
  };
  return new Proxy<Record<string, string>>({}, handler);
});

vi.mock('@/styles/components/forms.css', () => styleModule);
const dialogStyles = vi.hoisted(() => {
  const handler = {
    get: (_target: Record<string, string>, prop: PropertyKey) =>
      typeof prop === 'string' ? prop : '',
    has: () => true,
  };
  return new Proxy<Record<string, string>>({}, handler);
});
vi.mock('@/styles/components/contactDialog.css', () => dialogStyles);

vi.mock('@/modules/contactForm/mockSubmit', () => ({
  mockSubmit: (...args: unknown[]) => mockSubmitFn(...(args as [])),
}));

const contactCopy: ContactFormCopy = {
  heading: 'Get in touch',
  requiredIndicator: 'Required field',
  submitLabel: 'Send message',
  successBody: 'We will reply soon.',
  rateLimitedCountdown: 'Too many attempts. Please wait {seconds}s.',
  privacy: {
    text: 'We only use this to reply.',
    linkLabel: 'Privacy',
    closeLabel: 'Close',
  },
  turnstile: {
    loading: 'Loading verification…',
    ready: 'Complete the verification above to enable submission.',
    verified: 'Verified — you can send your message.',
    expired: 'Verification expired. Please try again.',
    error: 'Verification is unavailable. Please retry.',
    disabled: 'Human verification is disabled here.',
    buttonPending: "Verify you're human",
    buttonError: 'Verification unavailable',
    preview: 'Human verification preview (debug).',
  },
  errors: {
    token: {
      missing: 'Token missing',
    },
  },
  statuses: {
    sending: 'Sending…',
    success: 'Message sent — thank you!',
    generic: 'Something went wrong',
    validation_error: 'Please fix the highlighted fields',
    rate_limited: 'Too many attempts',
    service_unavailable: 'Service unavailable',
    not_configured: 'Email service not configured',
    blocked: 'Submission blocked',
  },
  blocks: {
    name: {
      label: 'Name',
      requiredText: 'Required field',
      errors: {
        required: 'Name required',
        tooLong: 'Name too long',
      },
    },
    email: {
      label: 'Email',
      requiredText: 'Required field',
      errors: {
        invalid: 'Email invalid',
      },
    },
    message: {
      label: 'Message',
      requiredText: 'Required field',
      counterTemplate: '{count} characters left',
      maxCharactersMessage: 'Maximum characters reached.',
      urlUsageTemplate: 'Links used: {used} of {limit}',
      maxUrlsMessage: 'Maximum links reached.',
      errors: {
        required: 'Message required',
        tooShort: 'Message too short',
        tooLong: 'Message too long',
        tooManyLinks: 'Too many links',
      },
    },
    turnstile: {
      label: 'Human verification',
      requiredText: 'Required field',
      statuses: {
        loading: 'Loading human verification…',
        ready: 'Complete the verification above to enable submission.',
        verified: 'Verified — you can send your message.',
        expired: 'Verification expired. Please try again.',
        error: 'Verification is unavailable. Please retry.',
        disabled: 'Human verification is disabled here.',
      },
      buttons: {
        pending: "Verify you're human",
        error: 'Verification unavailable',
      },
      preview: 'Human verification preview (debug).',
      summary: {
        missing: 'Complete the human verification.',
        expired: 'Human verification expired. Please try again.',
        error: 'Human verification is unavailable. Please retry.',
      },
    },
    messageCentre: {
      statuses: {
        sending: 'Sending…',
        success: 'Message sent — thank you!',
        generic: 'Something went wrong',
        validation_error: 'Please fix the highlighted fields',
        rate_limited: 'Too many attempts',
        service_unavailable: 'Service unavailable',
        not_configured: 'Service not configured',
        blocked: 'Submission blocked',
      },
      rateLimitedCountdown: 'Too many attempts. Please wait {seconds}s.',
    },
    honeypot: {
      label: 'Leave blank',
    },
  },
};

const privacyCopy: PrivacyCopy = {
  title: 'Privacy Policy',
  href: '/privacy',
  updated: 'Updated recently',
  content: 'Privacy content',
};

const dialogValue = {
  open: vi.fn(),
  close: vi.fn(),
  isOpen: false,
  openPrivacy: vi.fn(),
  closePrivacy: vi.fn(),
  isPrivacyOpen: false,
};

const renderForm = () =>
  render(
    <ContactDialogContext.Provider value={dialogValue}>
      <ContactForm
        copy={contactCopy}
        privacyCopy={privacyCopy}
        locale="en"
        actionUrl="mock"
      />
    </ContactDialogContext.Provider>,
  );

describe('ContactForm', () => {
  beforeEach(() => {
    mockSubmitFn.mockReset();
  });

  it.skip('shows inline errors when submitting empty form', async () => {
    renderForm();
    fireEvent.click(
      screen.getByRole('button', { name: /send message/i }),
    );
    expect(
      await screen.findByText('Name required'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(contactCopy.statuses.validation_error),
    ).toBeInTheDocument();
    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it.skip('submits valid payload via mockSubmit', async () => {
    mockSubmitFn.mockResolvedValue({
      ok: true,
      code: 'success',
      message: 'ok',
    });

    renderForm();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Hello from a test message.' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /send message/i }),
    );

    await waitFor(() => expect(mockSubmitFn).toHaveBeenCalledTimes(1));
    expect(mockSubmitFn.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello from a test message.',
        token: 'mock-turnstile-token',
      }),
    );
  });
});
