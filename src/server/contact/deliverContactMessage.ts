import type { ContactFormDraft } from '@/modules/contactForm/validation';
import type { RetryReason } from '@/server/contact/contactTelemetry';

export type DeliveryAttempt = {
	attempt: number;
	durationMs: number;
	status?: number;
	aborted?: boolean;
	errorSummary?: string;
	retryReason?: RetryReason;
};

export type DeliveryResult = {
	ok: boolean;
	status: number;
	error?: unknown;
	attempts: DeliveryAttempt[];
	retries: number;
	retryReasons: RetryReason[];
};

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const SUBJECT_PREFIX =
	process.env.CONTACT_SUBJECT_PREFIX ?? '[Portfolio Contact]';
const BREVO_TIMEOUT_MS = Number(process.env.BREVO_TIMEOUT_MS ?? 8000);
const BREVO_RETRY_DELAY_MS = Number(process.env.BREVO_RETRY_DELAY_MS ?? 350);
const BREVO_RETRY_JITTER_MS = Number(
	process.env.BREVO_RETRY_JITTER_MS ?? 250,
);
const MAX_BREVO_ATTEMPTS = 2;

const sleep = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const jitterDelay = () =>
	BREVO_RETRY_DELAY_MS +
	Math.floor(Math.random() * Math.max(1, BREVO_RETRY_JITTER_MS));

const summarizeError = (error: unknown): string | undefined => {
	if (!error) return undefined;
	if (error instanceof Error) {
		return error.message.slice(0, 200);
	}
	if (typeof error === 'string') {
		return error.slice(0, 200);
	}
	try {
		return JSON.stringify(error).slice(0, 200);
	} catch {
		return undefined;
	}
};

const isAbortError = (error: unknown) =>
	error instanceof Error && error.name === 'AbortError';

const shouldRetry = (status?: number, error?: unknown) => {
	if (isAbortError(error)) {
		return true;
	}
	if (status === undefined) {
		return true;
	}
	if (status === 408 || status === 425 || status === 429) {
		return true;
	}
	return status >= 500 && status < 600;
};

const retryReasonFor = (status?: number, error?: unknown): RetryReason => {
	if (isAbortError(error)) return 'timeout';
	if (status && status >= 500) return 'server';
	return 'network';
};

const formatPlainTextBody = (draft: ContactFormDraft) => {
	return [
		`${SUBJECT_PREFIX} Message from ${draft.name}`,
		'',
		`Name: ${draft.name}`,
		`Email: ${draft.email}`,
		'',
		'Message:',
		draft.message,
	].join('\n');
};

const buildPayload = (
	draft: ContactFormDraft,
	senderEmail: string,
	recipientEmail: string,
) => ({
	headers: {
		'X-Portfolio-Contact': 'true',
	},
	sender: {
		email: senderEmail,
		name: 'Portfolio Contact',
	},
	to: [
		{
			email: recipientEmail,
			name: 'Portfolio Inbox',
		},
	],
	replyTo: {
		email: draft.email,
		name: draft.name,
	},
	subject: `${SUBJECT_PREFIX} ${draft.name}`,
	textContent: formatPlainTextBody(draft),
});

export async function deliverContactMessage(
	draft: ContactFormDraft,
): Promise<DeliveryResult> {
	const apiKey = process.env.BREVO_API_KEY;
	const senderEmail = process.env.MAIL_FROM;
	const recipientEmail = process.env.MAIL_TO;

	if (!apiKey || !senderEmail || !recipientEmail) {
		return {
			ok: false,
			status: 503,
			error: new Error('Brevo not configured'),
			attempts: [],
			retries: 0,
			retryReasons: [],
		};
	}

	const attempts: DeliveryAttempt[] = [];
	const retryReasons: RetryReason[] = [];
	const payload = buildPayload(draft, senderEmail, recipientEmail);

	for (let attempt = 1; attempt <= MAX_BREVO_ATTEMPTS; attempt += 1) {
		const attemptStart = Date.now();
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), BREVO_TIMEOUT_MS);

		try {
			const response = await fetch(BREVO_ENDPOINT, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'api-key': apiKey,
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});
			const durationMs = Date.now() - attemptStart;
			clearTimeout(timeoutId);

			if (response.ok) {
				attempts.push({
					attempt,
					durationMs,
					status: response.status,
				});
				return {
					ok: true,
					status: response.status,
					attempts,
					retries: attempts.length - 1,
					retryReasons,
				};
			}

			let errorPayload: unknown = null;
			try {
				errorPayload = await response.json();
			} catch {
				errorPayload = null;
			}

			const retryable = shouldRetry(response.status, errorPayload);
			const attemptRecord: DeliveryAttempt = {
				attempt,
				durationMs,
				status: response.status,
				errorSummary: summarizeError(errorPayload),
				retryReason: retryable
					? retryReasonFor(response.status, errorPayload)
					: undefined,
			};
			attempts.push(attemptRecord);
			if (retryable && attempt < MAX_BREVO_ATTEMPTS) {
				const reason = attemptRecord.retryReason ?? 'server';
				retryReasons.push(reason);
				await sleep(jitterDelay());
				continue;
			}

			return {
				ok: false,
				status: response.status,
				error: errorPayload,
				attempts,
				retries: attempts.length - 1,
				retryReasons,
			};
		} catch (error) {
			clearTimeout(timeoutId);
			const durationMs = Date.now() - attemptStart;
			const retryable = shouldRetry(undefined, error);
			const attemptRecord: DeliveryAttempt = {
				attempt,
				durationMs,
				status: undefined,
				aborted: isAbortError(error),
				errorSummary: summarizeError(error),
				retryReason: retryable ? retryReasonFor(undefined, error) : undefined,
			};
			attempts.push(attemptRecord);
			if (retryable && attempt < MAX_BREVO_ATTEMPTS) {
				if (attemptRecord.retryReason) {
					retryReasons.push(attemptRecord.retryReason);
				}
				await sleep(jitterDelay());
				continue;
			}
			return {
				ok: false,
				status: 500,
				error,
				attempts,
				retries: attempts.length - 1,
				retryReasons,
			};
		}
	}

	return {
		ok: false,
		status: 500,
		error: new Error('Brevo delivery exhausted retries'),
		attempts,
		retries: attempts.length - 1,
		retryReasons,
	};
}
