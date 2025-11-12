import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

type SubmissionMetric = {
	code: FormServerResponseCode;
	durationMs: number;
	submissionId: string;
	ipHash: string | null;
	status?: number;
	extra?: Record<string, unknown>;
};

export type BrevoAttemptMetric = {
	attempt: number;
	durationMs: number;
	status?: number;
	aborted?: boolean;
};

export type RetryReason = 'timeout' | 'server' | 'network';

const submissionCounts = new Map<FormServerResponseCode, number>();

type BrevoLatencyBucket = {
	readonly upperBound: number;
	count: number;
};

const BREVO_LATENCY_BUCKETS: BrevoLatencyBucket[] = [
	{ upperBound: 100, count: 0 },
	{ upperBound: 250, count: 0 },
	{ upperBound: 500, count: 0 },
	{ upperBound: 1000, count: 0 },
	{ upperBound: 2000, count: 0 },
	{ upperBound: 5000, count: 0 },
	{ upperBound: Number.POSITIVE_INFINITY, count: 0 },
];

const retryCounts: Record<RetryReason, number> = {
	timeout: 0,
	server: 0,
	network: 0,
};

const incrementSubmissionCount = (code: FormServerResponseCode) => {
	submissionCounts.set(code, (submissionCounts.get(code) ?? 0) + 1);
};

const bucketLatency = (ms: number) => {
	for (const bucket of BREVO_LATENCY_BUCKETS) {
		if (ms <= bucket.upperBound) {
			bucket.count += 1;
			return;
		}
	}
};

export const recordSubmissionMetric = (metric: SubmissionMetric) => {
	incrementSubmissionCount(metric.code);
	console.info('[contact][submission]', {
		submissionId: metric.submissionId,
		ipHash: metric.ipHash,
		code: metric.code,
		durationMs: metric.durationMs,
		status: metric.status,
		...metric.extra,
	});
};

export const recordBrevoAttempts = (attempts: BrevoAttemptMetric[]) => {
	for (const attempt of attempts) {
		bucketLatency(attempt.durationMs);
	}
};

export const recordRetryMetric = (reason: RetryReason) => {
	retryCounts[reason] += 1;
};

export const snapshotContactMetrics = () => {
	return {
		submissionCounts: Object.fromEntries(submissionCounts.entries()),
		brevoLatencyBuckets: BREVO_LATENCY_BUCKETS.map((bucket) => ({
			upperBound: bucket.upperBound,
			count: bucket.count,
		})),
		retryCounts: { ...retryCounts },
	};
};

export const maybeTriggerContactAlert = (
	code: FormServerResponseCode,
	context: Record<string, unknown>,
) => {
	if (code !== 'service_unavailable' && code !== 'generic_error') {
		return;
	}
	console.warn('[contact][alert]', {
		code,
		context,
		snapshot: snapshotContactMetrics(),
	});
};
