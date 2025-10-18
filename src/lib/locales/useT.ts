'use client';
import { useCallback } from 'react';
import { useLocaleMessages } from './localeContext';
import type { Messages } from '@/data/locales';

export function useT() {
	const messages = useLocaleMessages();
	return useCallback(
		<Key extends keyof Messages>(key: Key) =>
			messages[key] ?? (key as string),
		[messages],
	);
}
