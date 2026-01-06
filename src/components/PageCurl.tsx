'use client';
import Link from 'next/link';
import * as s from '@/styles/components/pageCurl.css';
import MockEndHTML from './MockEndHTML';

type PageCurlProps = {
  href: string;
  mockEndHtmlLabel: string;
  label: string;
};

export default function PageCurl({
  href,
  mockEndHtmlLabel,
  label,
}: PageCurlProps) {
  return (
    <div className={s.root}>
      <Link
        aria-label={label}
        href={href}
        className={s.link}
        data-ui="link"
      >
        <div className={s.box} aria-hidden="true">
          <div className={s.cornerBox}>
            <div className={s.fakeTipShadow} />
            <div className={s.pageTip}>
              <div className={s.pageTipBorder} />
              <div className={s.topLeftSlope} />
              <div className={s.bottomRightSlope} />
            </div>
            <div className={s.cornerContents}>
              <MockEndHTML ariaLabel={mockEndHtmlLabel} />
              <div className={s.fakeCodeShadow} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
