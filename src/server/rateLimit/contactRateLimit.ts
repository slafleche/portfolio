import { formConfig } from '@/config/formsConfig';

const RATE_LIMIT_WINDOW_MS =
	formConfig.rateLimit.windowSeconds * 1000;
const RATE_LIMIT_MAX_REQUESTS = formConfig.rateLimit.maxRequests;

type Entry = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Entry>();

export type RateLimitResult = {
	allowed: boolean;
	retryAfterSeconds?: number;
};

export function consumeContactRateLimit(
	key: string,
	now: number = Date.now(),
): RateLimitResult {
	if (!key) {
		return { allowed: true };
	}

	const existing = buckets.get(key);
	if (!existing || existing.resetAt <= now) {
		buckets.set(key, {
			count: 1,
			resetAt: now + RATE_LIMIT_WINDOW_MS,
		});
		return { allowed: true };
	}

	if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
		const retryAfterSeconds = Math.max(
			0,
			Math.ceil((existing.resetAt - now) / 1000),
		);
		return {
			allowed: false,
			retryAfterSeconds,
		};
	}

	existing.count += 1;
	return { allowed: true };
}

export function resetContactRateLimit() {
	buckets.clear();
}
