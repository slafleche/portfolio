import { clsx } from 'clsx';

import * as s from '@/styles/components/tempalates/heroHeadingToSvg.css';

import splitText from '../styles/helpers/textSplit';

interface TitleShadowProps {
  x: number;
  y: number;
  color: string;
  opacity: number;
  blur: number;
}

interface TitleProps {
  locale: string;
  copy: string;
  className?: string;
  firstLineClassName?: string;
  secondLineClassName?: string;
  shadow?: TitleShadowProps;
}

export default function HeroTitleTemplate(props: TitleProps) {
  const titleCopy = splitText(props.copy);
  const shadowPayload = props.shadow
    ? JSON.stringify({
        x: props.shadow.x,
        y: props.shadow.y,
        color: props.shadow.color,
        opacity: props.shadow.opacity,
        blur: props.shadow.blur,
      })
    : undefined;

  if (!titleCopy.fullText) {
    return null;
  }

  return (
    <h1
      data-text={titleCopy.fullText}
      data-target="hero-heading"
      data-ui="heading"
      data-locale={props.locale}
      data-shadow={shadowPayload}
      className={clsx(s.heading, props.className)}
    >
      {titleCopy.secondLine ? (
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
      ) : (
        <span
          className={clsx(s.line, props.firstLineClassName)}
          data-position="first"
        >
          {titleCopy.lastLine}
        </span>
      )}
    </h1>
  );
}
