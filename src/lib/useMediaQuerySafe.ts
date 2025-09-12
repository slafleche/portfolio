// useMediaQuerySafe.ts
import { useEffect, useState } from 'react';

export function useMediaQuerySafe(query: string) {
	const [matches, setMatches] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const mql = window.matchMedia(query);
		const onChange = () => setMatches(mql.matches);
		setMatches(mql.matches);
		mql.addEventListener?.('change', onChange);
		return () => mql.removeEventListener?.('change', onChange);
	}, [query]);

	return matches; // undefined on server, boolean on client
}
