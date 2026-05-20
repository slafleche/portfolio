import { clsx } from 'clsx';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { getLocaleSvgs } from '@/assets/SVG/generated/headingsAsSvgs';
import type { BrickData } from '@/components/Brick';
import Bricks from '@/components/Bricks';
import Card from '@/components/Card';
import CaseStudy from '@/components/CaseStudy';
import ConsoleCuriosity from '@/components/ConsoleCuriosity';
import DeferredIsland from '@/components/DeferredIsland';
import Footer from '@/components/Footer';
import { Column, Grid } from '@/components/Grid';
import Hero from '@/components/Hero';
import BookCheckIcon from '@/components/icons/bricks/BookCheckIcon';
import BugOffIcon from '@/components/icons/bricks/BugOffIcon';
import ConstructionIcon from '@/components/icons/bricks/ConstructionIcon';
import TrafficLightsIcon from '@/components/icons/bricks/TrafficLightsIcon';
import { Markdown } from '@/components/Markdown';
import Menu from '@/components/Menu';
import ContentWithTitle from '@/components/responsive/ContentWithTitle';
import SiteProviders from '@/components/site/SiteProviders.client';
import WordMarkInTitle from '@/components/WordmarkInTitle';
import {
  BQWordmark,
  CCWordmark,
  EAWordmark,
  HSWordmark,
  KGWordmark,
  TNBWordmark,
} from '@/components/wordmarks/wordmarks.tsx';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { createDomId } from '@/lib/dom';
import { getSocialImageByName } from '@/lib/images';
import { resolveLocale } from '@/lib/locales/locale';
import type { CaseStudyListItem } from '@/lib/locales/sections/caseStudies.locale';
import {
  buildCaseStudiesCopy,
  buildTnbCaseStudyCopy,
} from '@/lib/locales/sections/caseStudies.locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { buildGuardrailsCopy } from '@/lib/locales/sections/guardrails.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { translateMarkdownSections } from '@/lib/locales/sections/markdownSections.helpers';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { buildProjectsCopy } from '@/lib/locales/sections/projects.locale';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { getSiteOrigin } from '@/lib/runtimeEnv';
import { sharedStrings } from '@/lib/sharedStrings';
import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';
import { getTurnstileSiteKey } from '@/server/turnstile/getTurnstileSiteKey';
import * as bs from '@/styles/components/brick.css';
import * as cg from '@/styles/components/card.css';
import * as sectionWrap from '@/styles/components/sectionWrapper.css';
import * as layoutStyles from '@/styles/layout.css';

import { Accordion } from '../../../src/components/Accordion';
import Heading from '../../../src/components/Heading';
import HeroHomeBg from '../../../src/components/HeroHomeBg';
import Content from '../../../src/components/responsive/Content';

interface PageParams {
  LOCALE: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const meta = buildMetaCopy(translator);
  const origin = getSiteOrigin();
  if (!origin) return {};

  const languages: Record<string, string> = Object.fromEntries(
    AVAILABLE_LOCALES.map((code) => [
      code,
      `${origin}/${code}`,
    ]),
  );
  languages['x-default'] = `${origin}/en`;
  const canonicalUrl = `${origin}/${locale}`;
  const openGraphImageUrl = getSocialImageByName(locale, '1200x630');
  const twitterImageUrl = getSocialImageByName(locale, '1200x675');

