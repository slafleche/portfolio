import clsx from 'clsx';
import { Fragment } from 'react';
import { SkipNavContent } from '@reach/skip-nav';
import {
	resolveLocale,
	DEFAULT_LOCALE,
	loadMessages,
} from '@/lib/locales/locale';
import * as s from '@/styles/components/userContent.css';
import * as layoutStyles from '@/styles/layout.css';
import * as card from '@/styles/components/card.css';
import Card from '@/components/Card';
import Hero from '@/components/Hero';
import Keystone from '@/components/Keystone';
import type { Messages } from '@/data/locales';
import { getHtmlMessage } from '@/lib/locales/html';

type MessageKey = keyof Messages;

const HERO_KEYS = {
	videoTitle: 'hero-title',
	videoLabel: 'hero-alt',
	headingFirstLine: 'hero-title_a',
	headingLastLine: 'hero-title_b',
	subtitle: 'hero-subtitle',
} as const satisfies Record<string, MessageKey>;

const CARD_CONFIGS = [
	{
		type: 'left' as const,
		titleKey: 'split-dev_title',
		contentKey: 'split-dev_content',
	},
	{
		type: 'right' as const,
		titleKey: 'split-design_title',
		contentKey: 'split-design_content',
	},
];

const SECTION_CONFIGS = [
	{
		idKey: 'about-href',
		contentKey: 'about-content',
	},
	{
		idKey: 'approach-href',
		contentKey: 'approach-content',
	},
	{
		idKey: 'case_study-href',
		contentKey: 'case_study-content',
	},
	{
		idKey: 'projects-href',
		contentKey: 'projects-content',
	},
];

const KEYSTONE_KEYS = {
	name: 'portrait',
	titleKey: 'image_portrait-title',
	altKey: 'image_portrait-alt',
} as const satisfies {
	name: string;
	titleKey: MessageKey;
	altKey: MessageKey;
};

type PageParams = {
	LOCALE: string;
};

export default async function HomePage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { LOCALE } = await params;
	const locale = resolveLocale(LOCALE);
	const messages = await loadMessages(locale);
	const fallbackMessages =
		locale === DEFAULT_LOCALE
			? messages
			: await loadMessages(DEFAULT_LOCALE);

	const t = <K extends MessageKey>(key: K): string =>
		messages[key] ?? fallbackMessages[key] ?? key;

	const html = <K extends MessageKey>(key: K): string =>
		getHtmlMessage(locale, key as string, t(key));

	const hero = {
		videoTitle: t(HERO_KEYS.videoTitle),
		videoLabel: t(HERO_KEYS.videoLabel),
		headingFirstLine: t(HERO_KEYS.headingFirstLine),
		headingLastLine: t(HERO_KEYS.headingLastLine),
		subtitleHtml: html(HERO_KEYS.subtitle),
	};

	const cards = CARD_CONFIGS.map((config) => ({
		type: config.type,
		title: t(config.titleKey),
		html: html(config.contentKey),
	}));

	const sections = SECTION_CONFIGS.map((config) => ({
		id: t(config.idKey),
		html: html(config.contentKey),
	}));

	const keystone = {
		name: KEYSTONE_KEYS.name,
		title: t(KEYSTONE_KEYS.titleKey),
		alt: t(KEYSTONE_KEYS.altKey),
	};

	return (
		<>
			<SkipNavContent id="body">
				<Hero copy={hero} />
				<div id="body">
					<section
						className={clsx(card.container, layoutStyles.content)}
					>
						{cards.map((item, index) => (
							<Fragment key={`${item.type}-${index}`}>
								<Card title={item.title} type={item.type}>
									<div
										dangerouslySetInnerHTML={{
											__html: item.html,
										}}
									/>
								</Card>
								{index === 0 ? (
									<Keystone
										name={keystone.name}
										className={card.image}
										title={keystone.title}
										alt={keystone.alt}
									/>
								) : null}
							</Fragment>
						))}
					</section>

					{sections.map((section) => (
						<section key={section.id} id={section.id}>
							<div
								className={s.userContent}
								dangerouslySetInnerHTML={{
									__html: section.html,
								}}
							/>
						</section>
					))}
				</div>
			</SkipNavContent>
		</>
	);
}
