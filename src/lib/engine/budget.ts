import {
  EventProfile,
  BudgetEngineOutput,
  CategoryAllocation,
  ExpenseCategory,
  FeasibilityVerdict,
} from '@/lib/validation';
import { getEventTemplate } from './templates';

/**
 * Peak wedding months in India (Nov, Dec, Jan, Feb) with high vendor inflation
 */
export function isPeakWeddingSeason(dateStr: string): boolean {
  try {
    const month = new Date(dateStr).getMonth() + 1;
    return month === 11 || month === 12 || month === 1 || month === 2;
  } catch {
    return false;
  }
}

/**
 * Pure TS Budget Decision Engine
 * Allocates budget using weighted multi-factor logic (city tier, guest count, season, user priorities)
 */
export function calculateBudgetAllocation(profile: EventProfile): BudgetEngineOutput {
  const template = getEventTemplate(profile.eventType);
  const totalBudget = Math.max(10000, profile.totalBudget);

  // Calculate maximum guest count across all functions for overall per-guest budgeting
  const maxGuests = Math.max(1, ...profile.functions.map((fn) => fn.guestCount || 100));

  const floorPerGuest = template.tierCostPerGuestFloor[profile.cityTier] || 1500;
  const actualPerGuest = Math.round(totalBudget / maxGuests);

  // Overall Feasibility Verdict
  let overallVerdict: FeasibilityVerdict = 'Comfortable';
  let verdictReason = `Budget allows approx ₹${actualPerGuest.toLocaleString('en-IN')} per guest, which provides comfortable flexibility for ${profile.cityTier.toUpperCase()} venues and premium hospitality.`;

  if (actualPerGuest < floorPerGuest) {
    overallVerdict = 'Unrealistic';
    verdictReason = `Average allocation of ₹${actualPerGuest.toLocaleString('en-IN')} per guest is below the recommended minimum ₹${floorPerGuest.toLocaleString('en-IN')} for ${profile.cityTier.toUpperCase()}. Consider reducing guest count, selecting community banquet venues, or increasing total budget.`;
  } else if (actualPerGuest < floorPerGuest * 1.35) {
    overallVerdict = 'Tight';
    verdictReason = `Average allocation of ₹${actualPerGuest.toLocaleString('en-IN')} per guest is workable but tight for ${profile.cityTier.toUpperCase()}. Careful vendor negotiation and strict menu curation are essential.`;
  }

  // Adjust Category Weights based on priorities and peak season
  const isPeak = isPeakWeddingSeason(profile.date);
  const adjustedWeights: Record<ExpenseCategory, number> = { ...template.baseCategoryWeights };

  // Boost priority categories selected by user (+3% to priority categories, normalized later)
  if (profile.priorities && profile.priorities.length > 0) {
    for (const prio of profile.priorities) {
      if (adjustedWeights[prio] !== undefined) {
        adjustedWeights[prio] += 3;
      }
    }
  }

  // Peak season vendor inflation (Venue & Photography get +2%)
  if (isPeak) {
    adjustedWeights.venue = (adjustedWeights.venue || 20) + 2;
    adjustedWeights.photography = (adjustedWeights.photography || 8) + 1;
  }

  // Normalize weights so they sum to 100%
  const totalWeightSum = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
  const normalizedPercentages: Record<ExpenseCategory, number> = {} as Record<
    ExpenseCategory,
    number
  >;

  for (const cat of Object.keys(adjustedWeights) as ExpenseCategory[]) {
    normalizedPercentages[cat] = Number(((adjustedWeights[cat] / totalWeightSum) * 100).toFixed(1));
  }

  // Category labels and "why" rationales
  const categoryLabels: Record<ExpenseCategory, string> = {
    venue: 'Venue & Banquet Rental',
    catering: 'Catering & Dining Feasts',
    decor: 'Decor & Mandap Production',
    photography: 'Photography & Cinema',
    attire_jewellery: 'Ceremonial Attire & Jewellery',
    music_entertainment: 'DJ, Live Band & Sound',
    makeup_mehendi: 'Bridal Makeup & Mehendi Art',
    invitations_stationery: 'Invitations & Digital RSVP',
    logistics_accommodation: 'Guest Accommodation & Cabs',
    rituals_pandit: 'Rituals, Pandit & Samagri',
    gifts_favors: 'Return Gifts & Mithai Hampers',
    contingency: 'Emergency Contingency Fund',
  };

  const allocations: CategoryAllocation[] = (
    Object.keys(normalizedPercentages) as ExpenseCategory[]
  ).map((cat) => {
    const percent = normalizedPercentages[cat];
    const amount = Math.round((totalBudget * percent) / 100);
    const catPerGuest = Math.round(amount / maxGuests);

    // Benchmarks
    const minSuggested = Math.round((amount * 0.85) / maxGuests);
    const idealSuggested = catPerGuest;
    const maxSuggested = Math.round((amount * 1.2) / maxGuests);

    // Feasibility per category
    let catVerdict: FeasibilityVerdict = 'Comfortable';
    if (overallVerdict === 'Unrealistic') {
      catVerdict = 'Unrealistic';
    } else if (overallVerdict === 'Tight') {
      catVerdict = 'Tight';
    }

    // Engine generated "Why" rationale
    let why = `${percent}% allocated based on ${profile.cityTier.toUpperCase()} market averages for ${maxGuests} guests.`;
    if (profile.priorities?.includes(cat)) {
      why = `Prioritized by you: boosted to ${percent}% to ensure superior quality and premier vendor availability.`;
    } else if (cat === 'contingency') {
      why = `Mandatory ${percent}% emergency buffer reserved for last-minute guest surges, vendor overtime, and municipal permits.`;
    } else if (cat === 'venue' && isPeak) {
      why = `Adjusted +2% for peak celebration season (Nov-Feb) venue scarcity in ${profile.city}.`;
    } else if (cat === 'catering' && profile.dietaryConstraints?.includes('jain')) {
      why = `Includes allocation for separate Jain culinary prep counters and customized roots-free banquet stations.`;
    }

    return {
      category: cat,
      label: categoryLabels[cat] || cat,
      percentage: percent,
      amount,
      perGuestCost: catPerGuest,
      feasibilityVerdict: catVerdict,
      why,
      benchmarks: {
        minSuggested,
        idealSuggested,
        maxSuggested,
      },
    };
  });

  const contingencyAllocation = allocations.find((a) => a.category === 'contingency');
  const contingencyBudget = contingencyAllocation
    ? contingencyAllocation.amount
    : Math.round(totalBudget * 0.08);
  const allocatedBudget = totalBudget - contingencyBudget;

  return {
    totalBudget,
    allocatedBudget,
    contingencyBudget,
    perGuestTotalCost: actualPerGuest,
    overallVerdict,
    verdictReason,
    allocations,
    currency: 'INR',
    formattedTotal: `₹${(totalBudget / 100000).toFixed(1)} Lakhs`,
  };
}
