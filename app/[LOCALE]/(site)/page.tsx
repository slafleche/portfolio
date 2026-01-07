import Hero from '@/components/Hero';
import ContentWithTitle from '@/components/responsive/ContentWithTitle';
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
} from '@/components/wordmarks/wordmarks.tsx';
import Menu from '../../../src/components/Menu';
import { clsx } from 'clsx';
import HeroGooey from '../../../src/components/HeroGooey';

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
      {
        title: contact.title,
        href: '#contact',
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
      <ConsoleCuriosity
        title={curiosityMessages.title}
        test={curiosityMessages.test}
        result={curiosityMessages.result}
        hint={curiosityMessages.hint}
        targetHref={curiosityTarget}
      />
      <Menu {...menuProps} />
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero
            id="hero"
            copy={heroCopy}
            headingAnimated={false}
            Gooey={HeroGooey}
          />
          <ContentWithTitle
            id={approach.href}
            contentTitle={approach.title}
            ignoreDataUI={true}
          >
            <Markdown source={approach.content} />
          </ContentWithTitle>

          <ContentWithTitle
            id={about.href}
            contentTitle={about.title}
            ignoreDataUI={true}
          >
            <Markdown source={about.content} />
          </ContentWithTitle>

          <CaseStudy
            id={caseStudies.href}
            intro={caseStudies.intro}
            title={caseStudies.title}
            caseStudies={caseStudies.list}
            wordMarkClassName={cg.wordmarkTextNoLogo}
          />

          <ContentWithTitle
            ignoreDataUI={true}
            contentTitle={projects.title}
            id={projects.href}
            queryDataAttributes={{
              compact: 'no-padding',
            }}
          >
            <Grid>
              <Column span={2}>
                <Card
                  className={cg.cardCC}
                  gradientClassName={cg.gradientCC}
                  title={
                    <WordMarkInTitle
                      WordMark={CCWordmark}
                      textTemplate={cocacola.title}
                      textClassName={cg.wordmarkTextNoLogo}
                    />
                  }
                  logoAsBg={
                    <CCWordmark
                      className={clsx(cg.logoAsBgSVG, cg.logoAsBg_cc)}
                    />
                  }
                >
                  <Markdown source={cocacola.content} />
                </Card>
              </Column>
              <Column span={2}>
                <Card
                  className={cg.cardEa}
                  gradientClassName={cg.gradientEa}
                  title={
                    <WordMarkInTitle
                      WordMark={EAWordmark}
                      textTemplate={ea.title}
                      textClassName={cg.wordmarkTextNoLogo}
                    />
                  }
                  logoAsBg={
                    <EAWordmark
                      className={clsx(cg.logoAsBgSVG, cg.logoAsBg_ea)}
                    />
                  }
                >
                  <Markdown source={ea.content} />
                </Card>
              </Column>
              <Column
                span={1}
                mediaQuerySpan={{
                  underMinWidth: 2,
                }}
              >
                <Card
                  className={cg.cardBanq}
                  gradientClassName={cg.gradientBanq}
                  title={
                    <WordMarkInTitle
                      WordMark={BQWordmark}
                      textTemplate={banq.title}
                      textClassName={cg.wordmarkTextNoLogo}
                    />
                  }
                  logoAsBg={
                    <BQWordmark
                      className={clsx(
                        cg.logoAsBgSVG,
                        cg.logoAsBg_banq,
                      )}
                    />
                  }
                >
                  <Markdown source={banq.content} />
                </Card>
              </Column>
              <Column
                span={1}
                mediaQuerySpan={{
                  underMinWidth: 2,
                }}
              >
                <Card
                  className={cg.cardHs}
                  gradientClassName={cg.gradientHs}
                  title={
                    <WordMarkInTitle
                      WordMark={HSWordmark}
                      textTemplate={hootsuite.title}
                      textClassName={cg.wordmarkTextNoLogo}
                    />
                  }
                  logoAsBg={
                    <HSWordmark
                      className={clsx(cg.logoAsBgSVG, cg.logoAsBg_hs)}
                    />
                  }
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
                  className={cg.cardKg}
                  gradientClassName={cg.gradientKg}
                  title={
                    <WordMarkInTitle
                      WordMark={KGWordmark}
                      textTemplate={kingGames.title}
                      textClassName={cg.wordmarkTextNoLogo}
                    />
                  }
                  logoAsBg={
                    <KGWordmark
                      className={clsx(cg.logoAsBgSVG, cg.logoAsBg_kg)}
                    />
                  }
                >
                  <Markdown source={kingGames.content} />
                </Card>
              </Column>
            </Grid>
          </ContentWithTitle>
        </main>
        <Footer
          contact={contact}
          id="contact"
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
