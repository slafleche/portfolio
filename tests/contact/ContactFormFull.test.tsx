import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextRequest } from 'next/server';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { ContactDialogContext } from '@/components/contact/ContactDialogProvider';
import ContactForm from '@/components/contact/ContactForm';
import {
  buildContactFormCopy,
} from '@/lib/locales/sections/form.locale';
import {
  deliverContactMessage,
  type DeliveryResult,
} from '@/server/contact/deliverContactMessage';
import { resetContactRateLimit } from '@/server/rateLimit/contactRateLimit';
import { verifyTurnstileToken } from '@/server/turnstile/verifyTurnstileToken';

import { POST as contactRoute } from '../../app/api/contact/route';
import { enFormTranslator } from './helpers/enFormTranslator';
import {
  enableTurnstileHarness,
  type TurnstileHarnessController,
} from './helpers/turnstileTestHarness';

vi.mock('@/server/turnstile/verifyTurnstileToken', () => ({
  verifyTurnstileToken: vi.fn(),
}));

vi.mock('@/server/contact/deliverContactMessage', () => ({
  deliverContactMessage: vi.fn(),
}));

const mockedVerify = vi.mocked(verifyTurnstileToken);
const mockedDeliver = vi.mocked(deliverContactMessage);

const buildDeliveryResult = (
  overrides: Partial<DeliveryResult> = {},
): DeliveryResult => ({
  ok: true,
  status: 202,
  error: undefined,
  attempts: [],
  retries: 0,
  retryReasons: [],
  ...overrides,
});

const buildCopy = () => buildContactFormCopy(enFormTranslator);

function renderWrappedContactForm(
  copy = buildCopy(),
  actionUrl = '/api/contact',
  turnstileSiteKey: string | null = null,
) {
  const dialogValue = {
    open: () => {},
    close: () => {},
    isOpen: false,
    openPrivacy: () => {},
    closePrivacy: () => {},
    isPrivacyOpen: false,
  };

  return render(
    <ContactDialogContext.Provider value={dialogValue}>
      <ContactForm
        copy={copy}
        actionUrl={actionUrl}
        turnstileSiteKey={turnstileSiteKey}
      />
    </ContactDialogContext.Provider>,
  );
}

const buildRequest = (body: Record<string, unknown>) => {
  const url = new URL('https://example.com/api/contact');
  return new NextRequest(url.toString(), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
};

describe('ContactForm — full stack happy path', () => {
  beforeEach(() => {
    resetContactRateLimit();
    vi.clearAllMocks();
    mockedVerify.mockResolvedValue({ ok: true });
    mockedDeliver.mockResolvedValue(buildDeliveryResult());
  });

  it('submits successfully through the real /api/contact route and shows success status', async () => {
    const copy = buildCopy();

    const turnstileHarness: TurnstileHarnessController =
      enableTurnstileHarness({
        mode: 'autoVerify',
      });

    const originalFetch = global.fetch;

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlString =
          typeof input === 'string' || input instanceof URL
            ? input.toString()
            : input.url;

        if (urlString.endsWith('/api/contact')) {
          const bodyJson = init?.body
            ? JSON.parse(init.body as string)
            : {};
          const request = buildRequest(bodyJson);
          const response = await contactRoute(request);
          return response as unknown as Response;
        }

        return originalFetch(input as never, init as never);
      },
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const { container, queryByTestId } = renderWrappedContactForm(
        copy,
        '/api/contact',
        turnstileHarness.getSiteKey(),
      );

      await userEvent.type(
        screen.getByLabelText(copy.blocks.name.label, {
          exact: false,
        }),
        'Jane Doe',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.email.label, {
          exact: false,
        }),
        'example@example.com',
      );
      await userEvent.type(
        screen.getByLabelText(copy.blocks.message.label, {
          exact: false,
        }),
        'This is a sufficiently long message for validation.',
      );

      const submitButton = screen.getByRole('button', {
        name: copy.submitLabel,
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const inlineRegion = container.querySelector(
          '[role="status"][aria-atomic="true"]',
        ) as HTMLElement | null;
        expect(inlineRegion).not.toBeNull();
        if (!inlineRegion) {
          throw new Error('Expected inline status region to render.');
        }

        expect(inlineRegion.textContent ?? '').toBe('');

        const messageCentreRegion = container.querySelector(
          '[role="status"]:not([aria-atomic]):not([data-form="loading"])',
        ) as HTMLElement | null;
        expect(messageCentreRegion).toBeNull();

        // No "jump to first issue" control should be present once the
        // form has successfully submitted with no validation errors.
        expect(queryByTestId('jump-to-first-issue')).toBeNull();
      });
    } finally {
      global.fetch = originalFetch;
      turnstileHarness.restore();
    }
  });
});
