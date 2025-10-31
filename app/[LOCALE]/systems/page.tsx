import { SkipNavContent } from '@/components/SkipNavContent';
import Footer from '@/components/Footer';
import Content from '@/components/responsive/Content';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import * as layoutStyles from '@/styles/layout.css';
import type { PageParams } from '@/styles/helpers/types';
import { buildSystemsLink } from '@/lib/routes/systemsLink';

type SystemsPageProps = {
  params: Promise<PageParams>;
};

export default async function SystemsPage({
  params,
}: SystemsPageProps) {
  const { LOCALE } = await params;
  const translator = await loadTranslator(LOCALE);

  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(LOCALE, translator);
  const systemsTitle = translator('systems-title');
  const systemsMarkdown = translator('systems-content');

  return (
    <SkipNavContent id="body">
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Content title={systemsTitle} markdown={systemsMarkdown} />
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
        />
      </div>
    </SkipNavContent>
  );
}
