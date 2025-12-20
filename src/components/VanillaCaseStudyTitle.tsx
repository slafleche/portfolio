import type { ComponentPropsWithoutRef } from 'react';
import Heading from './Heading';
import { caseStudyNoLogoText } from '@/styles/components/richMarkdown.css';
import VNWordmark from '@/components/wordmarks/VNWordmark';

type VanillaCaseStudyTitleProps = {
  headingTextNoLogo: string;
  logoBefore?: boolean;
  className?: string;
  svgClassName?: string;
} & Pick<ComponentPropsWithoutRef<'h2'>, 'id'>;

export default function VanillaCaseStudyTitle({
  headingTextNoLogo,
  logoBefore = true,
  className,
  svgClassName,
  id,
}: VanillaCaseStudyTitleProps) {
  const vanilla = 'Vanilla';
  let fullTextLabel = '';
  let content = <></>;

  if (logoBefore) {
    fullTextLabel = `${vanilla} ${headingTextNoLogo}`;
    content = (
      <>
        <VNWordmark className={svgClassName} />
        <span data-position="before" className={caseStudyNoLogoText}>
          {headingTextNoLogo}
        </span>
      </>
    );
  } else {
    fullTextLabel = `${headingTextNoLogo} ${vanilla}`;
    content = (
      <>
        <span data-position="after" className={caseStudyNoLogoText}>
          {headingTextNoLogo}
        </span>
        <VNWordmark className={svgClassName} />
      </>
    );
  }
  return (
    <Heading id={id} title={fullTextLabel} className={className}>
      {content}
    </Heading>
  );
}
