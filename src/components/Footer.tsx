import type { ContactCopy } from '@/lib/locales/sections/contact.locale';
import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/footer.css';
import Heading from './Heading';
import { sharedStrings } from '@/lib/sharedStrings';
import GlassyLink from './GlassyLink';
import ContactIcon from './icons/SendIcon';
import SocialLinkedInIcon from './icons/SocialLinkedInIcon';
import SocialGitHubIcon from './icons/SocialGitHubIcon';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import PageCurl from './PageCurl';
import BackButton from './BackButton';

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
  backHref,
  backLabel,
}: FooterProps) {
  const footerId = id ?? contact.href;
  const headingId = `${footerId}-title`;
  return (
    <footer
      className={s.root}
      id={footerId}
      aria-labelledby={headingId}
    >
      {backHref ? (
        <BackButton
          href={backHref}
          label={backLabel ?? 'Back to home'}
        />
      ) : null}
      {/* Put gradient on overlay */}
      <div className={s.overlay}></div>
      <Heading
        data-visible="sc-only"
        id={headingId}
        className={s.heading}
      >
        {contact.title}
      </Heading>
      <Markdown className={s.content} source={contact.content} />

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
      {systemsLink && !hideSystemsLink ? (
        <PageCurl
          href={systemsLink.href}
          mockEndHtmlLabel={contact.systemsSnippetLabel}
        />
      ) : null}
    </footer>
  );
}
