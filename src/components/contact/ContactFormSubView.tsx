import clsx from 'clsx';
import { useLayoutEffect, useRef } from 'react';

import {
  statusFullPage,
  statusHeading,
  statusIcon,
  statusIconWrap,
  statusMain,
} from '../../styles/components/contactForm.css';
import { Markdown } from '../Markdown';

type SubViewClassNames = {
  root: string;
  main: string;
  heading: string;
  iconWrap: string;
  icon: string;
  copy: string;
};

type ContactFormSubViewProps = {
  title: string;
  description?: string;
  classNames: Partial<SubViewClassNames>;
  Icon: React.ComponentType<{ className?: string }>;
  type: 'error' | 'success' | 'loading';
};

export default function ContactFormSubView({
  title,
  classNames,
  description,
  Icon,
  type,
}: ContactFormSubViewProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const heading = headingRef.current;
    if (heading && typeof heading.focus === 'function') {
      heading.focus();
    }
  }, []);

  return (
    <div
      className={clsx(statusFullPage, classNames.root)}
      role="status"
      aria-live="polite"
      data-form={type}
    >
      <div className={clsx(statusMain, classNames.main)}>
        <h2
          ref={headingRef}
          className={clsx(statusHeading, classNames.heading)}
          data-form="state-title"
          data-has-description={Boolean(description)}
          tabIndex={-1}
        >
          {title}
        </h2>
        {description && (
          <Markdown
            className={classNames.copy}
            source={description}
            asUi={{
              paragraphs: true,
            }}
          />
        )}
        <div
          className={clsx(statusIconWrap, classNames.iconWrap)}
          aria-hidden="true"
        >
          <Icon className={clsx(statusIcon, classNames.icon)} />
        </div>
      </div>
    </div>
  );
}
