import { SkipNavContent } from '@/components/SkipNavContent';
import Hero from '@/components/Hero';
import type { PageParams } from '../../src/styles/helpers/types';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildCaseStudiesCopy } from '../../src/lib/locales/sections/caseStudies.locale';
import { buildProjectsCopy } from '../../src/lib/locales/sections/projects.locale';
import { buildAboutCopy } from '../../src/lib/locales/sections/about.locale';
import { buildApproachCopy } from '../../src/lib/locales/sections/approach.locale';
import { buildContactCopy } from '../../src/lib/locales/sections/contact.locale';
import Content from '../../src/components/responsive/Content';
import CaseStudy from '@/components/CaseStudy';
import { Grid, Column } from '@/components/Grid';
import Card from '@/components/Card';
import { Markdown } from '@/components/Markdown';
import Footer from '../../src/components/Footer';
import ContactButton from '@/components/ContactButton';
import * as layoutStyles from '@/styles/layout.css';

export default async function HomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const t = await loadTranslator(LOCALE);

  const heroCopy = buildHeroCopy(t);
  const approach = buildApproachCopy(t);
  const about = buildAboutCopy(t);
  const caseStudies = buildCaseStudiesCopy(t);
  const projects = buildProjectsCopy(t);
  const contact = buildContactCopy(t);

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
        <Footer contact={contact} id={contact.href} />
        {heroCopy.ctaLabel ? (
          <ContactButton
            watchId="hero"
            href={`#${contact.href}`}
            label={heroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </SkipNavContent>
  );
}
