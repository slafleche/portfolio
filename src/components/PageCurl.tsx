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
        <div className={s.box} aria-hidden="true">
          <div className={s.cornerBox}>
            <div className={s.fakeTipShadow} />
            <div className={s.pageTip}>
              <div className={s.pageTipBorder} />
              <div className={s.topLeftSlope} />
              <div className={s.bottomRightSlope} />
            </div>
            <div className={s.cornerContents}>
              <ImageByName
                className={s.mockHtml}
                name="mock-end-html@3x"
                alt={mockHtmlAlt}
              />
              <div className={s.fakeCodeShadow} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
