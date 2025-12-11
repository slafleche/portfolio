import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { GET as healthRoute } from '../../app/api/contact/health/route';

const ORIGINAL_ENV = { ...process.env };

const setEnv = () => {
  process.env = {
    ...ORIGINAL_ENV,
    BREVO_API_KEY: 'test-key',
    MAIL_FROM: 'example@example.com',
    MAIL_TO: 'example@example.com',
    BREVO_HEALTH_TIMEOUT_MS: '50',
  } as NodeJS.ProcessEnv;
};

describe('GET /api/contact/health', () => {
  beforeEach(() => {
    setEnv();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('reports missing configuration without hitting Brevo', async () => {
    process.env.BREVO_API_KEY = '';
    delete process.env.MAIL_FROM;
    const response = await healthRoute();
    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.env).toEqual({
      brevoApiKey: false,
      mailFrom: false,
      mailTo: true,
    });
    expect(json.brevo.attempted).toBe(false);
  });

  it('returns ok when Brevo account endpoint responds 200', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    const response = await healthRoute();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.brevo.reachable).toBe(true);
    expect(json.brevo.status).toBe(200);
    expect(json.brevo.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('marks Brevo unreachable when account endpoint responds non-200', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);
    const response = await healthRoute();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.brevo.attempted).toBe(true);
    expect(json.brevo.reachable).toBe(false);
    expect(json.brevo.status).toBe(500);
    expect(json.brevo.error).toContain('500');
    expect(json.brevo.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('fails health when Brevo probe throws', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);
    const response = await healthRoute();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.brevo.attempted).toBe(true);
    expect(json.brevo.reachable).toBe(false);
    expect(json.brevo.error).toContain('network down');
    expect(json.brevo.durationMs).toBeGreaterThanOrEqual(0);
  });
});
