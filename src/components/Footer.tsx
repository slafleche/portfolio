import type { ContactCopy } from '@/lib/locales/sections/contact.locale';
import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/footer.css';
import Heading from './Heading';
import Link from 'next/link';

type FooterProps = {
  contact: ContactCopy;
  id?: string;
  systemsLink?: {
    href: string;
    label: string;
  };
};

export default function Footer({
  contact,
  id,
  systemsLink,
}: FooterProps) {
  const footerId = id ?? contact.href;
  const headingId = `${footerId}-title`;
  return (
    <footer
      className={s.root}
      id={footerId}
      aria-labelledby={headingId}
    >
      <Heading id={headingId} className={s.heading}>
        {contact.title}
      </Heading>
      <Markdown className={s.content} source={contact.content} />
      <Markdown
        className={s.links}
        source={contact.github}
        openLinksInNewTab
      />
      {systemsLink ? (
        <Link href={systemsLink.href}>{systemsLink.label}</Link>
      ) : null}
    </footer>
  );
}
