import Link from 'next/link';
import type {
  ComponentPropsWithoutRef,
  ComponentType,
  SVGProps,
} from 'react';

import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';

import Heading, { type IHeadingDepth } from './Heading';

type WordMarkInTitleProps = {
  WordMark: ComponentType<SVGProps<SVGSVGElement>>;
  textTemplate: string; // template string with a placeholder for the wordmark [wordmark]
  className?: string;
  textClassName?: string;
  linkUrl?: string;
  linkClassName?: string;
  wordMarkClassName?: string;
  ignoreDataUI?: boolean;
} & Pick<ComponentPropsWithoutRef<'h2'>, 'id'> &
  IHeadingDepth;

export default function WordMarkInTitle(props: WordMarkInTitleProps) {
  const {
    WordMark,
    textTemplate,
    className,
    wordMarkClassName,
    textClassName,
    linkUrl,
    linkClassName,
    depth = 3,
    ...rest
  } = props;

  const { beforeText, afterText, wordmarkText, fullText } =
    parseWordmarkTemplate(textTemplate);
  const hasWordmark = wordmarkText.length > 0;

  const textAndSVG = (
    <>
      {hasWordmark ? (
        <>
          {beforeText ? (
            <span data-position="after" className={textClassName}>
              {beforeText}
            </span>
          ) : null}{' '}
          <WordMark className={wordMarkClassName} />{' '}
          {afterText ? (
            <span data-position="before" className={textClassName}>
              {afterText}
            </span>
          ) : null}
        </>
      ) : (
        fullText
      )}
    </>
  );

  return (
    <Heading
      title={fullText}
      className={className}
      ignoreDataUI={false}
      depth={depth}
      {...rest}
    >
      {linkUrl ? (
        <Link
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-ui="link"
          className={linkClassName}
        >
          {textAndSVG}
        </Link>
      ) : (
        textAndSVG
      )}
    </Heading>
  );
}
