'use client';

import { useMemo } from 'react';
import type { CaseStudyListItem } from '@/lib/locales/sections/caseStudies.locale';
import { Accordion } from '@/components/Accordion';
import { createDomId } from '@/lib/dom';
import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/accordion.css';

type CaseStudyProps = {
  id?: string;
  intro?: string;
  caseStudies: CaseStudyListItem[];
};

export default function CaseStudy({
  id,
  intro,
  caseStudies,
}: CaseStudyProps) {
  const baseId = useMemo(
    () => id ?? createDomId('case-study'),
    [
      id,
    ],
  );

  return (
    <div className={s.root}>
      {intro ? (
        <div className={s.intro}>
          <Markdown source={intro} />
        </div>
      ) : null}
      <Accordion
        items={caseStudies.map((study, index) => ({
          heading: study.title,
          subHeading: study.subTitle,
          content: <Markdown source={study.content} />,
          id: `${baseId}-${index}`,
        }))}
      />
    </div>
  );
}
