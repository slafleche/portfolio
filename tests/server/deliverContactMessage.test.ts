import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactFormDraft } from '@/modules/contactForm/validation';

const ORIGINAL_ENV = { ...process.env };

const buildDraft = (): ContactFormDraft => ({
	name: 'Test Sender',
	email: 'sender@example.com',
	message: 'Hello from a test payload with enough length.',
	token: 'turnstile-token',
	hp: '',
});

const assignBaseEnv = () => {
	process.env = {
		...ORIGINAL_ENV,
		BREVO_API_KEY: 'test-key',
		MAIL_FROM: 'portfolio@example.com',
		MAIL_TO: 'owner@example.com',
		BREVO_TIMEOUT_MS: '5',
		BREVO_RETRY_DELAY_MS: '1',
		BREVO_RETRY_JITTER_MS: '0',
	} as NodeJS.ProcessEnv;
};

const createAbortError = () => {
	const error = new Error('Request aborted');
	error.name = 'AbortError';
	return error;
};

describe('deliverContactMessage', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();
		vi.useRealTimers();
		assignBaseEnv();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
	});

	it('retries once and reports timeout failures', async () => {
		const abortingFetch = vi
			.fn()
			.mockImplementation(
				(_: string, init: RequestInit = {}) =>
					new Promise((_resolve, reject) => {
						const signal = init.signal;
						if (!signal) {
							reject(new Error('Missing abort signal'));
							return;
						}
						if (signal.aborted) {
							reject(createAbortError());
							return;
						}
						signal.addEventListener(
							'abort',
							() => {
								reject(createAbortError());
							},
							{ once: true },
						);
					}),
			);
		vi.stubGlobal('fetch', abortingFetch);

		const { deliverContactMessage } = await import(
			'@/server/contact/deliverContactMessage'
		);

		const result = await deliverContactMessage(buildDraft());

		expect(abortingFetch).toHaveBeenCalledTimes(2);
		expect(result.ok).toBe(false);
		expect(result.status).toBe(500);
		expect(result.retries).toBe(1);
		expect(result.retryReasons).toEqual(['timeout']);
		expect(result.attempts).toHaveLength(2);
		expect(result.attempts.every((attempt) => attempt.aborted)).toBe(true);
	});

	it('returns not configured when Brevo env vars are missing', async () => {
		process.env.BREVO_API_KEY = '';
		delete process.env.MAIL_FROM;
		delete process.env.MAIL_TO;

		const { deliverContactMessage } = await import(
			'@/server/contact/deliverContactMessage'
		);

		const result = await deliverContactMessage(buildDraft());
		expect(result.ok).toBe(false);
		expect(result.status).toBe(503);
		expect(result.error).toBeInstanceOf(Error);
		expect((result.error as Error).message).toMatch(/not configured/i);
		expect(result.attempts).toHaveLength(0);
		expect(result.retries).toBe(0);
	});
});
