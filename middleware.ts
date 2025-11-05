import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AVAILABLE_LOCALES } from '@/data/locales';
import {
	DEFAULT_LOCALE,
	pickLocaleFromAcceptLanguage,
} from '@/lib/locales/locale';
import { localizedToCanonicalSlugs } from '@/lib/routes/localeSlugs';

const LOCALES = new Set(AVAILABLE_LOCALES as readonly string[]);

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
		const segments = pathname.split('/').filter(Boolean).slice(1);
		const [firstSegment, ...restSegments] = segments;

		if (
			process.env.NODE_ENV === 'production' &&
			firstSegment === 'debug'
		) {
			return new NextResponse(null, { status: 404 });
		}

		const localizedMaps = localizedToCanonicalSlugs[locale];
		if (localizedMaps && firstSegment) {
			const canonicalFirst = localizedMaps[firstSegment];
			if (canonicalFirst) {
				const rewriteUrl = request.nextUrl.clone();
				const canonicalSegments = [canonicalFirst, ...restSegments.filter(Boolean)];
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
