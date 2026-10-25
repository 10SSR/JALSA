import { EventProfile, EventRisk, RiskSeverity } from '@/lib/validation';
import { getEventTemplate } from './templates';
import { isPeakWeddingSeason } from './budget';

/**
 * Pure TS Risk and Conflict Detection Engine
 * Scans user event profile and function layout against deterministic risk rules.
 */
export function detectEventRisks(profile: EventProfile, referenceDateStr?: string): EventRisk[] {
  const risks: EventRisk[] = [];
  const template = getEventTemplate(profile.eventType);
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const eventDate = new Date(profile.date);

  const maxGuests = Math.max(1, ...profile.functions.map((f) => f.guestCount || 100));
  const perGuestBudget = Math.round(profile.totalBudget / maxGuests);
  const floor = template.tierCostPerGuestFloor[profile.cityTier] || 1500;

  // Rule 1: Budget too low per guest for city tier
  if (perGuestBudget < floor) {
    risks.push({
      id: 'risk-budget-deficit',
      category: 'Budget',
      severity: 'high',
      title: 'Per-Guest Budget Severely Below City Tier Baseline',
      explanation: `Current budget yields ₹${perGuestBudget.toLocaleString('en-IN')}/guest, below the ₹${floor.toLocaleString('en-IN')} realistic minimum for ${profile.cityTier.toUpperCase()} (${profile.city}). Risk of subpar caterer quality or venue rejection.`,
      fixSuggestion: `Optimize guest list by 15-20% or reallocate ₹${((floor - perGuestBudget) * maxGuests).toLocaleString('en-IN')} to ensure essential hospitality standards.`,
      actionKey: 'optimize_guests',
      isResolved: false,
    });
  } else if (perGuestBudget < floor * 1.25) {
    risks.push({
      id: 'risk-budget-tight',
      category: 'Budget',
      severity: 'medium',
      title: 'Tight Budget Buffer for City Tier',
      explanation: `Budget per guest is close to the threshold. Unforeseen decor surcharges or electricity generator bills may cause overruns.`,
      fixSuggestion: 'Lock all-inclusive fixed quotes with caterers and avoid per-item add-ons.',
      actionKey: 'lock_quotes',
      isResolved: false,
    });
  }

  // Rule 2: Monsoon or Extreme Heat with Outdoor / Hybrid Venues
  const eventMonth = eventDate.getMonth() + 1; // 1-12
  const hasOutdoorFunction = profile.functions.some(
    (fn) => fn.venueType === 'outdoor' || fn.venueType === 'hybrid'
  );

  const isMonsoon = eventMonth >= 6 && eventMonth <= 9; // June to Sept
  const isExtremeHeat = eventMonth >= 4 && eventMonth <= 5; // April to May

  if (hasOutdoorFunction && isMonsoon) {
    risks.push({
      id: 'risk-weather-monsoon',
      category: 'Weather',
      severity: 'high',
      title: 'Monsoon Rain & Slush Hazard for Outdoor Staging',
      explanation: `Event is scheduled during peak monsoon (Month: ${eventMonth}) with outdoor/hybrid functions. Risk of waterlogged lawns, electrical short-circuits, and ruined floral setups.`,
      fixSuggestion:
        'Contract a water-resistant German canopy structure with raised wooden decking and dedicated generator grounding.',
      actionKey: 'book_rain_canopy',
      isResolved: false,
    });
  } else if (hasOutdoorFunction && isExtremeHeat) {
    const afternoonFunction = profile.functions.find(
      (fn) =>
        (fn.venueType === 'outdoor' || fn.venueType === 'hybrid') &&
        (fn.timeOfDay === 'afternoon' || fn.timeOfDay === 'morning')
    );
    if (afternoonFunction) {
      risks.push({
        id: 'risk-weather-heat',
        category: 'Weather',
        severity: 'medium',
        title: 'High Afternoon Heat Exposure for Guests',
        explanation: `${afternoonFunction.name} is scheduled outdoors during peak summer afternoon. Risk of guest dehydration, makeup melting, and food spoilage.`,
        fixSuggestion:
          'Deploy mist cooling fans, shaded canopies, and continuous chilled welcome hydration counters (Aam Panna / Coconut water).',
        actionKey: 'add_cooling',
        isResolved: false,
      });
    }
  }

  // Rule 3: Peak Season Vendor Scarcity
  if (isPeakWeddingSeason(profile.date)) {
    risks.push({
      id: 'risk-peak-season-scarcity',
      category: 'Vendors',
      severity: 'medium',
      title: 'Peak Wedding Muhurat Scarcity & Surcharges',
      explanation: `Dates in Nov-Feb coincide with pan-India auspicious muhurats. Top tier photographers, makeup artists, and brass bands get booked 6 months in advance with 20-30% premium pricing.`,
      fixSuggestion:
        'Place 25% token deposits on primary vendors immediately to lock calendar dates and standard non-surge rates.',
      actionKey: 'lock_peak_vendors',
      isResolved: false,
    });
  }

  // Rule 4: Lead Time Under 6 Weeks (< 42 days)
  const diffTime = eventDate.getTime() - now.getTime();
  const leadTimeDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (leadTimeDays < 42) {
    const severity: RiskSeverity = leadTimeDays < 21 ? 'high' : 'medium';
    risks.push({
      id: 'risk-short-lead-time',
      category: 'Timeline',
      severity,
      title: `Critical Short Lead Time (${Math.max(1, Math.round(leadTimeDays / 7))} Weeks Left)`,
      explanation: `Custom bridal trousseau, physical invitation dispatch, and specialized decor fabrication usually require at least 8 to 12 weeks lead time.`,
      fixSuggestion:
        'Switch immediately to digital animated video invitations and ready-to-wear designer collections with in-stock sizing.',
      actionKey: 'switch_digital_invites',
      isResolved: false,
    });
  }

  // Rule 5: Clashing Functions / Tight Turnaround on the Same Day
  const datesMap: Record<string, string[]> = {};
  for (const fn of profile.functions) {
    if (!datesMap[fn.date]) datesMap[fn.date] = [];
    datesMap[fn.date].push(fn.name);
  }

  for (const [date, fns] of Object.entries(datesMap)) {
    if (fns.length >= 3) {
      risks.push({
        id: `risk-function-clash-${date}`,
        category: 'Logistics',
        severity: 'high',
        title: `Heavy Function Congestion (${fns.length} events on ${date})`,
        explanation: `Scheduled functions [${fns.join(', ')}] on the same day create acute fatigue for couple and family, plus impossible turnover times for makeup and decor.`,
        fixSuggestion:
          'Separate rituals with minimum 4-hour rest gaps or stagger mehendi/haldi across consecutive days.',
        actionKey: 'stagger_functions',
        isResolved: false,
      });
      break;
    }
  }

  // Rule 6: Dietary Conflicts (e.g., Non-Veg requested alongside strict Jain or pure_veg without segregation)
  const dietary = profile.dietaryConstraints || [];
  const hasJain = dietary.includes('jain');
  const hasNonVeg = dietary.includes('non_veg');
  const hasPureVeg = dietary.includes('pure_veg');

  if ((hasJain || hasPureVeg) && hasNonVeg) {
    risks.push({
      id: 'risk-dietary-cross-contamination',
      category: 'Catering',
      severity: 'high',
      title: 'Dietary Cross-Contamination & Cultural Sensitivity Risk',
      explanation:
        'Menu requests both non-vegetarian dishes alongside strict Jain/Pure-Veg items. Risk of guest alienation if shared cookware or serving utensils are used.',
      fixSuggestion:
        'Contract strict kitchen compartmentalization: separate prep tables, distinct colored crockery, and physically segregated live buffet counters.',
      actionKey: 'segregate_kitchens',
      isResolved: false,
    });
  }

  return risks;
}
