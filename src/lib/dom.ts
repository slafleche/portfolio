import { useId } from 'react';

/**
 * UseSafeId Wraps React's useId and removes ":" for safer usage in CSS/DOM.
 * Optionally prefixes the ID with a string.
 */
export function useSafeId(prefix?: string): string {
	const id = useId().replace(/:/g, '');
	return prefix ? `${prefix}-${id}` : id;
}
