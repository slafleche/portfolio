import { clsx } from 'clsx';

import * as s from '@/styles/components/tempalates/heroHeadingToSvg.css';

import splitText from '../styles/helpers/textSplit';

interface TitleProps {
  locale: string;
  copy: string;
  className?: string;
  firstLineClassName?: string;
  secondLineClassName?: string;
}

export default function HeroTitleTemplate(props: TitleProps) {
  const titleCopy = splitText(props.copy);

  if (!titleCopy.fullText) {
    return null;
  }

  return (
    <h1
      data-text={titleCopy.fullText}
      data-target="hero-heading"
      data-ui="heading"
      data-locale={props.locale}
      className={clsx(s.heading, props.className)}
    >
      <>
        <span
          className={clsx(s.line, props.firstLineClassName)}
          data-position="first"
        >
          {titleCopy.lastLine}
        </span>
        <br />
        <span
          className={clsx(s.line, props.secondLineClassName)}
          data-position="last"
        >
          {titleCopy.secondLine}
        </span>
      </>
    </h1>
  );
}
