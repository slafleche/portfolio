import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AVAILABLE_LOCALES } from '@/data/locales';

const LOCALES = new Set(AVAILABLE_LOCALES as readonly string[]);

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const seg = pathname.split('/')[1] || '';
	const response = NextResponse.next();

	if (LOCALES.has(seg)) {
		// Persist the locale for server-rendered <html lang>
		response.cookies.set('locale', seg, { path: '/' });
	}

	return response;
}

// Optionally, scope middleware if needed with a matcher export
// export const config = { matcher: ['/((?!_next|api|.*\..*).*)'] };
