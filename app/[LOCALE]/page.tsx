import { SkipNavContent } from '@/components/SkipNavContent';
import Hero from '@/components/Hero';
import type { PageParams } from '../../src/styles/helpers/types';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildCaseStudiesCopy } from '../../src/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '../../src/lib/locales/sections/projects.locale';
import { buildAboutCopy } from '../../src/lib/locales/sections/about.locale';
import { buildApproachCopy } from '../../src/lib/locales/sections/approach.locale';
import { buildContactCopy } from '../../src/lib/locales/sections/contact.locale';
import Content from '../../src/components/responsive/Content';
import CaseStudy from '@/components/CaseStudy';

export default async function HomePage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { LOCALE } = await params;
	const t = await loadTranslator(LOCALE);

	const hero = buildHeroCopy(t);
	const approach = buildApproachCopy(t);
	const about = buildAboutCopy(t);
	const caseStudies = buildCaseStudiesCopy(t);
	const projects = buildProjectsCopy(t);
	const contact = buildContactCopy(t);

	return (
		<>
			<SkipNavContent id="body">
				<Hero copy={hero} />
				<Content
					id={approach.href}
					title={approach.title}
					markdown={approach.content}
				/>
				<Content
					id={about.href}
					title={about.title}
					markdown={about.content}
				/>
				<Content id={caseStudies.href} title={caseStudies.title}>
					<CaseStudy
						id={caseStudies.href}
						caseStudies={caseStudies.list}
					/>
				</Content>
				<Content title={projects.title} id={projects.href} />
				<Content title={contact.title} id={contact.href} />
			</SkipNavContent>
		</>
	);
}
