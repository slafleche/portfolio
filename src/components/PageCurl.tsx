'use client';
import Link from 'next/link';
import * as s from '@/styles/components/pageCurl.css';
import MockEndHTML from './MockEndHTML';

type PageCurlProps = {
  href: string;
  mockEndHtmlLabel: string;
};

export default function PageCurl({
  href,
  mockEndHtmlLabel,
}: PageCurlProps) {
  return (
    <div className={s.root}>
      <Link
        href={href}
        className={s.link}
        data-ui="link"
        onClick={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        <div className={s.box}>
          <div className={s.cornerBox} aria-hidden="true">
            <div className={s.pageTip}>
              <div className={s.pageTipBorder} />
              <div className={s.topLeftSlope} />
              <div className={s.bottomRightSlope} />
            </div>
            <div className={s.cornerContents}>
              <MockEndHTML ariaLabel={mockEndHtmlLabel} />
              <div className={s.fakeShadow} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
