import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
	const [prefersReducedMotion, setPrefersReducedMotion] =
		useState(false);

	useEffect(() => {
		if (
			typeof window === 'undefined' ||
			typeof window.matchMedia !== 'function'
		) {
			return;
		}

		const mediaQueryList = window.matchMedia(QUERY);

		const handleChange = (
			event: MediaQueryListEvent | MediaQueryList,
		) => {
			setPrefersReducedMotion(event.matches);
		};

		// Set the initial value synchronously
		handleChange(mediaQueryList);

		if (typeof mediaQueryList.addEventListener === 'function') {
			mediaQueryList.addEventListener('change', handleChange);
			return () =>
				mediaQueryList.removeEventListener('change', handleChange);
		}

		const legacyListener = (event: MediaQueryListEvent) =>
			handleChange(event);
		// Safari < 14 ships `addListener` / `removeListener`. They're deprecated but safe to call.
		const legacyAdd =
			mediaQueryList.addListener?.bind(mediaQueryList);
		const legacyRemove =
			mediaQueryList.removeListener?.bind(mediaQueryList);

		legacyAdd?.(legacyListener);
		return () => legacyRemove?.(legacyListener);
	}, []);

	return prefersReducedMotion;
}
