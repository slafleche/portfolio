import { useMemo } from 'react';
import type { Messages } from '@/data/locales';
import { BASE_ANCHORS, type AnchorEntry } from '../menuUtils';

export function useMenuAnchors(messages: Messages) {
	const anchors = useMemo<readonly AnchorEntry[]>(
		() => BASE_ANCHORS,
		[],
	);
	const anchorCount = anchors.length + 1; // +1 for the logo entry
	const sectionIds = useMemo(() => {
		return anchors.map(({ hrefKey }) => messages[hrefKey]);
	}, [
		anchors,
		messages,
	]);

	return {
		anchors,
		anchorCount,
		sectionIds,
	};
}
