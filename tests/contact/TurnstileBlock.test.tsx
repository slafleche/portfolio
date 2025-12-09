import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderTurnstileBlockWithFormBlocks } from './helpers/turnstileBlock.harness';
import { TurnstileBlock } from '@/components/contact/blocks/TurnstileBlock';
import { FormBlocksProvider } from '@/components/contact/formBlocks.context';
import type { TurnstileBlockLocale } from '@/lib/locales/form/form.turnstile';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

type TurnstileApi = NonNullable<Window['turnstile']>;
type TurnstileApiOptions = Parameters<TurnstileApi['render']>[1];

type MockTurnstileApi = TurnstileApi & {
  lastOptions: TurnstileApiOptions | null;
};

const turnstileCopy: TurnstileBlockLocale = {
  label: enFormCopy['form-turnstile-label'],
  requiredText: enFormCopy['form-required-indicator'],
  statuses: {
    loading: enFormCopy['form-turnstile-loading'],
    ready: enFormCopy['form-turnstile-ready'],
    verified: enFormCopy['form-turnstile-verified'],
    expired: enFormCopy['form-turnstile-expired'],
    error: enFormCopy['form-turnstile-error'],
    disabled: enFormCopy['form-turnstile-disabled'],
  },
  buttons: {
    pending: enFormCopy['form-turnstile-button-pending'],
    error: enFormCopy['form-turnstile-button-error'],
  },
  preview: enFormCopy['form-turnstile-preview'],
  summary: {
    missing: enFormCopy['form-turnstile-summary-missing'],
    expired: enFormCopy['form-turnstile-summary-expired'],
    error: enFormCopy['form-turnstile-summary-error'],
  },
};

const ORIGINAL_ENV = { ...process.env };

const createMockTurnstile = (shouldThrowOnRender = false): MockTurnstileApi => {
  const api: MockTurnstileApi = {
    lastOptions: null,
    render: (container, options) => {
      if (!container || typeof container === 'string') {
        throw new Error('Missing container');
      }
      api.lastOptions = options;
      if (shouldThrowOnRender) {
        throw new Error('Render failed');
      }
      return 'mock-widget-id';
    },
    reset: () => {},
  };
  return api;
};

const setTurnstileEnv = (siteKey: string | null) => {
  if (siteKey === null) {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  } else {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = siteKey;
  }
};

