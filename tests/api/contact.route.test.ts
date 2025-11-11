import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as contactRoute } from '../../app/api/contact/route';
import {
	resetContactRateLimit,
} from '@/server/rateLimit/contactRateLimit';
import { verifyTurnstileToken } from '@/server/turnstile/verifyTurnstileToken';
import { deliverContactMessage } from '@/server/contact/deliverContactMessage';

vi.mock('@/server/turnstile/verifyTurnstileToken', () => ({
	verifyTurnstileToken: vi.fn(),
}));

vi.mock('@/server/contact/deliverContactMessage', () => ({
	deliverContactMessage: vi.fn(),
}));

const mockedVerify = vi.mocked(verifyTurnstileToken);
const mockedDeliver = vi.mocked(deliverContactMessage);

const buildRequest = (
	body: Record<string, unknown>,
	options?: { locale?: string; ip?: string },
) => {
	const url = new URL('https://example.com/api/contact');
	if (options?.locale) {
		url.searchParams.set('locale', options.locale);
	}
	const req = new NextRequest(url.toString(), {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			...(options?.ip ? { 'x-real-ip': options.ip } : {}),
		},
	});
	return req;
};

const validPayload = () => ({
	name: 'Jane Doe',
	email: 'jane@example.com',
	message: 'Hello from a test message!',
	token: 'token-123',
	hp: '',
});

describe('POST /api/contact', () => {
	beforeEach(() => {
		resetContactRateLimit();
		vi.clearAllMocks();
		mockedVerify.mockResolvedValue({ ok: true });
		mockedDeliver.mockResolvedValue({ ok: true });
	});

	it('returns localized success for valid payloads', async () => {
		const infoSpy = vi
			.spyOn(console, 'info')
			.mockImplementation(() => {});
		const request = buildRequest(validPayload(), {
			locale: 'en',
			ip: '203.0.113.10',
		});

		const response = await contactRoute(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toMatchObject({
			ok: true,
			code: 'success',
			message: expect.stringContaining('Message sent'),
		});
		expect(mockedVerify).toHaveBeenCalledTimes(1);
		expect(mockedDeliver).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Jane Doe',
				email: 'jane@example.com',
			}),
		);
		expect(infoSpy).toHaveBeenCalledWith(
			'[contact][success]',
			expect.objectContaining({
				submissionId: expect.any(String),
				ipHash: expect.any(String),
				durationMs: expect.any(Number),
			}),
		);
		infoSpy.mockRestore();
	});

	it('short-circuits honeypot submissions', async () => {
		const payload = validPayload();
		payload.hp = 'bot-field';

		const response = await contactRoute(
			buildRequest(payload, { locale: 'en' }),
		);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.code).toBe('success');
		expect(mockedVerify).not.toHaveBeenCalled();
		expect(mockedDeliver).not.toHaveBeenCalled();
	});

	it('returns validation_error for invalid payloads', async () => {
		const response = await contactRoute(
			buildRequest(
				{
					name: '',
					email: 'invalid',
					message: 'short',
					token: '',
					hp: '',
				},
				{ locale: 'en' },
			),
		);
		const json = await response.json();

		expect(response.status).toBe(422);
		expect(json.code).toBe('validation_error');
		expect(mockedDeliver).not.toHaveBeenCalled();
	});

	it('propagates blocked code when Turnstile fails', async () => {
		mockedVerify.mockResolvedValue({
			ok: false,
			errorCodes: ['timeout-or-duplicate'],
		});
		const response = await contactRoute(
			buildRequest(validPayload(), { locale: 'en' }),
		);
		const json = await response.json();

		expect(response.status).toBe(403);
		expect(json.code).toBe('blocked');
	});

	it('returns not_configured when Turnstile secret missing', async () => {
		mockedVerify.mockResolvedValue({
			ok: false,
			errorCodes: ['missing-secret'],
		});
		const response = await contactRoute(
			buildRequest(validPayload(), { locale: 'en' }),
		);
		const json = await response.json();

		expect(response.status).toBe(503);
		expect(json.code).toBe('not_configured');
	});

	it('rate limits repeated requests per IP', async () => {
		const ip = '203.0.113.20';
		const first = await contactRoute(
			buildRequest(validPayload(), { locale: 'en', ip }),
		);
		expect(first.status).toBe(200);

		const second = await contactRoute(
			buildRequest(validPayload(), { locale: 'en', ip }),
		);
		const json = await second.json();

		expect(second.status).toBe(429);
		expect(json.code).toBe('rate_limited');
		expect(mockedDeliver).toHaveBeenCalledTimes(1);
	});

	it('rejects oversized payloads with 413', async () => {
		const huge =
			'This is a long message '.repeat(600); // ~12KB
		const response = await contactRoute(
			buildRequest(
				{
					...validPayload(),
					message: huge,
				},
				{ locale: 'en' },
			),
		);
		const json = await response.json();

		expect(response.status).toBe(413);
		expect(json.code).toBe('validation_error');
		expect(mockedDeliver).not.toHaveBeenCalled();
	});
});
