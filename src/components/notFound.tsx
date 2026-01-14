import type { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';

import * as s from '@/styles/components/notFound.css';

import Heading from './Heading';
import LeftArrow from './icons/LeftArrow';
import Content from './responsive/Content';

type NotFoundProps = {
  title: string;
  backText: string;
  homeLink: Url;
};

export default function NotFound({
  title,
  backText,
  homeLink,
}: NotFoundProps) {
  return (
    <div className={s.root}>
      <Content
        ignoreBottomMargin={true}
        queryDataAttributes={{
          compact: 'no-padding',
        }}
      >
        <Heading depth={1} className={s.heading}>
          {title}
        </Heading>
        <Link data-ui="link" href={homeLink}>
          <span className={s.backLink}>
            <LeftArrow className={s.backLinkIcon} />
            {backText}
          </span>
        </Link>
      </Content>
    </div>
  );
}
