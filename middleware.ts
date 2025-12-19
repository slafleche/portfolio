import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  pickLocaleFromAcceptLanguage,
} from '@/lib/locales/locale';
import { AVAILABLE_LOCALES, type Locale } from '@/data/locales';
import { localizedToCanonicalSlugs } from '@/lib/routes/localeSlugs';
import * as runtimeEnv from '@/lib/runtimeEnv';
import { isDev, isRelease, isStaging } from '@/config/envPrimitives';

const LOCALES = new Set<Locale>(
  AVAILABLE_LOCALES as readonly Locale[],
);

function pickPreferredLocale(request: NextRequest): string {
  const headerLocale = pickLocaleFromAcceptLanguage(
    request.headers.get('accept-language'),
  );
  if (headerLocale && LOCALES.has(headerLocale)) {
    return headerLocale;
  }
  return DEFAULT_LOCALE;
}

function isLocale(segment: string): segment is Locale {
  return LOCALES.has(segment as Locale);
}

function isGateEnabled(): boolean {
  const {
    user,
    password,
    isPrivateOnStaging = false,
    isPrivateOnRelease = false,
    isPrivateOnLocal = false,
  } = runtimeEnv.getPrivateLaunchEnvConfig();

  if (!user || !password) {
    return false;
  }

  if (isDev()) {
    return isPrivateOnLocal;
  }

  if (isStaging()) {
    return isPrivateOnStaging;
  }

  if (isRelease()) {
    return isPrivateOnRelease;
  }

  return false;
}

function parseBasicAuth(
  header: string | null,
): { user: string; password: string } | null {
  if (!header) return null;
  const [
    scheme,
    credentials,
  ] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'basic' || !credentials) {
    return null;
  }

  let decoded: string;
  try {
    if (typeof globalThis.atob === 'function') {
      decoded = globalThis.atob(credentials);
    } else if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(credentials, 'base64').toString('utf8');
    } else {
      return null;
    }
  } catch {
    return null;
  }

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) return null;

  const user = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);
  if (!user || !password) return null;

  return { user, password };
}

function requireBasicAuth(request: NextRequest): NextResponse | null {
  if (!isGateEnabled()) {
    return null;
  }

  const { user: expectedUser, password: expectedPassword } =
    runtimeEnv.getPrivateLaunchEnvConfig();

  if (!expectedUser || !expectedPassword) {
    return null;
  }

  if (expectedPassword.length < 60) {
    console.error(
      '[privateLaunch] PRIVATE_LAUNCH_PASSWORD must be at least 60 characters; refusing to accept a shorter password.',
    );
    return new NextResponse('Server misconfigured', {
      status: 500,
    });
  }

  const parsed = parseBasicAuth(request.headers.get('authorization'));
  if (
    !parsed ||
    parsed.user !== expectedUser ||
    parsed.password !== expectedPassword
  ) {
    const response = new NextResponse('Authentication required', {
      status: 401,
    });
    response.headers.set(
      'WWW-Authenticate',
      'Basic realm="Private portfolio"',
    );
    return response;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const authResponse = requireBasicAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    const locale = pickPreferredLocale(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;
    return NextResponse.redirect(redirectUrl);
  }

  const seg = pathname.split('/')[1] || '';
  const requestHeaders = new Headers(request.headers);

  if (isLocale(seg)) {
    requestHeaders.set('x-locale', seg);
    const locale: Locale = seg;
    const segments = pathname.split('/').filter(Boolean).slice(1);
    const [
      firstSegment,
      ...restSegments
    ] = segments;

    if (isRelease() && firstSegment === 'debug') {
      return new NextResponse(null, { status: 404 });
    }

    const localizedMaps = localizedToCanonicalSlugs[locale];
    if (localizedMaps && firstSegment) {
      const canonicalFirst = localizedMaps[firstSegment];
      if (canonicalFirst) {
        const rewriteUrl = request.nextUrl.clone();
        const canonicalSegments = [
          canonicalFirst,
          ...restSegments.filter(Boolean),
        ];
        const canonicalPath = canonicalSegments.length
          ? `/${canonicalSegments.join('/')}`
          : '';
        rewriteUrl.pathname = `/${locale}${canonicalPath}`;
        return NextResponse.rewrite(rewriteUrl);
      }
    }
  } else {
    requestHeaders.delete('x-locale');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
// Optionally, scope middleware if needed with a matcher export
// export const config = { matcher: ['/((?!_next|api|.*\..*).*)'] };