describe('Contact form block tests: TurnstileBlock', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    setTurnstileEnv('test-site-key');
    window.turnstile = createMockTurnstile();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    window.turnstile = undefined;
  });

  describe('wiring and state representation', () => {
    it('renders the wrapper with id, order, and hidden token input', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={1}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      await waitFor(() => {
        expect(wrapper).toHaveAttribute('data-state');
      });

      expect(wrapper).toHaveAttribute('data-order', '1');
      expect(wrapper).toHaveAttribute('data-disabled', 'false');

      const widgetContainer = wrapper.querySelector(
        '[data-rendered]',
      ) as HTMLDivElement | null;
      expect(widgetContainer).not.toBeNull();

      const tokenInput = wrapper.querySelector(
        'input[name="token"][type="hidden"]',
      ) as HTMLInputElement | null;
      expect(tokenInput).not.toBeNull();
      if (!tokenInput) return;

      expect(tokenInput.value).toBe('');
    });

    it('shows bypass preview and default token when no site key is configured', () => {
      setTurnstileEnv(null);
      window.turnstile = undefined;

      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      expect(wrapper).toHaveAttribute('data-state', 'bypassed');
      expect(wrapper).toHaveAttribute('data-disabled', 'false');

      const widgetContainer = wrapper.querySelector(
        '[data-rendered]',
      ) as HTMLDivElement | null;
      expect(widgetContainer).not.toBeNull();
      if (!widgetContainer) return;
      expect(widgetContainer).toHaveAttribute('data-rendered', 'false');

      const preview = screen.getByText(turnstileCopy.preview);
      expect(preview).toBeInTheDocument();

      const tokenInput = wrapper.querySelector(
        'input[name="token"][type="hidden"]',
      ) as HTMLInputElement | null;
      expect(tokenInput).not.toBeNull();
      if (!tokenInput) return;

      expect(tokenInput.value).toBe('mock-turnstile-token');
    });
  });

  describe('inline status and transitions', () => {
    it('starts in loading/ready and shows the missing summary before verification', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      expect(
        await screen.findByText(turnstileCopy.summary.missing),
      ).toBeInTheDocument();

      expect(wrapper.getAttribute('data-state')).toMatch(
        /^(loading|ready)$/,
      );
    });

    it('moves to verified state when the Turnstile callback is invoked', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      const api = window.turnstile as MockTurnstileApi | undefined;
      await waitFor(() => {
        expect(api?.lastOptions).not.toBeNull();
      });

      await act(async () => {
        api?.lastOptions?.callback?.('test-token');
      });

      expect(wrapper).toHaveAttribute('data-state', 'verified');
      expect(
        screen.queryByText(turnstileCopy.summary.missing),
      ).toBeNull();

      const tokenInput = wrapper.querySelector(
        'input[name="token"][type="hidden"]',
      ) as HTMLInputElement | null;
      expect(tokenInput?.value).toBe('test-token');
    });

    it('moves to expired state and shows expired summary when the expired callback is invoked', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      const api = window.turnstile as MockTurnstileApi | undefined;
      await waitFor(() => {
        expect(api?.lastOptions).not.toBeNull();
      });

    await act(async () => {
      api?.lastOptions?.['expired-callback']?.();
    });

    expect(wrapper).toHaveAttribute('data-state', 'expired');
    expect(
      screen.getByText(turnstileCopy.summary.expired),
    ).toBeInTheDocument();

    const tokenInput = wrapper.querySelector(
      'input[name="token"][type="hidden"]',
    ) as HTMLInputElement | null;
    expect(tokenInput).not.toBeNull();
    if (!tokenInput) return;
    expect(tokenInput.value).toBe('');
    });

    it('moves to error state and shows error summary when the error callback is invoked', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      const api = window.turnstile as MockTurnstileApi | undefined;
      await waitFor(() => {
        expect(api?.lastOptions).not.toBeNull();
      });

      await act(async () => {
        api?.lastOptions?.['error-callback']?.();
      });

      expect(wrapper).toHaveAttribute('data-state', 'error');
      expect(
        screen.getByText(turnstileCopy.summary.error),
      ).toBeInTheDocument();

      const tokenInput = wrapper.querySelector(
        'input[name="token"][type="hidden"]',
      ) as HTMLInputElement | null;
      expect(tokenInput).not.toBeNull();
      if (!tokenInput) return;
      expect(tokenInput.value).toBe('');
    });

    it('enters error state when the widget render throws', async () => {
      window.turnstile = createMockTurnstile(true);

      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled={false}
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      expect(
        await screen.findByText(turnstileCopy.summary.error),
      ).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-state', 'error');
    });
  });

  describe('disabled behaviour', () => {
    it('prevents pointer interaction when disabled', async () => {
      const { container } = render(
        <FormBlocksProvider>
          <TurnstileBlock
            id="test-turnstile-block"
            order={0}
            disabled
            copy={turnstileCopy}
          />
        </FormBlocksProvider>,
      );

      const wrapper = container.querySelector(
        '#test-turnstile-block',
      ) as HTMLDivElement | null;

      expect(wrapper).not.toBeNull();
      if (!wrapper) return;

      expect(wrapper).toHaveAttribute('data-disabled', 'true');

      const initialState = wrapper.getAttribute('data-state');

      const tokenInput = wrapper.querySelector(
        'input[name=\"token\"][type=\"hidden\"]',
      ) as HTMLInputElement | null;
      expect(tokenInput).not.toBeNull();
      if (!tokenInput) return;
      const initialToken = tokenInput.value;

      const widgetContainer = wrapper.querySelector(
        '[data-rendered]',
      ) as HTMLDivElement | null;
      expect(widgetContainer).not.toBeNull();
      if (!widgetContainer) return;

      await userEvent.click(widgetContainer);

      const api = window.turnstile as MockTurnstileApi | undefined;
      expect(api?.lastOptions).not.toBeNull();
      expect(wrapper.getAttribute('data-state')).toMatch(
        /^(loading|ready|bypassed|error)$/,
      );
      expect(tokenInput.value).toBe(initialToken);
    });
  });
});

