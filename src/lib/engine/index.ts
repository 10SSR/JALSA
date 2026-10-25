import { EventPlan, EventProfile } from '@/lib/validation';
import { calculateBudgetAllocation } from './budget';
import { calculateReverseTimeline } from './timeline';
import { detectEventRisks } from './risks';
import { buildVendorChecklist } from './vendors';
import { generatePersonalizedIdeas } from './ideas';
import { calculateEventHealthScore } from './health';
import { generatePlanBPlaybook } from './planB';

export * from './budget';
export * from './timeline';
export * from './risks';
export * from './vendors';
export * from './ideas';
export * from './health';
export * from './planB';
export * from './simulator';
export * from './templates';

/**
 * Pure TS Master Engine Generator
 * Orchestrates all deterministic engines to produce a complete, validated EventPlan.
 * 100% deterministic, zero external network or React dependency.
 */
export function generateCompleteEventPlan(profile: EventProfile): EventPlan {
  const budget = calculateBudgetAllocation(profile);
  const timeline = calculateReverseTimeline(profile);
  const risks = detectEventRisks(profile);
  const vendors = buildVendorChecklist(profile, budget);
  const ideas = generatePersonalizedIdeas(profile);
  const health = calculateEventHealthScore(budget, timeline, risks, vendors);
  const planB = generatePlanBPlaybook(profile);

  const nowIso = new Date().toISOString();

  return {
    id: `jalsa-plan-${Date.now()}`,
    version: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    profile,
    budget,
    timeline,
    risks,
    vendors,
    ideas,
    health,
    planB,
  };
}
