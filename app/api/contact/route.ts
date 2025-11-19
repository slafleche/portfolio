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
import {
	maybeTriggerContactAlert,
	recordBrevoAttempts,
	recordRetryMetric,
	recordSubmissionMetric,
} from '@/server/contact/contactTelemetry';
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

const hashValue = (value: string | null) =>
	value
		? createHash('sha256').update(value).digest('hex').slice(0, 12)
		: 'unknown';

const hashIp = (ip: string | null) => hashValue(ip);
const hashEmail = (email: string | null) => hashValue(email);

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
		bodyExtras?: Record<string, unknown>;
	},
) => {
	const statusKey = statusFromCode(code);
	const ok = options.okOverride ?? (code === 'success');
	const headers = new Headers(options.headers);
	headers.set('x-submission-id', options.submissionId);
	const body = {
		ok,
		code,
		message:
			options.copy.statuses[statusKey] ??
			options.copy.statuses.generic,
		...(options.bodyExtras ?? {}),
	};
	return NextResponse.json(
		body,
		{
			status: options.status ?? (ok ? 200 : 400),
			headers,
		},
	);
};

type ResponseTelemetryOptions = Parameters<typeof buildResponse>[1] & {
	startedAt: number;
	ipHash: string | null;
	logExtras?: Record<string, unknown>;
};

const respondWithTelemetry = (
	code: FormServerResponseCode,
	options: ResponseTelemetryOptions,
) => {
	const { startedAt, ipHash, logExtras, ...responseOptions } = options;
	const resolvedOk =
		responseOptions.okOverride ?? (code === 'success');
	const httpStatus = responseOptions.status ?? (resolvedOk ? 200 : 400);
	const response = buildResponse(code, responseOptions);
	const durationMs = Date.now() - startedAt;
	recordSubmissionMetric({
		code,
		durationMs,
		submissionId: responseOptions.submissionId,
		ipHash,
		status: httpStatus,
		extra: logExtras,
	});
	maybeTriggerContactAlert(code, {
		submissionId: responseOptions.submissionId,
		ipHash,
		status: httpStatus,
		...logExtras,
	});
	return response;
};

const brevoStatusToCode = (
	status: number,
	error?: unknown,
): FormServerResponseCode => {
	if (status === 400) return 'validation_error';
	if (status === 401 || status === 403) return 'not_configured';
	if (status === 429) return 'rate_limited';
	if (
		status === 503 &&
		error instanceof Error &&
		/not\s+configured/i.test(error.message)
	) {
		return 'not_configured';
	}
	if (status >= 500) return 'service_unavailable';
	return 'generic_error';
};

export async function POST(request: NextRequest) {
	const submissionId = randomUUID();
	const startedAt = Date.now();
	const ip = getClientIp(request);
	const ipHash = hashIp(ip);
	const locale = coerceLocale(request);
	const translator = await loadTranslator(locale);
	const copy = buildContactFormCopy(translator);
	let brevoMeta: {
		attempts: number;
		retries: number;
		status: number;
	} | null = null;

	const { rawText, body } = await parseJsonBody(request);
	const bodyBytes = Buffer.byteLength(rawText, 'utf8');
	if (bodyBytes > MAX_BODY_BYTES) {
		console.warn('[contact][payload-too-large]', {
			submissionId,
			ipHash,
			bodyBytes,
		});
		return respondWithTelemetry('validation_error', {
			copy,
			submissionId,
			status: 413,
			startedAt,
			ipHash,
			logExtras: {
				reason: 'payload-too-large',
				bodyBytes,
			},
		});
	}

	if (!body) {
		console.warn('[contact][invalid-json]', {
			submissionId,
			ipHash,
		});
		return respondWithTelemetry('validation_error', {
			copy,
			submissionId,
			status: 400,
			startedAt,
			ipHash,
			logExtras: { reason: 'invalid-json' },
		});
	}

	const validation = validateDraft(body);
	if (validation.status === 'validation_error') {
		console.info('[contact][validation-error]', {
			submissionId,
			ipHash,
			errors: validation.errors,
		});
		return respondWithTelemetry('validation_error', {
			copy,
			submissionId,
			status: 422,
			startedAt,
			ipHash,
			logExtras: {
				reason: 'validation-error',
				errorCount: Object.keys(validation.errors).length,
			},
		});
	}

	const draft = validation.draft;

	if (draft.hp.trim().length > 0) {
		console.warn('[contact][honeypot]', {
			submissionId,
			ipHash,
		});
		return respondWithTelemetry('success', {
			copy,
			submissionId,
			okOverride: true,
			startedAt,
			ipHash,
			logExtras: { reason: 'honeypot' },
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
		return respondWithTelemetry('rate_limited', {
			copy,
			submissionId,
			status: 429,
			headers,
			startedAt,
			ipHash,
			logExtras: {
				reason: 'rate-limited',
				retryAfterSeconds: rate.retryAfterSeconds,
			},
			bodyExtras:
				rate.retryAfterSeconds !== undefined
					? { retryAfterSeconds: rate.retryAfterSeconds }
					: undefined,
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
		return respondWithTelemetry(responseCode, {
			copy,
			submissionId,
			status: responseCode === 'not_configured' ? 503 : 403,
			startedAt,
			ipHash,
			logExtras: {
				reason: 'turnstile',
				errorCodes: turnstile.errorCodes,
			},
		});
	}

	try {
		const delivery = await deliverContactMessage(draft);
		recordBrevoAttempts(delivery.attempts);
		for (const reason of delivery.retryReasons) {
			recordRetryMetric(reason);
		}
		if (!delivery.ok) {
			const responseCode = brevoStatusToCode(
				delivery.status,
				delivery.error,
			);
			console.error('[contact][delivery-error]', {
				submissionId,
				ipHash,
				status: delivery.status,
				error: delivery.error,
			});
			return respondWithTelemetry(responseCode, {
				copy,
				submissionId,
				status: delivery.status >= 400 ? delivery.status : 503,
				startedAt,
				ipHash,
				logExtras: {
					reason: 'brevo-delivery',
					brevoStatus: delivery.status,
					brevoRetries: delivery.retries,
					brevoAttempts: delivery.attempts.length,
				},
			});
		}
		brevoMeta = {
			attempts: delivery.attempts.length,
			retries: delivery.retries,
			status: delivery.status,
		};
	} catch (error) {
		console.error('[contact][delivery-error]', {
			submissionId,
			ipHash,
			error,
		});
		return respondWithTelemetry('service_unavailable', {
			copy,
			submissionId,
			status: 503,
			startedAt,
			ipHash,
			logExtras: { reason: 'delivery-exception' },
		});
	}

	const durationMs = Date.now() - startedAt;
	const emailHash = hashEmail(draft.email);
	console.info('[contact][success]', {
		submissionId,
		ipHash,
		durationMs,
		emailHash,
		nameLength: draft.name.length,
		messageLength: draft.message.length,
		brevoAttempts: brevoMeta?.attempts ?? 0,
		brevoRetries: brevoMeta?.retries ?? 0,
	});

	return respondWithTelemetry('success', {
		copy,
		submissionId,
		startedAt,
		ipHash,
		logExtras: {
			reason: 'delivered',
			brevoAttempts: brevoMeta?.attempts ?? 0,
			brevoRetries: brevoMeta?.retries ?? 0,
			brevoStatus: brevoMeta?.status,
		},
	});
}
