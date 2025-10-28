import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import {
	AVAILABLE_LOCALES,
	LOCALE_LOADERS,
	type Locale,
} from '../src/lib/locales/translations';
import {
	MARKDOWN_FILE_MAP,
	MARKDOWN_MESSAGE_KEYS,
	type LocaleMessagesShape,
} from '../src/lib/locales/localeTypes';

type MarkdownKey = (typeof MARKDOWN_MESSAGE_KEYS)[number];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownDir = path.resolve(
	__dirname,
	'../src/lib/locales/translations/markdown',
);

type Issue = {
	locale: Locale;
	key: MarkdownKey;
	reason: string;
};

const issues: Issue[] = [];

const loadLocaleMessages = async (
	locale: Locale,
): Promise<LocaleMessagesShape> => {
	const mod = await LOCALE_LOADERS[locale]();
	return mod.default as LocaleMessagesShape;
};

const readMarkdownFor = async (
	key: MarkdownKey,
	locale: Locale,
): Promise<string | null> => {
	const base = MARKDOWN_FILE_MAP[key];
	const fileName = `${base}.${locale}.md`;
	const filePath = path.join(markdownDir, fileName);
	try {
		const content = await fs.readFile(filePath, 'utf8');
		return content;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			issues.push({
				locale,
				key,
				reason: `missing markdown file (${fileName})`,
			});
			return null;
		}
		throw error;
	}
};

const checkLocale = async (locale: Locale) => {
	const messages = await loadLocaleMessages(locale);

	for (const key of MARKDOWN_MESSAGE_KEYS) {
		const expected = await readMarkdownFor(key, locale);
		if (expected == null) continue;

		const value = messages[key];
		if (typeof value !== 'string') {
			issues.push({
				locale,
				key,
				reason: `expected string value, received ${typeof value}`,
			});
			continue;
		}

		if (value !== expected) {
			issues.push({
				locale,
				key,
				reason: 'message value does not match markdown file contents',
			});
		}
	}
};

const main = async () => {
	process.env.NODE_ENV = 'production';

	await Promise.all(
		AVAILABLE_LOCALES.map((locale) => checkLocale(locale)),
	);

	if (issues.length === 0) {
		console.log('✅ Locale markdown checks passed.');
		return;
	}

	console.error('⚠️  Locale markdown issues found:');
	for (const { locale, key, reason } of issues) {
		console.error(`  - [${locale}] ${key}: ${reason}`);
	}
	process.exit(1);
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