describe('Contact form block contract: TurnstileBlock', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    setTurnstileEnv('test-site-key');
    window.turnstile = createMockTurnstile();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    window.turnstile = undefined;
  });

  it('registers under key "turnstile" with core contract shape', async () => {
    const { getRegistration } = renderTurnstileBlockWithFormBlocks({
      id: 'test-turnstile-block',
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    await waitFor(() => {
      expect(getRegistration()).not.toBeNull();
    });

    const registration = getRegistration();
    expect(registration).not.toBeNull();
    if (!registration) return;

    expect(registration.key).toBe('turnstile');
    expect(typeof registration.focus).toBe('function');
    expect(typeof registration.getValue).toBe('function');
    expect(typeof registration.validate).toBe('function');
    expect(typeof registration.getValidationSummary).toBe('function');
    expect(typeof registration.liveValidation).toBe('boolean');
    expect(typeof registration.getContract).toBe('function');
  });

  it('getValue reflects the current token for verified and bypassed states', async () => {
    const { getRegistration } = renderTurnstileBlockWithFormBlocks({
      id: 'test-turnstile-block',
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    const api = window.turnstile as MockTurnstileApi | undefined;
    let registration = getRegistration();
    expect(registration?.getValue?.()).toBe('');

    await waitFor(() => {
      expect(api?.lastOptions).not.toBeNull();
    });

    await act(async () => {
      api?.lastOptions?.callback?.('verified-token');
    });

    registration = getRegistration();
    expect(registration?.getValue?.()).toBe('verified-token');

    setTurnstileEnv(null);
    window.turnstile = undefined;

    const { getRegistration: getBypassedRegistration } =
      renderTurnstileBlockWithFormBlocks({
        id: 'test-turnstile-bypassed',
        order: 0,
        disabled: false,
        copy: turnstileCopy,
      });

    registration = getBypassedRegistration();
    expect(registration?.getValue?.()).toBe('mock-turnstile-token');
  });

  it('validate returns true for verified and bypassed, false for missing/expired/error', async () => {
    const { getRegistration } = renderTurnstileBlockWithFormBlocks({
      id: 'test-turnstile-block',
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    let registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    const api = window.turnstile as MockTurnstileApi | undefined;
    await waitFor(() => {
      expect(api?.lastOptions).not.toBeNull();
    });

    await act(async () => {
      api?.lastOptions?.callback?.('verified-token');
    });

    registration = getRegistration();
    expect(registration?.validate?.()).toBe(true);

    await act(async () => {
      api?.lastOptions?.['expired-callback']?.();
    });
    registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    await act(async () => {
      api?.lastOptions?.['error-callback']?.();
    });
    registration = getRegistration();
    expect(registration?.validate?.()).toBe(false);

    setTurnstileEnv(null);
    window.turnstile = undefined;

    const { getRegistration: getBypassedRegistration } =
      renderTurnstileBlockWithFormBlocks({
        id: 'test-turnstile-bypassed',
        order: 0,
        disabled: false,
        copy: turnstileCopy,
      });

    registration = getBypassedRegistration();
    expect(registration?.validate?.()).toBe(true);
  });

  it('getValidationSummary matches the status summary for non-completed states', async () => {
    const { getRegistration } = renderTurnstileBlockWithFormBlocks({
      id: 'test-turnstile-block',
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    const registration = getRegistration();
    expect(registration?.getValidationSummary?.()).toBe(
      turnstileCopy.summary.missing,
    );

    const api = window.turnstile as MockTurnstileApi | undefined;
    await waitFor(() => {
      expect(api?.lastOptions).not.toBeNull();
    });

    await act(async () => {
      api?.lastOptions?.['expired-callback']?.();
    });

    const expiredRegistration = getRegistration();
    expect(expiredRegistration?.getValidationSummary?.()).toBe(
      turnstileCopy.summary.expired,
    );

    await act(async () => {
      api?.lastOptions?.['error-callback']?.();
    });

    const errorRegistration = getRegistration();
    expect(errorRegistration?.getValidationSummary?.()).toBe(
      turnstileCopy.summary.error,
    );
  });

  it('returns structured validation results from the internal contract for all statuses', async () => {
    const blockId = 'test-turnstile-block';

    const { getTurnstileContract } = renderTurnstileBlockWithFormBlocks({
      id: blockId,
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    const api = window.turnstile as MockTurnstileApi | undefined;
    await waitFor(() => {
      expect(api?.lastOptions).not.toBeNull();
    });

    let contract = getTurnstileContract();
    expect(contract).not.toBeNull();
    if (!contract) return;

    let result = contract.validate();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].code).toBe('turnstile.missing');
    expect(result.messages[0].text).toBe(
      turnstileCopy.summary.missing,
    );
    expect(result.messages[0].scrollTarget).toBe(blockId);

    await act(async () => {
      api?.lastOptions?.callback?.('verified-token');
    });
    contract = getTurnstileContract();
    if (!contract) return;
    result = contract.validate();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);

    await act(async () => {
      api?.lastOptions?.['expired-callback']?.();
    });
    contract = getTurnstileContract();
    if (!contract) return;
    result = contract.validate();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].code).toBe('turnstile.expired');
    expect(result.messages[0].text).toBe(
      turnstileCopy.summary.expired,
    );

    await act(async () => {
      api?.lastOptions?.['error-callback']?.();
    });
    contract = getTurnstileContract();
    if (!contract) return;
    result = contract.validate();
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].code).toBe('turnstile.error');
    expect(result.messages[0].text).toBe(
      turnstileCopy.summary.error,
    );
    expect(result.messages[0].scrollTarget).toBe(blockId);
  });

  it('contract validate returns valid with no messages in bypassed state', () => {
    setTurnstileEnv(null);
    window.turnstile = undefined;

    const { getTurnstileContract } = renderTurnstileBlockWithFormBlocks({
      id: 'test-turnstile-bypassed',
      order: 0,
      disabled: false,
      copy: turnstileCopy,
    });

    const contract = getTurnstileContract();
    expect(contract).not.toBeNull();
    if (!contract) return;

    const result = contract.validate();
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });
});
