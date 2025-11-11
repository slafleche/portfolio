import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type EnvSnapshot = {
	brevoApiKey: boolean;
	mailFrom: boolean;
	mailTo: boolean;
};

type BrevoProbe = {
	attempted: boolean;
	reachable: boolean | null;
	status?: number;
	error?: string;
	durationMs?: number;
};

type HealthPayload = {
	ok: boolean;
	timestamp: string;
	env: EnvSnapshot;
	brevo: BrevoProbe;
};

const BREVO_ACCOUNT_ENDPOINT = 'https://api.brevo.com/v3/account';
const HEALTH_TIMEOUT_MS = Number(process.env.BREVO_HEALTH_TIMEOUT_MS ?? 4000);

const summarizeError = (error: unknown) => {
	if (!error) return undefined;
	if (error instanceof Error) {
		return error.message.slice(0, 160);
	}
	if (typeof error === 'string') {
		return error.slice(0, 160);
	}
	try {
		return JSON.stringify(error).slice(0, 160);
	} catch {
		return undefined;
	}
};

const snapshotEnv = (): EnvSnapshot => ({
	brevoApiKey: Boolean(process.env.BREVO_API_KEY),
	mailFrom: Boolean(process.env.MAIL_FROM),
	mailTo: Boolean(process.env.MAIL_TO),
});

const buildResponse = (payload: HealthPayload) => {
	return NextResponse.json(payload, {
		status: payload.ok ? 200 : 503,
		headers: {
			'cache-control': 'no-store, max-age=0',
		},
	});
};

const probeBrevoAccount = async (
	apiKey: string,
): Promise<BrevoProbe> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(),
		HEALTH_TIMEOUT_MS,
	);
	const startedAt = Date.now();
	try {
		const response = await fetch(BREVO_ACCOUNT_ENDPOINT, {
			method: 'GET',
			headers: {
				'api-key': apiKey,
				accept: 'application/json',
			},
			signal: controller.signal,
		});
		const durationMs = Date.now() - startedAt;
		clearTimeout(timeoutId);
		return {
			attempted: true,
			reachable: response.ok,
			status: response.status,
			durationMs,
			error: response.ok
				? undefined
				: `Brevo responded with ${response.status}`,
		};
	} catch (error) {
		clearTimeout(timeoutId);
		return {
			attempted: true,
			reachable: false,
			error: summarizeError(error),
			durationMs: Date.now() - startedAt,
		};
	}
};

export async function GET() {
	const env = snapshotEnv();
	const timestamp = new Date().toISOString();
	const brevoProbe: BrevoProbe = {
		attempted: false,
		reachable: null,
	};

	if (!env.brevoApiKey || !env.mailFrom || !env.mailTo) {
		return buildResponse({
			ok: false,
			timestamp,
			env,
			brevo: brevoProbe,
		});
	}

	const probe = await probeBrevoAccount(
		process.env.BREVO_API_KEY as string,
	);
	brevoProbe.attempted = true;
	brevoProbe.reachable = probe.reachable;
	brevoProbe.status = probe.status;
	brevoProbe.error = probe.error;
	brevoProbe.durationMs = probe.durationMs;

	return buildResponse({
		ok: Boolean(probe.reachable),
		timestamp,
		env,
		brevo: brevoProbe,
	});
}
