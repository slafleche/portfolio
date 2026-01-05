import type {
  ComponentPropsWithoutRef,
  ComponentType,
  SVGProps,
} from 'react';
import Heading, { type IHeadingDepth } from './Heading';
import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';

type WordMarkInTitleProps = {
  WordMark: ComponentType<SVGProps<SVGSVGElement>>;
  textTemplate: string; // template string with a placeholder for the wordmark [wordmark]
  className?: string;
  textClassName?: string;
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
    depth = 3,
    ...rest
  } = props;

  const { beforeText, afterText, wordmarkText, fullText } =
    parseWordmarkTemplate(textTemplate);
  const hasWordmark = wordmarkText.length > 0;
  return (
    <Heading
      title={fullText}
      className={className}
      ignoreDataUI={false}
      depth={depth}
      {...rest}
    >
      {hasWordmark ? (
        <>
          {beforeText ? (
            <span data-position="after" className={textClassName}>
              {beforeText}
            </span>
          ) : null}
          <WordMark className={wordMarkClassName} />
          {afterText ? (
            <span data-position="before" className={textClassName}>
              {afterText}
            </span>
          ) : null}
        </>
      ) : (
        fullText
      )}
    </Heading>
  );
}
