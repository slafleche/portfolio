import { parseSplit } from '../../lib/locales/translations/splitShortcodes';
import { toTrimmedOrNull } from '../../lib/stringUtils';

export default function splitText(text: string) {
  const data = parseSplit(text);
  const firstLine = toTrimmedOrNull(data.first);
  const secondLine = toTrimmedOrNull(data.second);
  const fullText = toTrimmedOrNull(
    [firstLine, secondLine].filter(Boolean).join(' '),
  );
  return { lastLine: firstLine, secondLine, fullText };
}
