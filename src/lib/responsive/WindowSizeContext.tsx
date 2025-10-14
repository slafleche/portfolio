'use client'; // if using Next.js App Router

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';

interface WindowSizeContextType {
	width: number | null;
	height: number | null;
}

const WindowSizeContext = createContext<
	WindowSizeContextType | undefined
>(undefined);

const getViewportSize = (): WindowSizeContextType => {
	if (typeof window === 'undefined') {
		return {
			width: null,
			height: null,
		};
	}
	return {
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight,
	};
};

export function WindowSizeProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [size, setSize] =
		useState<WindowSizeContextType>(getViewportSize);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleResize = () => setSize(getViewportSize);

		handleResize(); // set initial
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<WindowSizeContext.Provider value={size}>
			{children}
		</WindowSizeContext.Provider>
	);
}

export function useWindowSize() {
	const ctx = useContext(WindowSizeContext);
	if (ctx === undefined) {
		throw new Error(
			'useWindowSize must be used within a WindowSizeProvider',
		);
	}
	return ctx;
}
