import type { MarkdownContent } from '../markdownTypes';
import type { MarkdownMessageKey } from '../generated/markdown.gen';

const MARKDOWN_REF_PREFIX = '__MARKDOWN_REF__:';

type MarkdownPlaceholder<Key extends MarkdownMessageKey> = MarkdownContent & {
	readonly __markdownRefKey: Key;
};

const createPlaceholder = <Key extends MarkdownMessageKey>(
	key: Key,
): MarkdownPlaceholder<Key> =>
	`${MARKDOWN_REF_PREFIX}${key}` as MarkdownPlaceholder<Key>;

export const markdownRef = <Key extends MarkdownMessageKey>(
	key: Key,
): Record<Key, MarkdownPlaceholder<Key>> =>
	({
		[key]: createPlaceholder(key),
	} as Record<Key, MarkdownPlaceholder<Key>>);

export const markdownRefs = <Keys extends readonly MarkdownMessageKey[]>(
	...keys: Keys
): { [K in Keys[number]]: MarkdownPlaceholder<K> } => {
	const entries: Partial<
		{ [K in Keys[number]]: MarkdownPlaceholder<K> }
	> = {};
	for (const key of keys) {
		entries[key as Keys[number]] = createPlaceholder(key);
	}
	return entries as {
		[K in Keys[number]]: MarkdownPlaceholder<K>;
	};
};

export function resolveMarkdownPlaceholders<
	T extends Record<string, unknown>,
>(
	data: T,
	markdown: Partial<Record<MarkdownMessageKey, MarkdownContent>>,
	locale: string,
): T {
	const resolved = { ...data } as Record<string, unknown>;
	for (const [key, value] of Object.entries(resolved)) {
		if (typeof value !== 'string') continue;
		if (!value.startsWith(MARKDOWN_REF_PREFIX)) continue;

		const markdownKey = value.slice(
			MARKDOWN_REF_PREFIX.length,
		) as MarkdownMessageKey;
		const content = markdown[markdownKey];

		if (content === undefined) {
			throw new Error(
				`[locales] Missing markdown content for "${markdownKey}" (locale "${locale}").`,
			);
		}

		resolved[key] = content;
	}

	return resolved as T;
}
