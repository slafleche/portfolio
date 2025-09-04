"use client";
import React, { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/data/locales";

type Ctx = { locale: Locale };

// default context value is "en"
const Ctx = createContext<Ctx>({ locale: "en" });

export function LocaleProvider({
  locale,
  children,
}: React.PropsWithChildren<{ locale: Locale }>) {
  const value = useMemo(() => ({ locale }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx).locale;
}
