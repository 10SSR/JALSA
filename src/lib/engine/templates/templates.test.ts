import { describe, it, expect } from 'vitest';
import { getEventTemplate, TEMPLATES } from './index';

describe('Event Templates Configuration (Vertical Agnostic)', () => {
  it('provides wedding, birthday, and community templates', () => {
    expect(TEMPLATES.wedding).toBeDefined();
    expect(TEMPLATES.birthday).toBeDefined();
    expect(TEMPLATES.community).toBeDefined();
  });

  it('wedding template category weights sum up to exactly 100%', () => {
    const wedding = TEMPLATES.wedding;
    const totalWeight = Object.values(wedding.baseCategoryWeights).reduce(
      (sum, val) => sum + val,
      0
    );
    expect(totalWeight).toBeCloseTo(100, 1);
  });

  it('wedding template includes multi-function timeline (Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception)', () => {
    const wedding = TEMPLATES.wedding;
    const functionTypes = wedding.defaultFunctions.map((f) => f.type);
    expect(functionTypes).toContain('engagement');
    expect(functionTypes).toContain('mehendi');
    expect(functionTypes).toContain('haldi');
    expect(functionTypes).toContain('sangeet');
    expect(functionTypes).toContain('wedding');
    expect(functionTypes).toContain('reception');
  });

  it('wedding template contains vendor blueprints with questions, red flags, and negotiation tips', () => {
    const wedding = TEMPLATES.wedding;
    expect(wedding.vendorBlueprints.length).toBeGreaterThanOrEqual(5);

    for (const vendor of wedding.vendorBlueprints) {
      expect(vendor.questionsToAsk.length).toBeGreaterThan(0);
      expect(vendor.redFlags.length).toBeGreaterThan(0);
      expect(vendor.negotiationTips.length).toBeGreaterThan(0);
      expect(vendor.documentsToCollect.length).toBeGreaterThan(0);
    }
  });

  it('template fallback returns wedding template for unknown vertical', () => {
    const fallback = getEventTemplate(
      'corporate' as unknown as import('@/lib/validation').EventType
    );
    expect(fallback.eventType).toBe('wedding');
  });
});
