import { SkipNavContent } from '@/components/SkipNavContent';
import Hero from '@/components/Hero';
import Content from '@/components/responsive/Content';
import CaseStudy from '@/components/CaseStudy';
import { Grid, Column } from '@/components/Grid';
import Card from '@/components/Card';
import { Markdown } from '@/components/Markdown';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import * as layoutStyles from '@/styles/layout.css';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildCaseStudiesCopy } from '@/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '@/lib/locales/sections/projects.locale';
import { buildAboutCopy } from '@/lib/locales/sections/about.locale';
import { buildApproachCopy } from '@/lib/locales/sections/approach.locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { sharedStrings } from '@/lib/sharedStrings';

interface PageParams {
  LOCALE: string;
}

export default async function HomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const translator = await loadTranslator(LOCALE);

  const heroCopy = buildHeroCopy(translator);
  const approach = buildApproachCopy(translator);
  const about = buildAboutCopy(translator);
  const caseStudies = buildCaseStudiesCopy(translator);
  const projects = buildProjectsCopy(translator);
  const contact = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(LOCALE, translator);

  return (
    <SkipNavContent id="body">
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero
            id="hero"
            ctaHref={`#${contact.href}`}
            copy={heroCopy}
          />
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
          <ContactButton
            watchId="hero"
            href={sharedStrings.mailtoEmail}
            label={heroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </SkipNavContent>
  );
}
