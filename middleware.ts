import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AVAILABLE_LOCALES } from '@/data/locales';
import {
	DEFAULT_LOCALE,
	pickLocaleFromAcceptLanguage,
} from '@/lib/locales/locale';

const LOCALES = new Set(AVAILABLE_LOCALES as readonly string[]);

const SYSTEMS_SLUGS: Record<string, string> = {
	fr: 'systemes',
};

function pickPreferredLocale(request: NextRequest): string {
	const headerLocale = pickLocaleFromAcceptLanguage(
		request.headers.get('accept-language'),
	);
	if (headerLocale && LOCALES.has(headerLocale)) {
		return headerLocale;
	}
	return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === '/' || pathname === '') {
		const locale = pickPreferredLocale(request);
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = `/${locale}`;
		return NextResponse.redirect(redirectUrl);
	}

	const seg = pathname.split('/')[1] || '';
	const requestHeaders = new Headers(request.headers);

	if (LOCALES.has(seg)) {
		requestHeaders.set('x-locale', seg);
		const locale = seg;
		const parts = pathname.split('/');
		const nextSegment = parts[2] ?? '';
		const mappedSlug = SYSTEMS_SLUGS[locale];
		if (mappedSlug && nextSegment === mappedSlug) {
			const rewriteUrl = request.nextUrl.clone();
			rewriteUrl.pathname = `/${locale}/systems`;
			return NextResponse.rewrite(rewriteUrl);
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
