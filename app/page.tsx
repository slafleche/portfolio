// This page is only to redirect from `/` to `/{locale}`
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
	DEFAULT_LOCALE,
	pickLocaleFromAcceptLanguage,
} from '@/lib/locales/locale';
import type { Locale } from '@/data/locales';

export default async function RootPage() {
	const headerList = await headers();
	const accept = headerList.get('accept-language');
	const target: Locale =
		pickLocaleFromAcceptLanguage(accept) ?? DEFAULT_LOCALE;

	redirect(`/${target}`);
}
