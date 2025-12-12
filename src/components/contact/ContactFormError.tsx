import { useEffect, useRef } from 'react';
import * as s from '@/styles/components/forms.css';
import { Markdown } from '../Markdown';
import CircledPauseIcon from '../icons/CircledPauseIcon';

type ContactFormErrorProps = {
  title: string;
  description: string;
};

export default function ContactFormError({
  title,
  description,
}: ContactFormErrorProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const heading = headingRef.current;
    if (heading && typeof heading.focus === 'function') {
      heading.focus();
    }
  }, []);

  return (
    <div className={s.successPanel} data-form="error">
      <div className={s.successIconWrapper} aria-hidden="true">
        <CircledPauseIcon className={s.failIcon} />
      </div>
      <div className={s.successCopy}>
        <h1
          ref={headingRef}
          className={s.successHeading}
          tabIndex={-1}
        >
          {title}
        </h1>
        <Markdown
          className={s.successBody}
          source={description}
          openLinksInNewTab={false}
        />
      </div>
    </div>
  );
}