  return {
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: 'website',
      locale,
      alternateLocale: AVAILABLE_LOCALES.filter(
        (code) => code !== locale,
      ),
      images: openGraphImageUrl
        ? [
            {
              url: openGraphImageUrl,
              width: 1200,
              height: 630,
              alt: meta.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: twitterImageUrl
        ? [
            twitterImageUrl,
          ]
        : undefined,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const localeSvgs = getLocaleSvgs(locale);
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);
  const closeLabel = translator('close-label');
  const turnstileSiteKey = getTurnstileSiteKey();

  const heroCopyBase = buildHeroCopy(translator);
  const heroCopy = {
    ...heroCopyBase,
    subtitle: translator('hero-subtitle'),
  };
  const [
    designSystems,
    summary,
    approach,
  ] = translateMarkdownSections(translator, [
    {
      titleKey: 'design_systems',
      markdownKey: 'design-systems-content',
      hrefKey: 'design_systems-href',
    },
    {
      titleKey: 'summary',
      markdownKey: 'summary-content',
      hrefKey: 'summary-href',
    },
    {
      titleKey: 'approach',
      markdownKey: 'approach-content',
      hrefKey: 'approach-href',
    },
  ]);
  const caseStudies = buildCaseStudiesCopy(translator);
  const tnbCaseStudy = buildTnbCaseStudyCopy(translator);
  const guardrails = buildGuardrailsCopy(translator);
  const guardrailIcons: Record<string, ReactNode> = {
    item2: (
      <TrafficLightsIcon className={bs.iconAsBg_trafficLights} />
    ),
    item3: <ConstructionIcon className={bs.iconAsBg_construction} />,
    item4: <BugOffIcon className={bs.iconAsBg_bugOff} />,
    item5: <BookCheckIcon className={bs.iconAsBg_bookCheck} />,
  };
  const guardrailsItems: BrickData[] = Object.values(
    guardrails.items,
  ).map((item) => ({
    title: item.title,
    body: item.content,
    iconAsBg: guardrailIcons[item.id],
  }));
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
    locale,
    homeLabel: menuCopy.homeLabel,
    skipNavLabel: menuCopy.skipNavLabel,
    navLabel: menuCopy.navLabel,
    localeChangeLabel: menuCopy.languageLabel,
    anchorNavLabel: menuCopy.anchorLabel,
    anchorLinks: [
      {
        title: parseWordmarkTemplate(designSystems.title).fullText,
        href: `#${designSystems.href}`,
      },
      {
        title: parseWordmarkTemplate(guardrails.title).fullText,
        href: `#${guardrails.href}`,
      },
      {
        title: parseWordmarkTemplate(summary.title).fullText,
        href: `#${summary.href}`,
      },
      {
        title: parseWordmarkTemplate(approach.title).fullText,
        href: `#${approach.href}`,
      },
      {
        title: parseWordmarkTemplate(tnbCaseStudy.title).fullText,
        href: `#${tnbCaseStudy.href}`,
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
    ctaLabel: contact.labelFloating,
    ctaWatchId: sharedStrings.heroWaypointId,
  };

  const baseId = createDomId('case-study');

  return (
    <SiteProviders
      formCopy={contactFormCopy}
      privacyCopy={privacyCopy}
      closeLabel={closeLabel}
      turnstileSiteKey={turnstileSiteKey}
    >
      <Menu {...menuProps} />
      <div className={layoutStyles.page}>
        <main
          id="main"
          className={layoutStyles.main}
          data-query-all="no-margin"
          data-query-compact="no-padding"
          tabIndex={-1}
        >
          <Hero
            id="hero"
            copy={heroCopy}
            headingAnimated={false}
            TitleSvg={localeSvgs.home.heroHeading}
            Bg={HeroHomeBg}
          />
          <DeferredIsland when="idle">
            <div
              className={clsx(
                sectionWrap.section,
                sectionWrap.bg,
                sectionWrap.endToEnd,
              )}
            >
              <section className={layoutStyles.sectionSpacing}>
                {/* End-to-end design systems (bridge from hero into the page) */}
                <ContentWithTitle
                  id={designSystems.href}
                  title={designSystems.title}
                >
                  <Markdown source={designSystems.content} />
                </ContentWithTitle>
              </section>
            </div>

            <div
              className={clsx(
                sectionWrap.section,
                sectionWrap.designSystems,
              )}
            >
              {/* Code Quality Guardrails (with "The case for craft" closing block) */}
              <section className={layoutStyles.sectionSpacing}>
                <Content tag="div" ignoreBottomMargin={true}>
                  <Heading
                    depth={2}
                    id={guardrails.href}
                    ignoreDataUI={true}
                  >
                    {guardrails.title}
                  </Heading>
                  <Markdown source={guardrails.intro} />
                </Content>
                <Content tag="div" ignoreBottomMargin={true}>
                  <Bricks items={guardrailsItems} />
                </Content>
                <Content tag="div">
                  <Markdown source={guardrails.outro} />
                </Content>
              </section>
            </div>

            <div
              className={clsx(
                sectionWrap.bg,
                sectionWrap.section,
                sectionWrap.aboutMe,
              )}
            >
              {/* Summary (About me) */}
              <ContentWithTitle
                id={summary.href}
                title={summary.title}
              >
                <Markdown source={summary.content} />
              </ContentWithTitle>
            </div>

            <div
              className={clsx(
                sectionWrap.section,
                sectionWrap.approach,
              )}
            >
              {/* Approach */}
              <ContentWithTitle
                id={approach.href}
                title={approach.title}
              >
                <Markdown source={approach.content} />
              </ContentWithTitle>
            </div>

            <div
              className={clsx(
                sectionWrap.bg,
                sectionWrap.section,
                sectionWrap.caseStudies,
              )}
            >
              {/* TNB Case Study (recent work, presented first) */}
              <CaseStudy
                id={tnbCaseStudy.href}
                intro={tnbCaseStudy.intro}
                title={tnbCaseStudy.title}
                WordMark={TNBWordmark}
                wordMarkClassName={cg.wordmarkTextNoLogo}
              >
                <Accordion
                  items={tnbCaseStudy.list.map(
                    (study: CaseStudyListItem, index: number) => ({
                      heading: study.title,
                      subHeading: study.subTitle,
                      content: <Markdown source={study.content} />,
                      id: `${baseId}-tnb-${index}`,
                      defaultOpen: index === 0,
                    }),
                  )}
                />
              </CaseStudy>

              {/* Vanilla Case Study (deeper / older arc) */}
              <CaseStudy
                id={caseStudies.href}
                intro={caseStudies.intro}
                title={caseStudies.title}
                wordMarkClassName={cg.wordmarkTextNoLogo}
              >
                <Accordion
                  items={caseStudies.list.map(
                    (study: CaseStudyListItem, index: number) => ({
                      heading: study.title,
                      subHeading: study.subTitle,
                      content: <Markdown source={study.content} />,
                      id: `${baseId}-${index}`,
                      defaultOpen: index === 0,
                    }),
                  )}
                />
              </CaseStudy>
            </div>

            <div
              className={clsx(
                sectionWrap.section,
                sectionWrap.projects,
              )}
            >
              {/* Projects */}
              <section className={layoutStyles.sectionSpacing}>
                <Content tag="div" ignoreBottomMargin={true} >
                  <Heading
                    depth={2}
                    id={projects.href}
                    ignoreDataUI={true}
                  >
                    {projects.title}
                  </Heading>
                </Content>

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
                          className={clsx(
                            cg.logoAsBgSVG,
                            cg.logoAsBg_cc,
                          )}
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
                          className={clsx(
                            cg.logoAsBgSVG,
                            cg.logoAsBg_ea,
                          )}
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
                          className={clsx(
                            cg.logoAsBgSVG,
                            cg.logoAsBg_hs,
                          )}
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
                          className={clsx(
                            cg.logoAsBgSVG,
                            cg.logoAsBg_kg,
                          )}
                        />
                      }
                    >
                      <Markdown source={kingGames.content} />
                    </Card>
                  </Column>
                </Grid>
              </section>
            </div>
          </DeferredIsland>
        </main>
        <DeferredIsland when="idle">
          <Footer
            contact={contact}
            id="contact"
            systemsLink={systemsLink}
          />
        </DeferredIsland>
      </div>
      <DeferredIsland when="idle">
        <ConsoleCuriosity
          title={curiosityMessages.title}
          test={curiosityMessages.test}
          result={curiosityMessages.result}
          hint={curiosityMessages.hint}
          targetHref={curiosityTarget}
        />
      </DeferredIsland>
    </SiteProviders>
  );
}
