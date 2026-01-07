import Link from 'next/link';

import ContactButton from '@/components/ContactButton';
import Footer from '@/components/Footer';
import { Markdown } from '@/components/Markdown';
import { SkipNavLink } from '@/components/SkipNavLink';
import { resolveLocale } from '@/lib/locales/locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import * as privacyStyles from '@/styles/components/privacy.css';
import * as layoutStyles from '@/styles/layout.css';
import { userContent } from '@/styles/typography.css';

type PrivacyPageParams = Promise<{ LOCALE: string }>;

export default async function PrivacyPage({
  params,
}: {
  params: PrivacyPageParams;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const privacyCopy = buildPrivacyCopy(translator);
  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);

  const articleId = privacyCopy.href || 'privacy';
  const titleId = `${articleId}-title`;
  const updatedText = privacyCopy.updated
    ? String(privacyCopy.updated).trim()
    : '';
  const skipLabel = translator('menu-skip_nav');
  const backHref = `/${locale}`;

  return (
    <>
      <SkipNavLink contentId="body">{skipLabel}</SkipNavLink>
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <article
            id={articleId}
            className={privacyStyles.container}
            aria-labelledby={titleId}
          >
            <Link
              href={backHref}
              aria-label="Back"
              className={privacyStyles.backLink}
            >
              ←
            </Link>
            <header className={privacyStyles.header}>
              <h1 id={titleId} className={privacyStyles.title}>
                {privacyCopy.title}
              </h1>
              {updatedText ? (
                <p className={privacyStyles.updated}>{updatedText}</p>
              ) : null}
            </header>
            <Markdown
              source={privacyCopy.content}
              className={userContent}
            />
          </article>
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
        />
        <ContactButton watchId={titleId} label={contactCopy.title} />
      </div>
    </>
  );
}
