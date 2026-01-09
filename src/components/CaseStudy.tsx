import { clsx } from 'clsx';

import { Markdown } from '@/components/Markdown';
import { createDomId } from '@/lib/dom';
import * as s from '@/styles/components/accordion.css';
import * as layoutStyles from '@/styles/layout.css';

import Content from './responsive/Content';
import WordMarkInTitle from './WordmarkInTitle';
import VNWordmark from './wordmarks/VNWordmark';

type CaseStudyProps = {
  id?: string;
  intro?: string;
  title: string;
  wordMarkClassName?: string;
  className?: string;
  children: React.ReactNode;
};

export default function CaseStudy({
  id,
  intro,
  title,
  wordMarkClassName,
  className,
  children,
}: CaseStudyProps) {
  const baseId = id ?? createDomId('case-study');
  const hasIntro = typeof intro === 'string' && intro.trim() !== '';
  return (
    <section
      id={baseId}
      className={clsx(s.root, layoutStyles.sectionSpacing, className)}
    >
      <Content tag={'div'}>
        <WordMarkInTitle
          WordMark={VNWordmark}
          ignoreDataUI={true}
          textTemplate={title}
          textClassName={wordMarkClassName}
          depth={2}
        />
        {hasIntro ? (
          <Markdown
            className={s.intro}
            source={intro}
            asUi={{
              headings: true,
              paragraphs: true,
            }}
          />
        ) : null}
      </Content>

      <Content
        tag={'div'}
        queryDataAttributes={{
          compact: 'no-padding',
        }}
      >
        {children}
      </Content>
    </section>
  );
}
