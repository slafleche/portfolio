import type { ContactCopy } from '@/lib/locales/sections/contact.locale';
import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/footer.css';
import Heading from './Heading';
import Link from 'next/link';
import { sharedStrings } from '@/lib/sharedStrings';
import GlassyLink from './GlassyLink';
import ContactIcon from './icons/SendIcon';
import SocialLinkedInIcon from './icons/SocialLinkedInIcon';
import SocialGitHubIcon from './icons/SocialGitHubIcon';

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
      {/* Put gradient on overlay */}
      <div className={s.overlay}></div>
      <Heading id={headingId} className={s.heading}>
        {contact.title}
      </Heading>
      <Markdown className={s.content} source={contact.content} />

      {/* Just a simple wrapper for links, since we have multiple elements to position */}
      <div className={s.links}>
        {/* Placeholder email for now */}
        <GlassyLink
          href={sharedStrings.mailtoEmail}
          label={contact.emailLabel}
          className={s.glassLink}
        >
          <div className={s.glassLinkShine} aria-hidden="true" />
          <ContactIcon className={s.contactIcon} />
        </GlassyLink>
        <GlassyLink
          href={sharedStrings.linkedInUrl}
          label="LinkedIn"
          className={s.glassLink}
        >
          <div className={s.glassLinkShine} aria-hidden="true" />
          <SocialLinkedInIcon className={s.linkedInIcon} />
        </GlassyLink>
        <GlassyLink
          href={sharedStrings.githubUrl}
          label="GitHub"
          className={s.glassLink}
        >
          <div className={s.glassLinkShine} aria-hidden="true" />
          <SocialGitHubIcon className={s.gitHubIcon} />
        </GlassyLink>
      </div>
      {/* Needs to be reworked */}
      {/* <Markdown
        className={s.links}
        source={contact.github}
        openLinksInNewTab
      /> */}

      {/* Leave for now, i'll be refactoring this link later */}
      {systemsLink ? (
        <Link href={systemsLink.href}>{systemsLink.label}</Link>
      ) : null}
    </footer>
  );
}
