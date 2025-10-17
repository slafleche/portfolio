'use client';
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/userContent.css';
import * as layoutStyles from '@/styles/layout.css';
import ReactMarkdown from 'react-markdown';
import Card from '../../src/components/Card';
import * as card from '@/styles/components/card.css';
import Hero from '../../src/components/Hero';
import clsx from 'clsx';
import ImageByName from '../../src/components/ImageByName';
import { SkipNavContent } from '@reach/skip-nav';

export default function HomePage() {
	const t = useT();

	return (
		<>
			<SkipNavContent id="body">
				<Hero />
				<div id="body">
					<section
						className={clsx(card.container, layoutStyles.content)}
					>
						<Card title={t('split-dev_title')} data-side="left">
							<ReactMarkdown>{t('split-dev_content')}</ReactMarkdown>
						</Card>

						<ImageByName
							name="portrait"
							className={card.image}
							title={t('image_portrait-title')}
							alt={t('image_portrait-alt')}
						/>

						<Card
							title={t('split-design_title')}
							gradient="b"
							data-side="right"
						>
							<ReactMarkdown>
								{t('split-design_content')}
							</ReactMarkdown>
						</Card>
					</section>

					<section id={t('about-href')}>
						<div className={s.userContent}>
							<ReactMarkdown>{t('about-content')}</ReactMarkdown>
						</div>
					</section>

					<section id={t('approach-href')}>
						<div className={s.userContent}>
							<ReactMarkdown>{t('approach-content')}</ReactMarkdown>
						</div>
					</section>

					<section id={t('case_study-href')}>
						<div className={s.userContent}>
							<ReactMarkdown>{t('case_study-content')}</ReactMarkdown>
						</div>
					</section>

					<section id={t('projects-href')}>
						<div className={s.userContent}>
							<ReactMarkdown>{t('projects-content')}</ReactMarkdown>
						</div>
					</section>
				</div>
			</SkipNavContent>
		</>
	);
}
