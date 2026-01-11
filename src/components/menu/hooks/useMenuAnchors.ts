import { useMemo } from 'react';

export type AnchorEntry = {
  hrefKey: string;
};

export const BASE_ANCHORS: readonly AnchorEntry[] = [
  {
    hrefKey: 'approach',
  },
  {
    hrefKey: 'about',
  },
  {
    hrefKey: 'case_study',
  },
  {
    hrefKey: 'projects',
  },
  {
    hrefKey: 'contact',
  },
];

export function useMenuAnchors(sectionIds: readonly string[]) {
  const sectionIdList = useMemo(
    () => Array.from(sectionIds),
    [
      sectionIds,
    ],
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
