import { ReactNode, use } from "react";
import { resolveLocale } from "@/lib/locales/locale";
import LocaleProvider from "@/lib/locales/LocaleProvider"; 
import Menu from "@/components/Menu";

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
          <Menu locale={locale} />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
