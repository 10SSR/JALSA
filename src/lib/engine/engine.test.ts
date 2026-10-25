import { describe, it, expect } from 'vitest';
import {
  generateCompleteEventPlan,
  calculateBudgetAllocation,
  calculateReverseTimeline,
  detectEventRisks,
  calculateEventHealthScore,
  simulateTradeOffs,
  isPeakWeddingSeason,
} from './index';
import { EventProfile, VendorChecklistItem } from '@/lib/validation';

describe('Deterministic Decision Engine', () => {
  const baseProfile: EventProfile = {
    eventType: 'wedding',
    title: 'Aditi & Kabir Royal Wedding',
    date: '2026-12-10', // Peak season
    city: 'Jaipur',
    cityTier: 'tier2',
    totalBudget: 5000000,
    functions: [
      {
        id: 'fn-1',
        name: 'Haldi Morning',
        type: 'haldi',
        date: '2026-12-09',
        guestCount: 200,
        venueType: 'outdoor',
        timeOfDay: 'morning',
      },
      {
        id: 'fn-2',
        name: 'Grand Wedding & Reception',
        type: 'wedding',
        date: '2026-12-10',
        guestCount: 400,
        venueType: 'hybrid',
        timeOfDay: 'night',
      },
    ],
    dietaryConstraints: ['pure_veg', 'jain'],
    priorities: ['venue', 'catering', 'photography'],
    venuePreference: 'hybrid',
    religionCultureNotes: 'Traditional ceremonies with Jain dietary needs',
    language: 'en',
  };

  it('generates a complete valid EventPlan across all pillars', () => {
    const plan = generateCompleteEventPlan(baseProfile);
    expect(plan.id).toBeDefined();
    expect(plan.budget.allocations.length).toBeGreaterThan(5);
    expect(plan.timeline.tasks.length).toBeGreaterThan(5);
    expect(plan.risks.length).toBeGreaterThan(0);
    expect(plan.vendors.length).toBeGreaterThan(0);
    expect(plan.ideas.length).toBe(2);
    expect(plan.health.overallScore).toBeGreaterThan(0);
    expect(plan.planB.length).toBe(4);
  });

  describe('Budget Engine & Edge Cases', () => {
    it('accurately calculates per-guest cost and feasibility verdict', () => {
      const budget = calculateBudgetAllocation(baseProfile);
      expect(budget.perGuestTotalCost).toBe(Math.round(5000000 / 400));
      expect(budget.overallVerdict).toBe('Comfortable');
      expect(budget.allocations.some((a) => a.category === 'contingency')).toBe(true);
    });

    it('handles unrealistic low budget per guest', () => {
      const lowProfile = { ...baseProfile, totalBudget: 200000 };
      const budget = calculateBudgetAllocation(lowProfile);
      expect(budget.overallVerdict).toBe('Unrealistic');
    });

    it('handles tight budget per guest', () => {
      // tier 2 floor is 1500, floor * 1.25 = 1875. 400 guests * 1600 = 640000
      const tightProfile = { ...baseProfile, totalBudget: 640000 };
      const budget = calculateBudgetAllocation(tightProfile);
      expect(budget.overallVerdict).toBe('Tight');
    });

    it('boosts priority categories correctly', () => {
      const budget = calculateBudgetAllocation(baseProfile);
      const venueAlloc = budget.allocations.find((a) => a.category === 'venue');
      expect(venueAlloc?.why).toContain('Prioritized by you');
    });

    it('handles non-peak dates and invalid date string gracefully', () => {
      expect(isPeakWeddingSeason('2026-08-15')).toBe(false);
      expect(isPeakWeddingSeason('invalid-date')).toBe(false);
    });
  });

  describe('Timeline Engine & Critical Path', () => {
    it('detects critical path tasks and calculates due dates backwards', () => {
      const timeline = calculateReverseTimeline(baseProfile, '2026-06-01');
      expect(timeline.criticalPathCount).toBeGreaterThan(0);
      const venueTask = timeline.tasks.find((t) => t.category === 'venue');
      expect(venueTask).toBeDefined();
      expect(new Date(venueTask!.dueDate).getTime()).toBeLessThan(
        new Date(baseProfile.date).getTime()
      );
    });

    it('compresses timeline when lead time is very short (< 6 weeks)', () => {
      const timeline = calculateReverseTimeline(baseProfile, '2026-11-20');
      expect(timeline.isCompressed).toBe(true);
      expect(timeline.tasks.some((t) => t.compressionNotice)).toBe(true);
    });
  });

  describe('Risk Detector Engine', () => {
    it('flags peak season vendor scarcity', () => {
      const risks = detectEventRisks(baseProfile, '2026-06-01');
      expect(risks.some((r) => r.id === 'risk-peak-season-scarcity')).toBe(true);
    });

    it('flags monsoon rain hazard for outdoor functions in July', () => {
      const monsoonProfile: EventProfile = {
        ...baseProfile,
        date: '2026-07-15',
        functions: [
          {
            id: 'fn-monsoon',
            name: 'Outdoor Lawn Reception',
            type: 'wedding',
            date: '2026-07-15',
            guestCount: 300,
            venueType: 'outdoor',
            timeOfDay: 'evening',
          },
        ],
      };
      const risks = detectEventRisks(monsoonProfile, '2026-01-01');
      expect(risks.some((r) => r.id === 'risk-weather-monsoon')).toBe(true);
    });

    it('flags extreme summer heat for afternoon outdoor events in May', () => {
      const heatProfile: EventProfile = {
        ...baseProfile,
        date: '2026-05-10',
        functions: [
          {
            id: 'fn-heat',
            name: 'Outdoor Haldi',
            type: 'haldi',
            date: '2026-05-10',
            guestCount: 200,
            venueType: 'outdoor',
            timeOfDay: 'afternoon',
          },
        ],
      };
      const risks = detectEventRisks(heatProfile, '2026-01-01');
      expect(risks.some((r) => r.id === 'risk-weather-heat')).toBe(true);
    });

    it('flags function clash when 3 functions are on same date', () => {
      const clashProfile: EventProfile = {
        ...baseProfile,
        functions: [
          {
            id: '1',
            name: 'Haldi',
            type: 'haldi',
            date: '2026-12-10',
            guestCount: 100,
            venueType: 'indoor',
            timeOfDay: 'morning',
          },
          {
            id: '2',
            name: 'Mehendi',
            type: 'mehendi',
            date: '2026-12-10',
            guestCount: 100,
            venueType: 'indoor',
            timeOfDay: 'afternoon',
          },
          {
            id: '3',
            name: 'Sangeet',
            type: 'sangeet',
            date: '2026-12-10',
            guestCount: 200,
            venueType: 'indoor',
            timeOfDay: 'night',
          },
        ],
      };
      const risks = detectEventRisks(clashProfile, '2026-06-01');
      expect(risks.some((r) => r.category === 'Logistics')).toBe(true);
    });

    it('flags dietary cross-contamination risk when non_veg and jain co-exist', () => {
      const conflictProfile: EventProfile = {
        ...baseProfile,
        dietaryConstraints: ['jain', 'non_veg'],
      };
      const risks = detectEventRisks(conflictProfile, '2026-06-01');
      expect(risks.some((r) => r.id === 'risk-dietary-cross-contamination')).toBe(true);
    });

    it('flags short lead time under 3 weeks as high severity', () => {
      const risks = detectEventRisks(baseProfile, '2026-11-25'); // 15 days left
      const shortRisk = risks.find((r) => r.id === 'risk-short-lead-time');
      expect(shortRisk?.severity).toBe('high');
    });
  });

  describe('Event Health Score Engine', () => {
    it('computes grades across different readiness states', () => {
      const budget = calculateBudgetAllocation(baseProfile);
      const timeline = calculateReverseTimeline(baseProfile, '2026-06-01');
      const risks = detectEventRisks(baseProfile, '2026-06-01');
      const vendors: VendorChecklistItem[] = [
        {
          id: 'v-1',
          category: 'venue',
          categoryLabel: 'Venue',
          allocatedBudget: 1000000,
          status: 'paid',
          questionsToAsk: [],
          redFlags: [],
          negotiationTips: [],
          documentsToCollect: [],
        },
        {
          id: 'v-2',
          category: 'catering',
          categoryLabel: 'Catering',
          allocatedBudget: 1200000,
          status: 'booked',
          questionsToAsk: [],
          redFlags: [],
          negotiationTips: [],
          documentsToCollect: [],
        },
      ];

      const health = calculateEventHealthScore(budget, timeline, risks, vendors);
      expect(health.overallScore).toBeGreaterThan(60);
      expect(health.factors.length).toBeGreaterThan(0);
    });
  });

  describe('What-If Simulator', () => {
    it('computes budget, guest, and health score deltas correctly', () => {
      const plan = generateCompleteEventPlan(baseProfile);
      const diffDown = simulateTradeOffs(plan, 4000000, 300, '2026-12-10');
      expect(diffDown.budgetDelta).toBe(-1000000);
      expect(diffDown.guestDelta).toBe(-100);
      expect(diffDown.tradeOffStatements.length).toBeGreaterThan(0);

      const diffUp = simulateTradeOffs(plan, 6000000, 500, '2026-08-10');
      expect(diffUp.budgetDelta).toBe(1000000);
      expect(diffUp.guestDelta).toBe(100);
      expect(diffUp.tradeOffStatements.length).toBeGreaterThan(0);
    });
  });
});
