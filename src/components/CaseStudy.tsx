'use client';

import { useMemo } from 'react';
import type { CaseStudyListItem } from '@/lib/locales/sections/caseStudies.locale';
import { Accordion } from '@/components/Accordion';
import { createDomId } from '@/lib/dom';
import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/accordion.css';
import Content from './responsive/Content';
import WordMarkInTitle from './WordmarkInTitle';
import VNWordmark from './wordmarks/VNWordmark';

type CaseStudyProps = {
  id?: string;
  intro?: string;
  title: string;
  caseStudies: CaseStudyListItem[];
  wordMarkClassName?: string;
};

export default function CaseStudy({
  id,
  intro,
  title,
  caseStudies,
  wordMarkClassName,
}: CaseStudyProps) {
  const baseId = useMemo(
    () => id ?? createDomId('case-study'),
    [
      id,
    ],
  );
  const hasIntro = typeof intro === 'string' && intro.trim() !== '';

  return (
    <section>
      <WordMarkInTitle
        WordMark={VNWordmark}
        ignoreDataUI={true}
        textTemplate={title}
        textClassName={wordMarkClassName}
        depth={2}
      />
      {hasIntro ? (
        <Content
          tag="div"
          queryDataAttributes={{
            fullsize: 'no-padding',
          }}
        >
          <div className={s.intro}>
            <Markdown source={intro} />
          </div>
        </Content>
      ) : null}
      <Content
        tag="div"
        queryDataAttributes={{
          compact: 'no-padding',
        }}
        className={s.root}
      >
        <Accordion
          items={caseStudies.map((study, index) => ({
            heading: study.title,
            subHeading: study.subTitle,
            content: <Markdown source={study.content} />,
            id: `${baseId}-${index}`,
            defaultOpen: index === 0,
          }))}
        />
      </Content>
    </section>
  );
}
