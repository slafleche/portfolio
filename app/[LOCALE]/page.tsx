import { SkipNavContent } from '@reach/skip-nav';
import Hero from '@/components/Hero';
import type { PageParams } from '../../src/styles/helpers/types';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import {
	loadTranslator,
	type Translator,
} from '@/lib/locales/sections/helpers.locale';
import { buildCaseStudiesCopy } from '../../src/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '../../src/lib/locales/sections/projects.locale';
import { buildAboutCopy } from '../../src/lib/locales/sections/about.locale';
import { buildApproachCopy } from '../../src/lib/locales/sections/approach.locale';
import { buildContactCopy } from '../../src/lib/locales/sections/contact.locale';

export default async function HomePage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { LOCALE } = await params;
	const t = await loadTranslator(LOCALE);

	const hero = buildHeroCopy(t);
	const case_studies = buildCaseStudiesCopy(t);
	const about = buildAboutCopy(t);
	const approach = buildApproachCopy(t);
	const contact = buildContactCopy(t);
	const projects = buildProjectsCopy(t);

	return (
		<>
			<SkipNavContent id="body">
				<Hero copy={hero} />
				<div id="body"></div>
			</SkipNavContent>
		</>
	);
}
