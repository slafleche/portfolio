import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import { Markdown } from '@/components/Markdown';
import * as layoutStyles from '@/styles/layout.css';
import * as privacyStyles from '@/styles/components/privacy.css';
import { userContent } from '@/styles/typography.css';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import Link from 'next/link';
import { resolveLocale } from '@/lib/locales/locale';
import { SkipNavLink } from '@/components/SkipNavLink';

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
                <p className={privacyStyles.updated}>
                  {updatedText}
                </p>
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
        <ContactButton
          watchId={titleId}
          label={contactCopy.title}
        />
      </div>
    </>
  );
}
