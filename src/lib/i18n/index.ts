import { Language, TranslationDictionary } from './types';
import { en } from './dictionaries/en';
import { hi } from './dictionaries/hi';
import { mr } from './dictionaries/mr';

export * from './types';
export { en, hi, mr };

export const DICTIONARIES: Record<Language, TranslationDictionary> = {
  en,
  hi,
  mr,
};

/**
 * Returns dictionary translations for the specified language, falling back to English.
 */
export function getDictionary(lang: Language = 'en'): TranslationDictionary {
  return DICTIONARIES[lang] || en;
}
