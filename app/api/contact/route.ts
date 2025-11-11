import { NextResponse, type NextRequest } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import {
	buildContactFormCopy,
	type ContactFormCopy,
	type FormStatusKey,
} from '@/lib/locales/sections/form.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import {
	validateDraft,
	type RawContactFormInput,
} from '@/modules/contactForm/validation';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';
import { verifyTurnstileToken } from '@/server/turnstile/verifyTurnstileToken';
import { consumeContactRateLimit } from '@/server/rateLimit/contactRateLimit';
import { deliverContactMessage } from '@/server/contact/deliverContactMessage';
import { DEFAULT_LOCALE } from '@/lib/locales/locale';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 8 * 1024;

const statusFromCode = (code: FormServerResponseCode): FormStatusKey =>
	(code === 'generic_error' ? 'generic' : code) as FormStatusKey;

const coerceLocale = (request: NextRequest) =>
	request.nextUrl.searchParams.get('locale') ??
	request.headers.get('x-locale') ??
	DEFAULT_LOCALE;

const getClientIp = (request: NextRequest): string | null => {
	const candidate =
		request.headers.get('x-real-ip') ??
		request.headers.get('x-forwarded-for');
	if (!candidate) return null;
	return candidate.split(',')[0]?.trim() ?? null;
};

const hashIp = (ip: string | null) =>
	ip
		? createHash('sha256').update(ip).digest('hex').slice(0, 12)
		: 'unknown';

const parseJsonBody = async (
	request: NextRequest,
): Promise<{ rawText: string; body: RawContactFormInput | null }> => {
	const rawText = await request.text();
	if (!rawText) {
		return { rawText: '', body: {} as RawContactFormInput };
	}
	try {
		return {
			rawText,
			body: JSON.parse(rawText) as RawContactFormInput,
		};
	} catch {
		return { rawText, body: null };
	}
};

const buildResponse = (
	code: FormServerResponseCode,
	options: {
		copy: ContactFormCopy;
		submissionId: string;
		status?: number;
		okOverride?: boolean;
		headers?: HeadersInit;
	},
) => {
	const statusKey = statusFromCode(code);
	const ok = options.okOverride ?? (code === 'success');
	const headers = new Headers(options.headers);
	headers.set('x-submission-id', options.submissionId);
	return NextResponse.json(
		{
			ok,
			code,
			message:
				options.copy.statuses[statusKey] ??
				options.copy.statuses.generic,
		},
		{
			status: options.status ?? (ok ? 200 : 400),
			headers,
		},
	);
};

export async function POST(request: NextRequest) {
	const submissionId = randomUUID();
	const startedAt = Date.now();
	const ip = getClientIp(request);
	const ipHash = hashIp(ip);
	const locale = coerceLocale(request);
	const translator = await loadTranslator(locale);
	const copy = buildContactFormCopy(translator);

	const { rawText, body } = await parseJsonBody(request);
	const bodyBytes = Buffer.byteLength(rawText, 'utf8');
	if (bodyBytes > MAX_BODY_BYTES) {
		console.warn('[contact][payload-too-large]', {
			submissionId,
			ipHash,
			bodyBytes,
		});
		return buildResponse('validation_error', {
			copy,
			submissionId,
			status: 413,
		});
	}

	if (!body) {
		console.warn('[contact][invalid-json]', {
			submissionId,
			ipHash,
		});
		return buildResponse('validation_error', {
			copy,
			submissionId,
			status: 400,
		});
	}

	const validation = validateDraft(body);
	if (validation.status === 'validation_error') {
		console.info('[contact][validation-error]', {
			submissionId,
			ipHash,
			errors: validation.errors,
		});
		return buildResponse('validation_error', {
			copy,
			submissionId,
			status: 422,
		});
	}

	const draft = validation.draft;

	if (draft.hp.trim().length > 0) {
		console.warn('[contact][honeypot]', {
			submissionId,
			ipHash,
		});
		return buildResponse('success', {
			copy,
			submissionId,
			okOverride: true,
		});
	}

	const rateKey =
		ip ?? `anon-${request.headers.get('user-agent') ?? 'unknown'}`;
	const rate = consumeContactRateLimit(rateKey);
	if (!rate.allowed) {
		console.warn('[contact][rate-limited]', {
			submissionId,
			ipHash,
			retryAfterSeconds: rate.retryAfterSeconds,
		});
		const headers: HeadersInit = {};
		if (rate.retryAfterSeconds !== undefined) {
			headers['retry-after'] = rate.retryAfterSeconds.toString();
		}
		return buildResponse('rate_limited', {
			copy,
			submissionId,
			status: 429,
			headers,
		});
	}

	const turnstile = await verifyTurnstileToken(draft.token, ip);
	if (!turnstile.ok) {
		const responseCode: FormServerResponseCode =
			turnstile.errorCodes?.includes('missing-secret')
				? 'not_configured'
				: 'blocked';
		console.warn('[contact][turnstile-blocked]', {
			submissionId,
			ipHash,
			errorCodes: turnstile.errorCodes,
		});
		return buildResponse(responseCode, {
			copy,
			submissionId,
			status: responseCode === 'not_configured' ? 503 : 403,
		});
	}

	try {
		await deliverContactMessage(draft);
	} catch (error) {
		console.error('[contact][delivery-error]', {
			submissionId,
			ipHash,
			error,
		});
		return buildResponse('service_unavailable', {
			copy,
			submissionId,
			status: 503,
		});
	}

	const durationMs = Date.now() - startedAt;
	console.info('[contact][success]', {
		submissionId,
		ipHash,
		durationMs,
		email: draft.email,
		nameLength: draft.name.length,
		messageLength: draft.message.length,
	});

	return buildResponse('success', {
		copy,
		submissionId,
	});
}
