import type {
  ComponentPropsWithoutRef,
  ComponentType,
  SVGProps,
} from 'react';
import Heading from './Heading';

type WordMarkInTitleProps = {
  WordMark: ComponentType<SVGProps<SVGSVGElement>>;
  textTemplate: string; // template string with a placeholder for the wordmark [wordmark]
  className?: string;
  textClassName?: string;
  wordMarkClassName?: string;
} & Pick<ComponentPropsWithoutRef<'h2'>, 'id'>;

const TOKEN_REGEX = /\[wordmark:([^\]]+)\]/;

function processTemplate(template: string) {
  const match = template.match(TOKEN_REGEX);

  if (!match || match.index === undefined) {
    return {
      beforeText: template.trim() || '',
      afterText: '',
      wordmarkText: '',
      fullText: template.trim(),
    };
  }

  const token = match[0];
  const wordmarkText = match[1]?.trim() || '';
  const beforeText = template.slice(0, match.index).trim() || '';
  const afterText = template
    .slice(match.index + token.length)
    .trim() || '';
  const fullText = [
    beforeText,
    wordmarkText,
    afterText,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    beforeText,
    afterText,
    wordmarkText,
    fullText,
  };
}

export default function WordMarkInTitle(props: WordMarkInTitleProps) {
  const {
    WordMark,
    textTemplate,
    className,
    wordMarkClassName,
    textClassName,
    ...rest
  } = props;

  const { beforeText, afterText, wordmarkText, fullText } =
    processTemplate(textTemplate);
  const hasWordmark = wordmarkText.length > 0;
  return (
    <Heading title={fullText} className={className} {...rest}>
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
