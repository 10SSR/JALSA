import { describe, it, expect } from 'vitest';
import {
  EventProfileSchema,
  PartialEventProfileSchema,
  CategoryAllocationSchema,
  TimelineTaskSchema,
  EventRiskSchema,
  EventHealthScoreSchema,
} from './schemas';

describe('Validation Schemas (Single Source of Truth)', () => {
  const validEventProfile = {
    eventType: 'wedding',
    title: 'Ananya & Rohan Royal Wedding',
    date: '2026-12-18',
    city: 'Jaipur',
    cityTier: 'tier2',
    totalBudget: 4500000,
    functions: [
      {
        id: 'fn-sangeet',
        name: 'Sangeet Night',
        type: 'sangeet',
        date: '2026-12-17',
        guestCount: 300,
        venueType: 'indoor',
        timeOfDay: 'night',
      },
      {
        id: 'fn-wedding',
        name: 'Vedic Wedding & Varmala',
        type: 'wedding',
        date: '2026-12-18',
        guestCount: 400,
        venueType: 'hybrid',
        timeOfDay: 'evening',
      },
    ],
    dietaryConstraints: ['pure_veg', 'jain'],
    priorities: ['venue', 'catering', 'photography'],
    venuePreference: 'hybrid',
    religionCultureNotes: 'Traditional Marwari ceremony with Jain food requirements',
    language: 'en',
  };

  it('validates a complete, valid EventProfile successfully', () => {
    const result = EventProfileSchema.safeParse(validEventProfile);
    expect(result.success).toBe(true);
  });

  it('rejects budget below ₹10,000', () => {
    const invalid = { ...validEventProfile, totalBudget: 5000 };
    const result = EventProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const invalid = { ...validEventProfile, date: '18-12-2026' }; // not YYYY-MM-DD
    const result = EventProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects empty functions array', () => {
    const invalid = { ...validEventProfile, functions: [] };
    const result = EventProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative or zero guest count', () => {
    const invalid = {
      ...validEventProfile,
      functions: [
        {
          id: 'fn-test',
          name: 'Haldi',
          type: 'haldi',
          date: '2026-12-17',
          guestCount: 0,
          venueType: 'outdoor',
          timeOfDay: 'morning',
        },
      ],
    };
    const result = EventProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('parses partial profile accurately for conversational intake steps', () => {
    const partial = {
      eventType: 'wedding',
      city: 'Udaipur',
      totalBudget: 3500000,
    };
    const result = PartialEventProfileSchema.safeParse(partial);
    expect(result.success).toBe(true);
  });

  it('validates category allocation structure and verdicts', () => {
    const allocation = {
      category: 'catering',
      label: 'Catering & Dining',
      percentage: 25,
      amount: 1000000,
      perGuestCost: 2500,
      feasibilityVerdict: 'Comfortable',
      why: 'Sufficient budget for 4-star multi-cuisine catering in Tier-2 city',
      benchmarks: {
        minSuggested: 1500,
        idealSuggested: 2500,
        maxSuggested: 4000,
      },
    };
    const result = CategoryAllocationSchema.safeParse(allocation);
    expect(result.success).toBe(true);
  });

  it('validates reverse timeline task structure', () => {
    const task = {
      id: 'task-1',
      title: 'Finalize Palace Venue',
      category: 'venue',
      owner: 'Couple',
      dueDate: '2026-08-01',
      daysBeforeEvent: 140,
      priority: 'critical',
      status: 'pending',
      dependencies: [],
      isCriticalPath: true,
      isOverdue: false,
      isAtRisk: false,
    };
    const result = TimelineTaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('validates risk structure', () => {
    const risk = {
      id: 'risk-monsoon',
      category: 'weather',
      severity: 'high',
      title: 'Monsoon vulnerability with outdoor lawn setup',
      explanation: 'High chance of rain during July outdoor Haldi ceremony.',
      fixSuggestion: 'Book a waterproof German hanger or designate an indoor hall backup.',
      isResolved: false,
    };
    const result = EventRiskSchema.safeParse(risk);
    expect(result.success).toBe(true);
  });

  it('validates health score structure with breakdown and factors', () => {
    const health = {
      overallScore: 88,
      grade: 'A',
      verdict: 'Excellent balance across budget and venue readiness.',
      breakdown: {
        budgetScore: 90,
        timelineScore: 85,
        vendorScore: 80,
        riskScore: 95,
      },
      factors: [
        {
          id: 'hf-1',
          label: 'Contingency fund is healthy (8%)',
          category: 'budget',
          impact: 5,
          status: 'good',
          fixSuggestion: 'Maintain 8% buffer until final vendor settlements.',
        },
      ],
    };
    const result = EventHealthScoreSchema.safeParse(health);
    expect(result.success).toBe(true);
  });
});
