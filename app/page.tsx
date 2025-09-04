import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AVAILABLE_LOCALES, type Locale } from "@/data/locales";

function pickLocaleFromAcceptLanguage(accept: string | null): Locale | null {
  if (!accept) return null;
  // e.g. "fr-CA,fr;q=0.9,en;q=0.8"
  const langs = accept
    .split(",")
    .map((part) => part.split(";")[0].trim()) // strip quality
    .filter(Boolean);

  for (const tag of langs) {
    const base = tag.slice(0, 2); // "fr-CA" -> "fr"
    if ((AVAILABLE_LOCALES as readonly string[]).includes(base)) {
      return base as Locale;
    }
  }
  return null;
}

export default async function RootPage() {
  const accept = (await headers()).get("accept-language");
  const headerLocale = pickLocaleFromAcceptLanguage(accept);
  const locale: Locale = headerLocale ?? "en"; // fallback stays en

  console.log("accept-language:", (await headers()).get("accept-language"));

  redirect(`/${locale}`);
}
