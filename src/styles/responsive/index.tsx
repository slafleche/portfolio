import type { FC, PropsWithChildren } from 'react';
import mediaQueries from '@/styles/responsive/mediaQueries'; // <-- default export (globalMediaQueries)
import {
	queriesToStrings,
	useMediaQuery,
	useMediaFromMap,
	makeClientFns,
} from './mediaFactory';

// 1) Normalize to plain query strings (e.g., "screen and (min-width: 1280px)")
export const mqStrings = queriesToStrings(mediaQueries);

// 2) Hooks (SSR-safe: undefined on server)
export const useIsFullwidth = () => useMediaQuery(mqStrings.fullSize);
export const useIsCompact = () => useMediaQuery(mqStrings.compact);
export const useIsCompressed = () =>
	useMediaQuery(mqStrings.compressed);

export type IMode = 'fullSize' | 'compact' | 'compressed' | undefined;

// 3) Aggregate when you need multiple flags at once
export const useMedia = () =>
	useMediaFromMap({
		fullSize: mqStrings.fullSize,
		compact: mqStrings.compact,
		compressed: mqStrings.compressed,
	});

// 4) Client-only predicate functions (don’t call during SSR render)
export const {
	fullSize: isFullwidthClient,
	compact: isCompactClient,
	compressed: isCompressedClient,
} = makeClientFns({
	fullSize: mqStrings.fullSize,
	compact: mqStrings.compact,
	compressed: mqStrings.compressed,
});

// 5) “Only” components (top-level so ESLint is happy)
export const FullwidthOnly: FC<PropsWithChildren> = ({
	children,
}) => {
	const match = useIsFullwidth();
	if (match !== true) return null;
	return <>{children}</>;
};

export const CompactOnly: FC<PropsWithChildren> = ({ children }) => {
	const match = useIsCompact();
	if (match !== true) return null;
	return <>{children}</>;
};

export const CompressedOnly: FC<PropsWithChildren> = ({
	children,
}) => {
	const match = useIsCompressed();
	if (match !== true) return null;
	return <>{children}</>;
};

// Optional: re-export primitive if you want it available
export { useMediaQuery } from './mediaFactory';
