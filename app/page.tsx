// This page is only to redirect from `/` to `/{locale}`
import { headers } from 'next/headers';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { redirect } from 'next/navigation';
import {
	DEFAULT_LOCALE,
	pickLocaleFromAcceptLanguage,
} from '@/lib/locales/locale';
import type { Locale } from '@/data/locales';

export default function RootPage() {
	const headerList: ReadonlyHeaders = headers();
	const accept = headerList.get('accept-language');
	const target: Locale =
		pickLocaleFromAcceptLanguage(accept) ?? DEFAULT_LOCALE;

	redirect(`/${target}`);
}
