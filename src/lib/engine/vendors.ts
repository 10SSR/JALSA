import { EventProfile, VendorChecklistItem, BudgetEngineOutput } from '@/lib/validation';
import { getEventTemplate } from './templates';

/**
 * Pure TS Vendor Checklist & Pipeline Builder
 * Generates vendor categories with contract negotiation tips, red flags,
 * key interview questions, and connects allocated budgets directly.
 */
export function buildVendorChecklist(
  profile: EventProfile,
  budgetOutput: BudgetEngineOutput
): VendorChecklistItem[] {
  const template = getEventTemplate(profile.eventType);
  const vendorBlueprints = template.vendorBlueprints;

  // Map blueprint to checklist item
  const checklist: VendorChecklistItem[] = vendorBlueprints.map((bp) => {
    const matchingAlloc = budgetOutput.allocations.find((a) => a.category === bp.category);
    const allocatedBudget = matchingAlloc ? matchingAlloc.amount : 0;

    return {
      id: `vendor-${bp.category}`,
      category: bp.category,
      categoryLabel: bp.categoryLabel,
      allocatedBudget,
      actualCost: undefined,
      vendorName: undefined,
      status: 'shortlisted',
      questionsToAsk: bp.questionsToAsk,
      redFlags: bp.redFlags,
      negotiationTips: bp.negotiationTips,
      documentsToCollect: bp.documentsToCollect,
      notes: undefined,
    };
  });

  return checklist;
}
