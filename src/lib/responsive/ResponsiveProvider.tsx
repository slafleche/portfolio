'use client';

import {
	createContext,
	useContext,
	useMemo,
	type PropsWithChildren,
} from 'react';
import { useMedia } from '../../styles/responsive';

type Mode = 'fullSize' | 'compact' | 'compressed' | undefined;

export type ResponsiveState = {
	fullSize?: boolean;
	compact?: boolean;
	compressed?: boolean;
	mode: Mode;
};

const defaultState: ResponsiveState = {
	fullSize: undefined,
	compact: undefined,
	compressed: undefined,
	mode: undefined,
};

const ResponsiveContext = createContext<ResponsiveState>(defaultState);

export function ResponsiveProvider({ children }: PropsWithChildren) {
	const { fullSize, compact, compressed } = useMedia(); // uses our aggregate hook (SSR-safe: undefined on server)

	const mode: Mode = fullSize
		? 'fullSize'
		: compact
			? 'compact'
			: compressed
				? 'compressed'
				: undefined;

	const value = useMemo(
		() => ({ fullSize, compact, compressed, mode }),
		[
fullSize,
compact,
compressed,
mode,
],
	);

	return (
		<ResponsiveContext.Provider value={value}>
			{children}
		</ResponsiveContext.Provider>
	);
}

export function useResponsive() {
	return useContext(ResponsiveContext); // returns defaultState if no provider is mounted
}
