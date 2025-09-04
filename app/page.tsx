import { resolveLocale } from "@/lib/locale";

export default function RootPage() {
  // Get system or cookie-preferred language
  return (
    <html lang={locale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=/${locale}`} />
      </head>
      <body>
        <p>{t("redirecting")}</p>
      </body>
    </html>
  );
}
