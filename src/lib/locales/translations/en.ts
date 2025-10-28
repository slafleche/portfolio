import { enData } from './en.data';
import type { LocaleMessagesShape } from '../localeTypes';

export const en = enData satisfies LocaleMessagesShape ? enData : enData;

export type EnMessages = typeof en;

export default en;
