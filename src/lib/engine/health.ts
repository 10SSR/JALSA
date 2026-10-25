import {
  EventHealthScore,
  HealthScoreBreakdown,
  HealthFactorItem,
  BudgetEngineOutput,
  TimelineEngineOutput,
  EventRisk,
  VendorChecklistItem,
} from '@/lib/validation';

/**
 * Pure TS Event Health Score Calculator (0 - 100)
 * Weighted mathematical score across Budget (30%), Timeline (25%), Vendors (25%), Risks (20%).
 */
export function calculateEventHealthScore(
  budget: BudgetEngineOutput,
  timeline: TimelineEngineOutput,
  risks: EventRisk[],
  vendors: VendorChecklistItem[]
): EventHealthScore {
  const factors: HealthFactorItem[] = [];

  // 1. Budget Score (Base 100, weighted 30%)
  let rawBudgetScore = 100;
  if (budget.overallVerdict === 'Unrealistic') {
    rawBudgetScore -= 45;
    factors.push({
      id: 'bf-unrealistic',
      label: 'Budget is unrealistic for guest count and city tier',
      category: 'budget',
      impact: -45,
      status: 'critical',
      fixSuggestion: 'Trim guest list or increase budget to meet realistic minimums (+45 pts).',
    });
  } else if (budget.overallVerdict === 'Tight') {
    rawBudgetScore -= 20;
    factors.push({
      id: 'bf-tight',
      label: 'Budget has tight margins per guest',
      category: 'budget',
      impact: -20,
      status: 'warning',
      fixSuggestion: 'Negotiate fixed per-plate packages to avoid overruns (+20 pts).',
    });
  } else {
    factors.push({
      id: 'bf-comfortable',
      label: 'Budget is well-calibrated and comfortable',
      category: 'budget',
      impact: 0,
      status: 'good',
      fixSuggestion: 'Maintain planned spending caps per category.',
    });
  }

  // Check contingency buffer
  const contingencyPercent = (budget.contingencyBudget / budget.totalBudget) * 100;
  if (contingencyPercent < 7.5) {
    rawBudgetScore -= 10;
    factors.push({
      id: 'bf-contingency-low',
      label: 'Emergency contingency buffer is under 8%',
      category: 'budget',
      impact: -10,
      status: 'warning',
      fixSuggestion:
        'Set aside at least 8% in contingency fund for unexpected surcharges (+10 pts).',
    });
  }

  const budgetScore = Math.max(0, Math.min(100, Math.round(rawBudgetScore)));

  // 2. Timeline Score (Base 100, weighted 25%)
  let rawTimelineScore = 100;
  if (timeline.overdueCount > 0) {
    const penalty = Math.min(40, timeline.overdueCount * 12);
    rawTimelineScore -= penalty;
    factors.push({
      id: 'tf-overdue',
      label: `${timeline.overdueCount} critical tasks are currently overdue`,
      category: 'timeline',
      impact: -penalty,
      status: 'critical',
      fixSuggestion: `Mark overdue tasks as completed or reschedule due dates (+${penalty} pts).`,
    });
  }

  if (timeline.isCompressed) {
    rawTimelineScore -= 15;
    factors.push({
      id: 'tf-compressed',
      label: 'Compressed schedule due to short lead time',
      category: 'timeline',
      impact: -15,
      status: 'warning',
      fixSuggestion: 'Delegate parallel task ownership to family leads (+15 pts).',
    });
  }

  const timelineScore = Math.max(0, Math.min(100, Math.round(rawTimelineScore)));

  // 3. Vendor Score (Base 100, weighted 25%)
  // Based on progress in pipeline: Shortlisted (25%), Quoted (50%), Booked (85%), Paid (100%)
  let vendorProgressSum = 0;
  const totalVendors = Math.max(1, vendors.length);

  for (const v of vendors) {
    if (v.status === 'paid') vendorProgressSum += 100;
    else if (v.status === 'booked') vendorProgressSum += 85;
    else if (v.status === 'quoted') vendorProgressSum += 50;
    else vendorProgressSum += 25; // shortlisted
  }

  const vendorScore = Math.max(0, Math.min(100, Math.round(vendorProgressSum / totalVendors)));
  if (vendorScore < 60) {
    factors.push({
      id: 'vf-unbooked',
      label: 'Primary vendors are still in shortlisting stage',
      category: 'vendors',
      impact: -(60 - vendorScore),
      status: 'warning',
      fixSuggestion:
        'Advance shortlisted vendors to Booked status by paying booking tokens (+25 pts).',
    });
  } else {
    factors.push({
      id: 'vf-progressing',
      label: 'Vendor onboarding is on track',
      category: 'vendors',
      impact: 0,
      status: 'good',
      fixSuggestion: 'Finalize service level contracts and receipt copies.',
    });
  }

  // 4. Risk Score (Base 100, weighted 20%)
  let rawRiskScore = 100;
  const unresolvedRisks = risks.filter((r) => !r.isResolved);

  for (const r of unresolvedRisks) {
    if (r.severity === 'high') rawRiskScore -= 25;
    else if (r.severity === 'medium') rawRiskScore -= 12;
    else rawRiskScore -= 5;
  }

  if (unresolvedRisks.length > 0) {
    factors.push({
      id: 'rf-unresolved',
      label: `${unresolvedRisks.length} unresolved event conflicts identified`,
      category: 'risks',
      impact: Math.max(-100, rawRiskScore - 100),
      status: unresolvedRisks.some((r) => r.severity === 'high') ? 'critical' : 'warning',
      fixSuggestion: 'Apply one-click recommendations in the Risks watchdog panel to boost score.',
    });
  } else {
    factors.push({
      id: 'rf-clean',
      label: 'Zero unresolved operational risks',
      category: 'risks',
      impact: 0,
      status: 'good',
      fixSuggestion: 'Risk watchdog is active and clear.',
    });
  }

  const riskScore = Math.max(0, Math.min(100, Math.round(rawRiskScore)));

  // Weighted overall calculation
  // Budget (30%) + Timeline (25%) + Vendors (25%) + Risks (20%)
  const overallScore = Math.round(
    budgetScore * 0.3 + timelineScore * 0.25 + vendorScore * 0.25 + riskScore * 0.2
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A';
  let verdict = 'Celebration readiness is in excellent shape.';

  if (overallScore >= 92) {
    grade = 'A+';
    verdict = 'Outstanding event readiness. All operational pillars are rock solid!';
  } else if (overallScore >= 80) {
    grade = 'A';
    verdict = 'Robust celebration plan. Minor vendor settlements remaining.';
  } else if (overallScore >= 65) {
    grade = 'B';
    verdict = 'Good foundation, but attention needed on overdue tasks and vendor locks.';
  } else if (overallScore >= 50) {
    grade = 'C';
    verdict = 'Moderate risk exposure. Budget or timeline compression requires active fixes.';
  } else {
    grade = 'D';
    verdict = 'High vulnerability. Significant corrective action needed before contracts.';
  }

  const breakdown: HealthScoreBreakdown = {
    budgetScore,
    timelineScore,
    vendorScore,
    riskScore,
  };

  return {
    overallScore,
    grade,
    verdict,
    breakdown,
    factors,
  };
}
