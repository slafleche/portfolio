import Link from "next/link";
import { TRANSLATIONS, AVAILABLE_LOCALES, Locale } from "../src/data/locales";

interface HomePageProps {
  params: { LOCALE: string };
}

export default function HomePage({ params }: HomePageProps) {
  const defaultLocale: Locale = "en";

  const locale: Locale = AVAILABLE_LOCALES.includes(params.LOCALE as Locale)
    ? (params.LOCALE as Locale)
    : defaultLocale;

  const t = (key: string) => TRANSLATIONS[locale]?.[key] ?? key;

  const otherLocales = AVAILABLE_LOCALES.filter((l) => l !== locale);

  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>

      {otherLocales.map((loc) => (
        <Link key={loc} href={`/${loc}`}>
          {TRANSLATIONS[loc]?.title ?? loc}
        </Link>
      ))}
    </>
  );
}
