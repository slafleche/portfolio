import { useLayoutEffect, useRef } from 'react';
import * as s from '@/styles/components/forms.css';
import { Markdown } from '../Markdown';
import CircledCheckIcon from '../icons/CircledCheckIcon';

type ContactFormSuccessProps = {
  title: string;
  description: string;
};

export default function ContactFormSuccess({
  title,
  description,
}: ContactFormSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const heading = headingRef.current;
    if (heading && typeof heading.focus === 'function') {
      heading.focus();
    }
  }, []);

  return (
    <div className={s.successPanel} data-form="success">
      <div className={s.successIconWrapper} aria-hidden="true">
        <CircledCheckIcon className={s.successIcon} />
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
