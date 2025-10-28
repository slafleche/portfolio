import { frData } from './fr.data';
import type { LocaleMessagesShape } from '../localeTypes';

export const fr = frData satisfies LocaleMessagesShape ? frData : frData;

export type FrMessages = typeof fr;

export default fr;
