import { ReactNode, use } from "react";
import { resolveLocale } from "../src/lib/locale";
import LocaleProvider from "@/lib/LocaleProvider"; 

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ LOCALE?: string }>;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  const { LOCALE } = use(params);
  const locale = resolveLocale(LOCALE);

  return (
    <html lang={locale}>
      <head />
      <body>
        <LocaleProvider locale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
