import { useMemo } from 'react';
import { BASE_ANCHORS, type AnchorEntry } from '../menuUtils';

export function useMenuAnchors(sectionIds: readonly string[]) {
	const sectionIdList = useMemo(
		() => Array.from(sectionIds),
		[sectionIds],
	);
	const anchors = useMemo<readonly AnchorEntry[]>(() => {
		if (sectionIdList.length === 0) return BASE_ANCHORS;
		return sectionIdList.map((id) => ({ hrefKey: id }));
	}, [
		sectionIdList,
	]);
	const anchorCount = anchors.length + 1; // +1 for the logo entry

	return {
		anchors,
		anchorCount,
		sectionIds: sectionIdList,
	};
}
