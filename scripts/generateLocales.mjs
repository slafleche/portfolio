import fs from 'fs';
import path from 'path';

// CONFIG
const SRC_DIR = path.resolve('src', 'lib', 'locales', 'translations'); // your JSONs
const OUT_FILE = path.resolve('src', 'data', 'locales.gen.ts'); // generated TS
const TMP_FILE = OUT_FILE + '.tmp';
const MINIFY = process.env.MINIFY === '0'; // MINIFY=1 yarn locales
const REF_LOCALE = 'en'; // prefer 'en' as reference

// utils
const pretty = (obj) => JSON.stringify(obj, null, MINIFY ? 0 : 2);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// 1) load all locale JSONs
if (!fs.existsSync(SRC_DIR)) throw new Error(`Locales dir missing: ${SRC_DIR}`);
const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.json'));
if (files.length === 0)
  throw new Error(`No *.json locales found in ${SRC_DIR}`);

const entries = files.map((file) => {
  const locale = path.basename(file, '.json');
  const json = readJson(path.join(SRC_DIR, file));

  // require a non-empty "label"
  if (typeof json.label !== 'string' || !json.label.trim()) {
    throw new Error(`Locale "${locale}" is missing a non-empty "label" string`);
  }

  // require all values to be strings (including label)
  for (const [k, v] of Object.entries(json)) {
    if (typeof v !== 'string') {
      throw new Error(`Locale "${locale}" has non-string value at key "${k}"`);
    }
  }

  return [locale, json];
});

// stable order
entries.sort(([a], [b]) => a.localeCompare(b));

// 2) strict key equality across ALL locales (includes "label")
const refEntry = entries.find(([l]) => l === REF_LOCALE) ?? entries[0];
const [refLocale, refJson] = refEntry;
const refKeys = Object.keys(refJson).sort();

let hasIssues = false;
for (const [loc, json] of entries) {
  const keys = Object.keys(json).sort();

  const missing = refKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !refKeys.includes(k));

  if (missing.length || extra.length) {
    hasIssues = true;
    console.error(`\n❌ Inconsistencies in "${loc}" vs "${refLocale}":`);
    if (missing.length) console.error('  Missing keys:', missing.join(', '));
    if (extra.length) console.error('  Extra keys:  ', extra.join(', '));
  }
}
if (hasIssues) process.exit(1); // hard fail before dev/build

// 3) emit generated TS (labels + full translations)
const available = entries.map(([l]) => `"${l}"`).join(', ');
const labels = entries
  .map(([l, json]) => `  "${l}": ${JSON.stringify(json.label)}`)
  .join(',\n');
const translations = entries
  .map(([l, json]) => `  "${l}": ${pretty(json).replace(/\n/g, '\n  ')}`)
  .join(',\n');

const output = `// AUTO-GENERATED FILE — DO NOT EDIT
export const AVAILABLE_LOCALES = [${available}] as const;
export type Locale = typeof AVAILABLE_LOCALES[number];

// Human-readable labels (from each JSON's "label")
export const LOCALE_LABELS: Record<Locale, string> = {
${labels}
};

// Full translations (including "label")
export const TRANSLATIONS = {
${translations}
} as const;
export type Messages = typeof TRANSLATIONS[Locale];
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(TMP_FILE, output, 'utf8');
fs.renameSync(TMP_FILE, OUT_FILE);
console.log('✨ locales.gen.ts updated!');
