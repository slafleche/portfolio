'use client';
import { useT } from '@/lib/locales/useT';
import * as s from '@/styles/components/userContent.css';
import ReactMarkdown from 'react-markdown';
import Card from '../../src/components/Card';
import ImageByName from '../../src/components/ImageByName';

export default function HomePage() {
	const t = useT();

	return (
		<>
			<h1>{t('hero')}</h1>

			<section>
				<Card title={t('split-dev_title')}>
					<ReactMarkdown>{t('split-dev_content')}</ReactMarkdown>
				</Card>

				<ImageByName
					name="portrait"
					title={t('image-portrait-title')}
					alt={t('image-portrait-alt')}
				/>

				<Card title={t('split-design_title')}>
					<ReactMarkdown>{t('split-design_content')}</ReactMarkdown>
				</Card>
			</section>

			<section id={t('href-about')}>
				<div className={s.userContent}>
					<ReactMarkdown>{t('content-about')}</ReactMarkdown>
				</div>
			</section>

			<section id={t('href-philosophy')}>
				<div className={s.userContent}>
					<ReactMarkdown>{t('content-philosophy')}</ReactMarkdown>
				</div>
			</section>

			<section id={t('href-case_study')}>
				<div className={s.userContent}>
					<ReactMarkdown>{t('content-case_study')}</ReactMarkdown>
				</div>
			</section>

			<section id={t('href-projects')}>
				<div className={s.userContent}>
					<ReactMarkdown>{t('content-projects')}</ReactMarkdown>
				</div>
			</section>
		</>
	);
}
