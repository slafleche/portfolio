import { useMemo } from 'react';
import { TRANSLATIONS } from '@/data/locales';
import type { Locale } from '@/data/locales';
import { BASE_ANCHORS, type AnchorEntry } from '../menuUtils';

export function useMenuAnchors(locale: Locale) {
	const anchors = useMemo<readonly AnchorEntry[]>(
		() => BASE_ANCHORS,
		[],
	);
	const anchorCount = anchors.length + 1; // +1 for the logo entry
	const sectionIds = useMemo(() => {
		const messages = TRANSLATIONS[locale];
		return anchors.map(({ hrefKey }) => messages[hrefKey]);
	}, [
		anchors,
		locale,
	]);

	return {
		anchors,
		anchorCount,
		sectionIds,
	};
}
