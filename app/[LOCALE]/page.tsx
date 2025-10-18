import clsx from 'clsx';
import { Fragment } from 'react';
import { SkipNavContent } from '@reach/skip-nav';
import ReactMarkdown from 'react-markdown';
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
		type: 'left',
		titleKey: 'split-dev_title',
		contentKey: 'split-dev_content',
	},
	{
		type: 'right',
		titleKey: 'split-design_title',
		contentKey: 'split-design_content',
	},
] as const satisfies readonly {
	type: 'left' | 'right';
	titleKey: MessageKey;
	contentKey: MessageKey;
}[];

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
] as const satisfies readonly {
	idKey: MessageKey;
	contentKey: MessageKey;
}[];

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

	const heroCopy = {
		videoTitle: t(HERO_KEYS.videoTitle),
		videoLabel: t(HERO_KEYS.videoLabel),
		headingFirstLine: t(HERO_KEYS.headingFirstLine),
		headingLastLine: t(HERO_KEYS.headingLastLine),
		subtitle: t(HERO_KEYS.subtitle),
	};

	return (
		<>
			<SkipNavContent id="body">
				<Hero copy={heroCopy} />
				<div id="body">
					<section
						className={clsx(card.container, layoutStyles.content)}
					>
						{CARD_CONFIGS.map((item, index) => (
							<Fragment key={item.titleKey}>
								<Card title={t(item.titleKey)} type={item.type}>
									<ReactMarkdown>{t(item.contentKey)}</ReactMarkdown>
								</Card>
								{index === 0 ? (
									<Keystone
										name={KEYSTONE_KEYS.name}
										className={card.image}
										title={t(KEYSTONE_KEYS.titleKey)}
										alt={t(KEYSTONE_KEYS.altKey)}
									/>
								) : null}
							</Fragment>
						))}
					</section>

					{SECTION_CONFIGS.map((section) => {
						const id = t(section.idKey);
						return (
							<section key={section.idKey} id={id}>
								<div className={s.userContent}>
									<ReactMarkdown>
										{t(section.contentKey)}
									</ReactMarkdown>
								</div>
							</section>
						);
					})}
				</div>
			</SkipNavContent>
		</>
	);
}
