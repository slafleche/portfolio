// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { use } from "react";
import { AVAILABLE_LOCALES, type Locale } from "@/data/locales";
import { resolveLocale } from "@/lib/locale";
import LocaleProvider from "@/lib/LocaleProvider";

type Params = { LOCALE?: string };

export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params> | Params;
}) {
  const resolved =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<Params>)
      : (params as Params);

  // Prefer the helper; it already validates + falls back
  const locale: Locale = resolveLocale(resolved?.LOCALE);

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
