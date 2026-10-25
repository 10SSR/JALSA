import { EventProfile, PlanBScenario } from '@/lib/validation';

/**
 * Pure TS Plan B Contingency Generator
 * Generates actionable mitigation playbooks for 4 major celebration crises:
 * weather anomalies, vendor drop-out, budget overrun, and sudden guest surges.
 */
export function generatePlanBPlaybook(profile: EventProfile): PlanBScenario[] {
  const maxGuests = Math.max(1, ...profile.functions.map((f) => f.guestCount || 100));

  return [
    {
      id: 'planb-weather',
      triggerType: 'weather_rain_heat',
      title: 'Monsoon Torrential Rain or Sudden Heatwave',
      severity: 'high',
      triggerCondition:
        'Weather forecast predicts >60% precipitation or ambient temperature exceeds 40°C within 48h of event.',
      immediateActionSteps: [
        'Activate backup German water-resistant canopy with raised platform flooring.',
        'Shift all outdoor sound consoles and LED stage walls to covered indoor halls.',
        'Deploy heavy industrial spot-coolers / misting fans along high-traffic corridors.',
        'Issue updated WhatsApp arrival gate and sheltered valet instructions to all guests.',
      ],
      resourceRequirements: [
        'Pre-reserved German hanger vendor on 12-hour mobilization standby.',
        '2x 125 KVA silent diesel generator units with moisture-proof cable shielding.',
        '100 branded umbrellas at the arrival portico for guest escorts.',
      ],
      costImpactEstimate: '₹45,000 - ₹95,000 (drawn from Contingency Reserve)',
    },
    {
      id: 'planb-vendor-dropout',
      triggerType: 'vendor_dropout',
      title: 'Key Vendor Last-Minute Cancellation (Caterer / DJ / Lead Photographer)',
      severity: 'high',
      triggerCondition:
        'Contracted primary vendor falls ill or communicates inability to perform < 7 days before event.',
      immediateActionSteps: [
        'Trigger pre-vetted Tier-2 emergency supplier roster from JALSA vendor network.',
        'Provide standardized menu sheet and audio timeline rider immediately via cloud link.',
        'Transfer initial advance payment from disputed vendor escrow to replacement team.',
      ],
      resourceRequirements: [
        'Signed mutual non-performance penalty clause in original contract for immediate refund.',
        'Backup local vendor registry contacts with direct owner phone numbers.',
      ],
      costImpactEstimate: '0% - 15% rush premium (recoverable via contract cancellation clause)',
    },
    {
      id: 'planb-budget-overrun',
      triggerType: 'budget_overrun',
      title: 'Cumulative Vendor Invoices Exceeding Total Budget (> 10%)',
      severity: 'medium',
      triggerCondition:
        'Aggregate category quotations surpass authorized total ceiling by > ₹1,00,000.',
      immediateActionSteps: [
        'Apply the 80/20 rule: scale back non-essential production elements (pyrotechnics, exotic floral imports).',
        'Consolidate multi-day sound equipment hire into a single comprehensive package.',
        'Switch printed stationery and elaborate physical invites to dynamic interactive web invites.',
        'Repurpose daytime Haldi floral props for evening photo booth backdrops.',
      ],
      resourceRequirements: [
        'Itemized line-item audit sheet with discretionary items flagged for instant deselect.',
      ],
      costImpactEstimate: 'Saves 8% - 14% on total expenditure within 24 hours',
    },
    {
      id: 'planb-guest-surge',
      triggerType: 'guest_surge',
      title: `Surge in Extended Families & Unconfirmed RSVPs (+${Math.round(maxGuests * 0.2)} guests)`,
      severity: 'medium',
      triggerCondition: 'Physical headcount exceeds contracted banquet guarantee by more than 15%.',
      immediateActionSteps: [
        'Instruct banquet captain to activate pre-agreed 20% buffer plates immediately.',
        'Extend dining buffet replenishment cycle with rapid live tandoor and bread stations.',
        'Open adjacent pre-function foyer with extra high-top banquet tables for overflow.',
        'Deploy 2 additional valets to auxiliary parking zone.',
      ],
      resourceRequirements: [
        'Standard contractual clause for 15-20% buffer plates at regular contracted plate rate.',
        'Additional 20 banquet chairs stored on standby in venue storage.',
      ],
      costImpactEstimate: `₹${(Math.round(profile.totalBudget / maxGuests) * Math.round(maxGuests * 0.15)).toLocaleString('en-IN')} (billed on actual plate consumption)`,
    },
  ];
}
