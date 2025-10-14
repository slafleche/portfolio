'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	getBrowserLocale,
	DEFAULT_LOCALE,
} from '@/lib/locales/locale';
import type { Locale } from '@/data/locales';

/** Runs only on `/`. Uses browser UI first, then server fallback. */
export default function LocaleAutoRedirect({
	fallback,
}: {
	fallback: Locale;
}) {
	const router = useRouter();
	useEffect(() => {
		const ui = getBrowserLocale(); // Current browser UI on root only
		const target: Locale = ui ?? fallback ?? DEFAULT_LOCALE;
		router.replace(`/${target}`);
	}, [router, fallback]);

	return null;
}
