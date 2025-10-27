import { SkipNavContent } from '@/components/SkipNavContent';
import Footer from '@/components/Footer';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { BASE_ANCHORS } from '@/components/menu/menuUtils';
import * as layoutStyles from '@/styles/layout.css';
import type { PageParams } from '@/styles/helpers/types';

type SystemsPageProps = {
    params: Promise<PageParams>;
};

export default async function SystemsPage({ params }: SystemsPageProps) {
    const { LOCALE } = await params;
    const translator = await loadTranslator(LOCALE);

    const contactCopy = buildContactCopy(translator);
    const sectionEntries = BASE_ANCHORS.map(({ hrefKey, labelKey }) => ({
        id: translator(hrefKey),
        label: translator(labelKey),
    }));

    return (
        <SkipNavContent id="body">
            <div className={layoutStyles.page}>
                <main className={layoutStyles.main}>
                    {sectionEntries.map((entry) => (
                        <section
                            key={entry.id}
                            id={entry.id}
                            className={layoutStyles.content}
                        >
                            <h2>{entry.label}</h2>
                            <p>
                                {`Additional details about ${entry.label} will be available soon.`}
                            </p>
                        </section>
                    ))}
                </main>
                <Footer contact={contactCopy} id={contactCopy.href} />
            </div>
        </SkipNavContent>
    );
}
