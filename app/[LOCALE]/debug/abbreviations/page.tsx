import type { CSSProperties } from 'react';
import { m } from 'css-calipers';
import borders from '@/styles/helpers/borders.helper';
import { backgrounds } from '@/styles/helpers/background.helper';
import { paddings, margins } from '@/styles/helpers/spacing.helper';
import { resolveLocale } from '@/lib/locales/locale';
import { enAbbreviations } from '@/lib/locales/translations/abbreviations/en.abbr';
import { frAbbreviations } from '@/lib/locales/translations/abbreviations/fr.abbr';
import type { AbbrLocaleEntry } from '@/lib/locales/translations/abbrRenderer';

type PageParams = {
  LOCALE: string;
};

type ColumnDescriptor = {
  locale: string;
  label: string;
  entries: Record<string, AbbrLocaleEntry>;
};

const COLUMN_META: ReadonlyArray<ColumnDescriptor> = [
  {
    locale: 'fr',
    label: 'Français',
    entries: frAbbreviations as Record<string, AbbrLocaleEntry>,
  },
  {
    locale: 'en',
    label: 'English',
    entries: enAbbreviations as Record<string, AbbrLocaleEntry>,
  },
];

const orderedKeys = buildOrderedKeys();

function buildOrderedKeys() {
  const order: string[] = [];
  for (const key of Object.keys(enAbbreviations)) {
    order.push(key);
  }
  for (const key of Object.keys(frAbbreviations)) {
    if (!order.includes(key)) {
      order.push(key);
    }
  }
  return order;
}

const pageStyles: Record<string, CSSProperties> = {
  main: {
    minHeight: '100vh',
    ...paddings({
      top: m(64),
      horizontal: m(24),
      bottom: m(96),
    }),
    ...(backgrounds({ color: '#07050e' }) as CSSProperties),
    color: '#f5f0ff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    maxWidth: 1200,
    ...margins({
      vertical: m(0),
      horizontal: 'auto',
    }),
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
  headerPath: {
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 12,
    color: 'rgba(245,240,255,0.6)',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 48,
    ...margins({
      top: m(0),
      horizontal: m(0),
      bottom: m(16),
    }),
  },
  headerIntro: {
    fontSize: 18,
    lineHeight: 1.6,
    maxWidth: 780,
    ...margins(m(0)),
  },
  table: {
    ...borders.all({
      width: m(1),
      color: 'rgba(245,240,255,0.2)',
    }),
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 1fr',
    ...(backgrounds({
      color: 'rgba(255,255,255,0.08)',
    }) as CSSProperties),
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerCell: {
    ...paddings({
      vertical: m(12),
      horizontal: m(16),
    }),
    ...borders.right({
      width: m(1),
      color: 'rgba(255,255,255,0.08)',
    }),
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 1fr',
    ...borders.top({
      width: m(1),
      color: 'rgba(255,255,255,0.08)',
    }),
    ...(backgrounds({
      color: 'rgba(7,5,14,0.9)',
    }) as CSSProperties),
  },
  slugCell: {
    ...paddings(m(16)),
    ...borders.right({
      width: m(1),
      color: 'rgba(255,255,255,0.08)',
    }),
    fontFamily:
      '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 13,
  },
  localeCell: {
    ...paddings(m(16)),
    ...borders.right({
      width: m(1),
      color: 'rgba(255,255,255,0.08)',
    }),
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  localeLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(245,240,255,0.6)',
  },
  abbr: {
    fontSize: 18,
  },
  meta: {
    fontSize: 14,
    lineHeight: 1.5,
    color: 'rgba(245,240,255,0.85)',
  },
};

const blankCellStyle: CSSProperties = {
  ...pageStyles.localeCell,
  ...(backgrounds({
    color: 'rgba(255,255,255,0.02)',
  }) as CSSProperties),
};

export default async function AbbreviationDebugPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);

  return (
    <main style={pageStyles.main}>
      <div style={pageStyles.container}>
        <header>
          <p style={pageStyles.headerPath}>
            /{locale}/debug/abbreviations
          </p>
          <h1 style={pageStyles.headerTitle}>
            Abbreviation Inventory
          </h1>
          <p style={pageStyles.headerIntro}>
            Side-by-side view of every abbreviation entry in both
            locales. Use it to confirm labels, definitions, and
            rendered {'<abbr>'} markup stay aligned. Empty cells
            indicate a missing entry for that locale.
          </p>
        </header>

        <section style={pageStyles.table}>
          <div style={pageStyles.headerRow}>
            <div style={pageStyles.headerCell}>Slug</div>
            {COLUMN_META.map((column) => (
              <div
                key={column.locale}
                style={{
                  ...pageStyles.headerCell,
                  borderRight:
                    column.locale ===
                    COLUMN_META[COLUMN_META.length - 1]?.locale
                      ? 'none'
                      : pageStyles.headerCell.borderRight,
                }}
              >
                {column.label}
              </div>
            ))}
          </div>
          {orderedKeys.map((slug) => (
            <div key={slug} style={pageStyles.row}>
              <div style={pageStyles.slugCell}>
                <code>{slug}</code>
              </div>
              {COLUMN_META.map((column, index) => {
                const entry = column.entries[slug];
                const isLastColumn = index === COLUMN_META.length - 1;
                const cellStyle = {
                  ...(entry ? pageStyles.localeCell : blankCellStyle),
                  borderRight: isLastColumn
                    ? 'none'
                    : pageStyles.localeCell.borderRight,
                };
                return (
                  <div key={column.locale} style={cellStyle}>
                    {entry ? (
                      <>
                        <span style={pageStyles.localeLabel}>
                          {column.label}
                        </span>
                        <abbr
                          title={entry.definition ?? ''}
                          style={pageStyles.abbr}
                        >
                          {entry.label ?? ''}
                        </abbr>
                        <div style={pageStyles.meta}>
                          <strong>Label:</strong> {entry.label ?? '—'}
                        </div>
                        <div style={pageStyles.meta}>
                          <strong>Definition:</strong>{' '}
                          {entry.definition ?? '—'}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
