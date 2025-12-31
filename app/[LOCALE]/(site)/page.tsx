import Hero from '@/components/Hero';
import Content from '@/components/responsive/Content';
import CaseStudy from '@/components/CaseStudy';
import { Grid, Column } from '@/components/Grid';
import Card from '@/components/Card';
import { Markdown } from '@/components/Markdown';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import ConsoleCuriosity from '@/components/ConsoleCuriosity';
import * as layoutStyles from '@/styles/layout.css';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '@/lib/locales/sections/projects.locale';
import { translateMarkdownSections } from '@/lib/locales/sections/markdownSections.helpers';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import * as cg from '@/styles/components/card.css';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { sharedStrings } from '@/lib/sharedStrings';
import { resolveLocale } from '@/lib/locales/locale';
import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';
import WordMarkInTitle from '@/components/WordmarkInTitle';
import {
  BQWordmark,
  CCWordmark,
  EAWordmark,
  HSWordmark,
  KGWordmark,
  VNWordmark,
  rms,
} from '@/components/wordmarks/wordmarks.tsx';
import Menu from '../../../src/components/Menu';

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

  const heroCopyBase = buildHeroCopy(translator);
  const heroCopy = {
    ...heroCopyBase,
    subtitle: translator('hero-subTitle'),
  };
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
  const { cocacola, ea, banq, hootsuite, kingGames } = projects.items;
  const contact = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);
  const menuCopy: ReturnType<typeof buildMenuCopy> =
    buildMenuCopy(translator);

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
    homeLabel: menuCopy.homeLabel,
    skipNavLabel: menuCopy.skipNavLabel,
    navLabel: menuCopy.navLabel,
    localeChangeLabel: menuCopy.languageLabel,
    anchorNavLabel: menuCopy.anchorLabel,
    anchorLinks: [
      {
        title: parseWordmarkTemplate(approach.title).fullText,
        href: `#${approach.href}`,
      },
      {
        title: parseWordmarkTemplate(about.title).fullText,
        href: `#${about.href}`,
      },
      {
        title: parseWordmarkTemplate(caseStudies.title).fullText,
        href: `#${caseStudies.href}`,
      },
      {
        title: parseWordmarkTemplate(projects.title).fullText,
        href: `#${projects.href}`,
      },
    ],
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <>
      <Menu {...menuProps} />
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero id="hero" copy={heroCopy} headingAnimated={false} />
          <ConsoleCuriosity
            title={curiosityMessages.title}
            test={curiosityMessages.test}
            result={curiosityMessages.result}
            hint={curiosityMessages.hint}
            targetHref={curiosityTarget}
          />
          <Content
            id={approach.href}
            title={approach.title}
            ignoreDataUI={true}
            markdown={approach.content}
          />
          <Content
            id={about.href}
            title={about.title}
            ignoreDataUI={true}
            markdown={about.content}
          />
          <Content id={caseStudies.href}>
            <WordMarkInTitle
              WordMark={VNWordmark}
              ignoreDataUI={true}
              textTemplate={caseStudies.title}
              textClassName={rms.wordmarkTextNoLogo}
            />
            <CaseStudy
              id={caseStudies.href}
              intro={caseStudies.intro}
              caseStudies={caseStudies.list}
            />
          </Content>
          <Content
            ignoreDataUI={true}
            title={projects.title}
            id={projects.href}
          >
            <Grid
              columns={2}
              mediaQueryColumns={{
                compact: 1,
              }}
            >
              <Column span={2}>
                <Card
                  title={
                    <WordMarkInTitle
                      className={rms.cocacolaTitle}
                      WordMark={CCWordmark}
                      textTemplate={cocacola.title}
                      textClassName={rms.wordmarkTextNoLogo}
                    />
                  }
                  gradientClassName={cg.gradientCC}
                >
                  <Markdown source={cocacola.content} />
                </Card>
              </Column>
              <Column span={2}>
                <Card
                  title={
                    <WordMarkInTitle
                      WordMark={EAWordmark}
                      textTemplate={ea.title}
                      textClassName={rms.wordmarkTextNoLogo}
                    />
                  }
                  gradientClassName={cg.gradientEa}
                >
                  <Markdown source={ea.content} />
                </Card>
              </Column>
              <Column span={1}>
                <Card
                  title={
                    <WordMarkInTitle
                      className={rms.banqTitle}
                      WordMark={BQWordmark}
                      textTemplate={banq.title}
                      textClassName={rms.wordmarkTextNoLogo}
                    />
                  }
                  gradientClassName={cg.gradientBanq}
                >
                  <Markdown source={banq.content} />
                </Card>
              </Column>
              <Column span={1}>
                <Card
                  title={
                    <WordMarkInTitle
                      className={rms.hootsuiteTitle}
                      WordMark={HSWordmark}
                      textTemplate={hootsuite.title}
                      textClassName={rms.wordmarkTextNoLogo}
                    />
                  }
                  gradientClassName={cg.gradientHs}
                >
                  <Markdown source={hootsuite.content} />
                </Card>
              </Column>
              <Column
                span={2}
                mediaQuerySpan={{
                  compact: 1,
                }}
              >
                <Card
                  title={
                    <WordMarkInTitle
                      className={rms.kingGamesTitle}
                      WordMark={KGWordmark}
                      textTemplate={kingGames.title}
                      textClassName={rms.wordmarkTextNoLogo}
                    />
                  }
                  gradientClassName={cg.gradientKing}
                >
                  <Markdown source={kingGames.content} />
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
          <ContactButton
            watchId={sharedStrings.heroWaypointId}
            label={heroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </>
  );
}
