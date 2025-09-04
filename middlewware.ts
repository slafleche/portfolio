// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES } from "./src/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE = "en";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, API routes, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if path already has a locale prefix
  const hasLocalePrefix = LOCALES.some((locale) =>
    pathname.startsWith(`/${locale}`),
  );

  if (!hasLocalePrefix) {
    // Detect preferred language from Accept-Language header
    const acceptLang = req.headers.get("accept-language");
    const preferred = acceptLang?.split(",")[0].split("-")[0] ?? DEFAULT_LOCALE;

    const locale = LOCALES.includes(preferred) ? preferred : DEFAULT_LOCALE;

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
