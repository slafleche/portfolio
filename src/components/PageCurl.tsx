import Link from 'next/link';

import * as s from '@/styles/components/pageCurl.css';

import ImageByName from './ImageByName';

type PageCurlProps = {
  href: string;
  mockHtmlAlt: string;
  label: string;
};

export default function PageCurl({
  href,
  mockHtmlAlt,
  label,
}: PageCurlProps) {
  return (
    <div className={s.root}>
      <Link
        title={label}
        href={href}
        aria-label={label}
        className={s.link}
        data-ui="link"
      >
        <span data-visible="sc-only">{label}</span>
        <span className={s.box} aria-hidden="true">
          <span className={s.cornerBox}>
            <span className={s.fakeTipShadow} />
            <span className={s.pageTip}>
              <span className={s.pageTipBorder} />
              <span className={s.topLeftSlope} />
              <span className={s.bottomRightSlope} />
            </span>
            <span className={s.cornerContents}>
              <ImageByName
                className={s.mockHtml}
                name="mock-end-html@3x"
                alt={mockHtmlAlt}
              />
              <span className={s.fakeCodeShadow} />
            </span>
          </span>
        </span>
      </Link>
    </div>
  );
}
