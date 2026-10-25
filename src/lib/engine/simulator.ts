import { EventPlan, EventProfile } from '@/lib/validation';
import { calculateBudgetAllocation, isPeakWeddingSeason } from './budget';
import { calculateReverseTimeline } from './timeline';
import { detectEventRisks } from './risks';
import { calculateEventHealthScore } from './health';

export interface WhatIfDiffResult {
  simulatedBudget: number;
  simulatedGuests: number;
  simulatedDate: string;
  budgetDelta: number;
  guestDelta: number;
  daysDelta: number;
  oldHealthScore: number;
  newHealthScore: number;
  healthScoreDelta: number;
  oldVerdict: string;
  newVerdict: string;
  tradeOffStatements: string[];
  categoryDeltas: Array<{
    category: string;
    label: string;
    oldAmount: number;
    newAmount: number;
    deltaAmount: number;
    percentage: number;
  }>;
}

/**
 * Pure TS What-If Simulator Engine
 * Computes instant deterministic diffs and trade-offs when user slides budget, guests, or date.
 */
export function simulateTradeOffs(
  basePlan: EventPlan,
  newBudget: number,
  newGuests: number,
  newDate: string
): WhatIfDiffResult {
  const baseProfile = basePlan.profile;
  const baseMaxGuests = Math.max(1, ...baseProfile.functions.map((f) => f.guestCount || 100));

  // Clone profile with simulated variables
  const simulatedProfile: EventProfile = {
    ...baseProfile,
    totalBudget: newBudget,
    date: newDate,
    functions: baseProfile.functions.map((fn) => ({
      ...fn,
      guestCount: Math.round(fn.guestCount * (newGuests / baseMaxGuests)),
      date: newDate,
    })),
  };

  // Re-run engines
  const newBudgetOutput = calculateBudgetAllocation(simulatedProfile);
  const newTimelineOutput = calculateReverseTimeline(simulatedProfile);
  const newRisks = detectEventRisks(simulatedProfile);
  const newHealth = calculateEventHealthScore(
    newBudgetOutput,
    newTimelineOutput,
    newRisks,
    basePlan.vendors
  );

  const budgetDelta = newBudget - baseProfile.totalBudget;
  const guestDelta = newGuests - baseMaxGuests;

  const baseDateObj = new Date(baseProfile.date);
  const newDateObj = new Date(newDate);
  const daysDelta = Math.round(
    (newDateObj.getTime() - baseDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  const healthScoreDelta = newHealth.overallScore - basePlan.health.overallScore;

  // Synthesize Trade-off Statements
  const tradeOffStatements: string[] = [];

  if (budgetDelta < -200000) {
    tradeOffStatements.push(
      `Budget reduced by ₹${Math.abs(budgetDelta).toLocaleString('en-IN')}: Live brass band replaced with curated DJ console; Mandap transitions from imported florals to elegant Indian rajnigandha & marigolds.`
    );
  } else if (budgetDelta > 200000) {
    tradeOffStatements.push(
      `Budget expanded by ₹${budgetDelta.toLocaleString('en-IN')}: Unlocks high-end candid cinema teaser and enables 2 additional live interactive dessert stations.`
    );
  }

  if (guestDelta > 50) {
    tradeOffStatements.push(
      `Adding ${guestDelta} guests increases catering burden; requires expanding banquet seating capacity and adding 2 auxiliary valet drivers.`
    );
  } else if (guestDelta < -50) {
    tradeOffStatements.push(
      `Trimming ${Math.abs(guestDelta)} guests frees up ₹${Math.round(Math.abs(guestDelta) * newBudgetOutput.perGuestTotalCost).toLocaleString('en-IN')} which can upgrade bridal trousseau or premium return hampers.`
    );
  }

  const baseWasPeak = isPeakWeddingSeason(baseProfile.date);
  const newIsPeak = isPeakWeddingSeason(newDate);
  if (!baseWasPeak && newIsPeak) {
    tradeOffStatements.push(
      `Moving date into peak wedding season (Nov-Feb) incurs 15-20% vendor surge rates in ${baseProfile.city}.`
    );
  } else if (baseWasPeak && !newIsPeak) {
    tradeOffStatements.push(
      `Moving date to shoulder season unlocks ~12% off-peak banquet discount and superior vendor availability.`
    );
  }

  if (tradeOffStatements.length === 0) {
    tradeOffStatements.push(
      'Balanced configuration: adjustments remain within recommended operational margins.'
    );
  }

  // Category Deltas
  const categoryDeltas = newBudgetOutput.allocations.map((newAlloc) => {
    const oldAlloc = basePlan.budget.allocations.find((a) => a.category === newAlloc.category);
    const oldAmount = oldAlloc ? oldAlloc.amount : 0;
    return {
      category: newAlloc.category,
      label: newAlloc.label,
      oldAmount,
      newAmount: newAlloc.amount,
      deltaAmount: newAlloc.amount - oldAmount,
      percentage: newAlloc.percentage,
    };
  });

  return {
    simulatedBudget: newBudget,
    simulatedGuests: newGuests,
    simulatedDate: newDate,
    budgetDelta,
    guestDelta,
    daysDelta,
    oldHealthScore: basePlan.health.overallScore,
    newHealthScore: newHealth.overallScore,
    healthScoreDelta,
    oldVerdict: basePlan.budget.overallVerdict,
    newVerdict: newBudgetOutput.overallVerdict,
    tradeOffStatements,
    categoryDeltas,
  };
}
