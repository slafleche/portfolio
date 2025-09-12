'use client';

import {
	createContext,
	useContext,
	useMemo,
	type PropsWithChildren,
} from 'react';
import { IMode, useMedia } from '../../styles/responsive';

export type ResponsiveState = {
	fullSize?: boolean;
	compact?: boolean;
	compressed?: boolean;
	mode?: IMode;
};

const defaultState: ResponsiveState = {
	fullSize: undefined,
	compact: undefined,
	compressed: undefined,
	mode: undefined,
};

const ResponsiveContext = createContext<ResponsiveState>(defaultState);

export function ResponsiveProvider({ children }: PropsWithChildren) {
	const { fullSize, compact, compressed } = useMedia();

	// readable, Prettier-friendly (no nested ternaries)
	let mode: IMode | undefined;
	if (fullSize) {
		mode = 'fullSize';
	} else if (compact) {
		mode = 'compact';
	} else if (compressed) {
		mode = 'compressed';
	} else {
		mode = undefined;
	}

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
	return useContext(ResponsiveContext);
}
