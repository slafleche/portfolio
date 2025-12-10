import Hero from '@/components/Hero';
import Content from '@/components/responsive/Content';
import CaseStudy from '@/components/CaseStudy';
import { Grid, Column } from '@/components/Grid';
import Card from '@/components/Card';
import { Markdown } from '@/components/Markdown';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Menu from '@/components/Menu';
import * as layoutStyles from '@/styles/layout.css';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '@/lib/locales/sections/projects.locale';
import { translateMarkdownSections } from '@/lib/locales/sections/markdownSections.helpers';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import {
  buildHomeMenuSections,
  buildSystemsMenuSections,
} from '@/lib/locales/sections/menuSections';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { resolveLocale } from '@/lib/locales/locale';

interface PageParams {
  LOCALE: string;
}

export default async function HomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);

  const heroCopy = buildHeroCopy(translator);
  const [
    approach,
    about,
  ] = translateMarkdownSections(translator, [
    {
      titleKey: 'approach',
      markdownKey: 'approach-content',
      hrefKey: 'approach-href',
    },
    {
      titleKey: 'about',
      markdownKey: 'about-content',
      hrefKey: 'about-href',
    },
  ]);
  const caseStudies = buildCaseStudiesCopy(translator);
  const projects = buildProjectsCopy(translator);
  const contact = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);
  const menuCopy = buildMenuCopy(translator);
  const menuSections = buildHomeMenuSections(translator);
  const systemsMenuSections = buildSystemsMenuSections(translator);

  const curiosityMessages = {
    title: translator('console-curiosity-title'),
    test: translator('console-curiosity-test'),
    result: translator('console-curiosity-result'),
    hint: translator('console-curiosity-hint'),
  };
  const systemsSlug =
    canonicalToLocalizedSlugs[locale]?.systems ?? 'systems';
  const curiosityTarget = `/${locale}/${systemsSlug}`;

  const menuProps = {
    root: `/${locale}`,
    skipNavLabel: menuCopy.skipNavLabel,
    leftLabel: menuCopy.leftLabel,
    rightLabel: menuCopy.rightLabel,
    localeChangeLabel: menuCopy.languageLabel,
    sections: menuSections,
    systemsSections: systemsMenuSections,
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <>
      <Menu
        {...menuProps}
        curiosityMessages={{
          title: curiosityMessages.title,
          test: curiosityMessages.test,
          result: curiosityMessages.result,
          hint: curiosityMessages.hint,
          targetHref: curiosityTarget,
        }}
        logoRedirectPaths={[
          curiosityTarget,
        ]}
      />
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero id="hero" copy={heroCopy} />
          <Content
            id={approach.href}
            title={approach.title}
            markdown={approach.content}
          />
          <Content
            id={about.href}
            title={about.title}
            markdown={about.content}
          />
          <Content id={caseStudies.href} title={caseStudies.title}>
            <CaseStudy
              id={caseStudies.href}
              intro={caseStudies.intro}
              caseStudies={caseStudies.list}
            />
          </Content>
          <Content title={projects.title} id={projects.href}>
            <Grid columns={2}>
              <Column span={2}>
                <Card title={projects.list[0]?.title}>
                  {projects.list[0] ? (
                    <Markdown source={projects.list[0].content} />
                  ) : null}
                </Card>
              </Column>
              <Column span={2}>
                <Card title={projects.list[1]?.title}>
                  {projects.list[1] ? (
                    <Markdown source={projects.list[1].content} />
                  ) : null}
                </Card>
              </Column>
              <Column span={1}>
                <Card title={projects.list[2]?.title}>
                  {projects.list[2] ? (
                    <Markdown source={projects.list[2].content} />
                  ) : null}
                </Card>
              </Column>
              <Column span={1}>
                <Card title={projects.list[3]?.title}>
                  {projects.list[3] ? (
                    <Markdown source={projects.list[3].content} />
                  ) : null}
                </Card>
              </Column>
              <Column span={2}>
                <Card title={projects.list[4]?.title}>
                  {projects.list[4] ? (
                    <Markdown source={projects.list[4].content} />
                  ) : null}
                </Card>
              </Column>
            </Grid>
          </Content>
        </main>
        <Footer
          contact={contact}
          id={contact.href}
          systemsLink={systemsLink}
        />
        {heroCopy.ctaLabel ? (
          <ContactButton watchId="hero" label={heroCopy.ctaLabel} />
        ) : null}
      </div>
    </>
  );
}
