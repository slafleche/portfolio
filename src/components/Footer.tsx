import clsx from 'clsx';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import type { ContactCopy } from '@/lib/locales/sections/contact.locale';
import {
  DEFAULT_RENDER_MODE,
  type RenderMode,
} from '@/lib/renderMode';
import { sharedStrings } from '@/lib/sharedStrings';
import * as s from '@/styles/components/footer.css';
import {
  glassLink,
  glassLinkShine,
} from '@/styles/components/glassyButtons.css';

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
  renderMode?: RenderMode;
};

export default function Footer({
  contact,
  id,
  systemsLink,
  hideSystemsLink,
  renderMode = DEFAULT_RENDER_MODE,
}: FooterProps) {
  const footerId = id ?? contact.href;
  const sentinelId = `${footerId}-sentinel`;
  const headingId = `${footerId}-title`;

  if (renderMode === 'simple') {
    return (
      <footer
        id={footerId}
        aria-labelledby={headingId}
        data-simple-render="Footer.tsx"
      >
        <h2 id={headingId}>{contact.title}</h2>
        {contact.content
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value, index) => (
            <p key={`${footerId}-p-${index}`}>{value}</p>
          ))}
        <div>
          <a href={`#${footerId}`}>{contact.emailLabel}</a>
          <a
            href={sharedStrings.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.linkedInLabel}
          </a>
          <a
            href={sharedStrings.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.githubLabel}
          </a>
          {systemsLink && !hideSystemsLink ? (
            <a href={systemsLink.href}>{systemsLink.label}</a>
          ) : null}
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={s.root}
      id={footerId}
      aria-labelledby={headingId}
    >
      <div
        id={sentinelId}
        className={s.anchorSentinel}
        aria-hidden="true"
      />

      <Content ignoreBottomMargin={true}>
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
            className={clsx(glassLink, s.link)}
            aria-label={contact.emailLabel}
            title={contact.emailLabel}
          >
            <div className={glassLinkShine} aria-hidden="true" />
            <ContactIcon
              className={clsx(s.contactIcon, s.icon)}
              aria-hidden
            />
          </ContactDialogTrigger>
          <GlassyLink
            href={sharedStrings.linkedInUrl}
            label={contact.linkedInLabel}
            className={clsx(glassLink, s.link)}
            target="_blank"
          >
            <div className={glassLinkShine} aria-hidden="true" />
            <SocialLinkedInIcon
              className={clsx(s.linkedInIcon, s.icon)}
            />
          </GlassyLink>
          <GlassyLink
            href={sharedStrings.githubUrl}
            label={contact.githubLabel}
            className={clsx(glassLink, s.link)}
            target="_blank"
          >
            <div className={glassLinkShine} aria-hidden="true" />
            <SocialGitHubIcon
              className={clsx(s.gitHubIcon, s.icon)}
            />
          </GlassyLink>
        </div>
      </Content>
      {systemsLink && !hideSystemsLink ? (
        <PageCurl
          label={systemsLink.label}
          href={systemsLink.href}
          mockHtmlAlt={contact.mockHtmlAlt}
        />
      ) : null}
    </footer>
  );
}
