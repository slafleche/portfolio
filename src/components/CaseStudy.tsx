"use client";

import { useMemo } from 'react';
import type { CaseStudyListItem } from '@/lib/locales/sections/caseStudies.locale';
import { Accordion } from '@/components/Accordion';
import { createDomId } from '@/lib/dom';
import { Markdown } from '@/components/Markdown';

type CaseStudyProps = {
	id?: string;
	caseStudies: CaseStudyListItem[];
};

export default function CaseStudy({ id, caseStudies }: CaseStudyProps) {
	const baseId = useMemo(
		() => id ?? createDomId('case-study'),
		[id],
	);
	return (
		<Accordion
			items={caseStudies.map((study, index) => ({
				heading: study.title,
				subHeading: study.subTitle,
				content: (
					<Markdown source={study.content} />
				),
				id: `${baseId}-${index}`,
			}))}
		/>
	);
}
