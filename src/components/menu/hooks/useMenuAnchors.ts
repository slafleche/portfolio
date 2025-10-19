import { useMemo } from 'react';
import { BASE_ANCHORS, type AnchorEntry } from '../menuUtils';

export function useMenuAnchors(sectionIds: readonly string[]) {
	const anchors = useMemo<readonly AnchorEntry[]>(
		() => BASE_ANCHORS,
		[],
	);
	const anchorCount = anchors.length + 1; // +1 for the logo entry
	const sectionIdList = useMemo(() => {
		return Array.from(sectionIds);
	}, [
		sectionIds,
	]);

	return {
		anchors,
		anchorCount,
		sectionIds: sectionIdList,
	};
}
