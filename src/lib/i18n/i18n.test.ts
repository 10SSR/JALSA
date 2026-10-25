import { describe, it, expect } from 'vitest';
import { getDictionary, en, hi, mr } from './index';

describe('i18n Multilingual Dictionaries (EN / HI / MR)', () => {
  it('loads English dictionary correctly', () => {
    const dict = getDictionary('en');
    expect(dict.brand.title).toBe('JALSA');
    expect(dict.navigation.budget).toBe('Budget');
    expect(dict.common.currencySymbol).toBe('₹');
  });

  it('loads Hindi dictionary correctly', () => {
    const dict = getDictionary('hi');
    expect(dict.brand.title).toContain('जलसा');
    expect(dict.navigation.budget).toBe('बजट योजना');
    expect(dict.common.currencySymbol).toBe('₹');
  });

  it('loads Marathi dictionary correctly', () => {
    const dict = getDictionary('mr');
    expect(dict.brand.title).toContain('जलसा');
    expect(dict.navigation.budget).toBe('बजेट वाटप');
    expect(dict.common.currencySymbol).toBe('₹');
  });

  it('falls back to English when an unrecognised language is passed', () => {
    const dict = getDictionary('fr' as unknown as import('./types').Language);
    expect(dict.brand.title).toBe('JALSA');
  });

  it('ensures dictionaries have non-empty keys across all sections', () => {
    const dictionaries = [en, hi, mr];
    for (const dict of dictionaries) {
      expect(dict.brand.title.length).toBeGreaterThan(0);
      expect(dict.brand.tagline.length).toBeGreaterThan(0);
      expect(dict.intake.welcomeMessage.length).toBeGreaterThan(0);
      expect(dict.budget.verdictComfortable.length).toBeGreaterThan(0);
      expect(dict.health.scoreTitle.length).toBeGreaterThan(0);
      expect(dict.risks.title.length).toBeGreaterThan(0);
      expect(dict.planB.title.length).toBeGreaterThan(0);
      expect(dict.export.pdfDownload.length).toBeGreaterThan(0);
    }
  });
});
