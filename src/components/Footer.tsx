import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import type { ContactCopy } from '@/lib/locales/sections/contact.locale';
import { sharedStrings } from '@/lib/sharedStrings';
import * as s from '@/styles/components/footer.css';

import GlassyLink from './GlassyLink';
import Heading from './Heading';
import ContactIcon from './icons/SendIcon';
import SocialGitHubIcon from './icons/SocialGitHubIcon';
import SocialLinkedInIcon from './icons/SocialLinkedInIcon';
import PageCurl from './PageCurl';
import Content from './responsive/Content';

type FooterProps = {
  contact: ContactCopy;
  id?: string;
  systemsLink?: {
    href: string;
    label: string;
  };
  hideSystemsLink?: boolean;
  backHref?: string;
  backLabel?: string;
};

export default function Footer({
  contact,
  id,
  systemsLink,
  hideSystemsLink,
}: FooterProps) {
  const footerId = id ?? contact.href;
  const headingId = `${footerId}-title`;
  return (
    <footer
      className={s.root}
      id={footerId}
      aria-labelledby={headingId}
    >
      {systemsLink && !hideSystemsLink ? (
        <PageCurl
          label={systemsLink.label}
          href={systemsLink.href}
          mockHtmlAlt={contact.mockHtmlAlt}
        />
      ) : null}
      <Content>
        <Heading
          data-visible="sc-only"
          id={headingId}
          className={s.heading}
        >
          {contact.title}
        </Heading>
        <p className={s.content}>{contact.content}</p>

        {/* Just a simple wrapper for links, since we have multiple elements to position */}
        <div className={s.links}>
          {/* Modal trigger */}
          <ContactDialogTrigger
            className={s.glassLink}
            aria-label={contact.emailLabel}
            title={contact.emailLabel}
          >
            <div className={s.glassLinkShine} aria-hidden="true" />
            <ContactIcon className={s.contactIcon} aria-hidden />
          </ContactDialogTrigger>
          <GlassyLink
            href={sharedStrings.linkedInUrl}
            label="LinkedIn"
            className={s.glassLink}
            target="_blank"
          >
            <div className={s.glassLinkShine} aria-hidden="true" />
            <SocialLinkedInIcon className={s.linkedInIcon} />
          </GlassyLink>
          <GlassyLink
            href={sharedStrings.githubUrl}
            label="GitHub"
            className={s.glassLink}
            target="_blank"
          >
            <div className={s.glassLinkShine} aria-hidden="true" />
            <SocialGitHubIcon className={s.gitHubIcon} />
          </GlassyLink>
        </div>
      </Content>
    </footer>
  );
}
