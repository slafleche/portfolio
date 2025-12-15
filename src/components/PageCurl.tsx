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
    <Link href={href} className={s.root} data-ui="link">
      <div className={s.box}>
        <div className={s.content}>
          <h2 className={s.title}>Titolo</h2>
          <p className={s.text}>
            Testo di esempio per dimostrare l&apos;effetto di piega
            della pagina. Passa il mouse sull&apos;angolo in basso a
            sinistra per vedere l&apos;animazione.
          </p>
          <p className={s.text}>
            Questo è un secondo paragrafo per aggiungere più contenuto
            alla pagina.
          </p>
        </div>
        <div className={s.cornerBox} aria-hidden="true">
          <div className={s.pageTip}>
            <div className={s.pageTipShadeRight} />
            <div className={s.pageTipShadeTop} />
          </div>
          <div className={s.cornerContents}>
            <div className={s.cornerBase} />
            <div className={s.behindCode}>
              <MockEndHTML ariaLabel={mockEndHtmlLabel} />
            </div>
            {/* <div className={s.cornerHighlight} /> */}
          </div>
        </div>
      </div>
    </Link>
  );
}
