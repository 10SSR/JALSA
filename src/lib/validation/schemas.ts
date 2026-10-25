import { z } from 'zod';

/**
 * City tier classification for budget index multipliers
 */
export const CityTierSchema = z.enum(['tier1', 'tier2', 'tier3']);
export type CityTier = z.infer<typeof CityTierSchema>;

/**
 * Supported event verticals - architecture is vertical agnostic
 */
export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community']);
export type EventType = z.infer<typeof EventTypeSchema>;

/**
 * Supported venue types
 */
export const VenueTypeSchema = z.enum(['indoor', 'outdoor', 'hybrid']);
export type VenueType = z.infer<typeof VenueTypeSchema>;

/**
 * Supported languages (EN / HI / MR)
 */
export const SupportedLanguageSchema = z.enum(['en', 'hi', 'mr']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

/**
 * Dietary constraints
 */
export const DietaryConstraintSchema = z.enum([
  'pure_veg',
  'jain',
  'vegan',
  'halal',
  'non_veg',
  'nut_allergy',
  'gluten_free',
]);
export type DietaryConstraint = z.infer<typeof DietaryConstraintSchema>;

/**
 * Core budget & vendor category enum
 */
export const ExpenseCategorySchema = z.enum([
  'venue',
  'catering',
  'decor',
  'photography',
  'attire_jewellery',
  'music_entertainment',
  'makeup_mehendi',
  'invitations_stationery',
  'logistics_accommodation',
  'rituals_pandit',
  'gifts_favors',
  'contingency',
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

/**
 * Individual function / sub-event within a celebration
 */
export const EventFunctionSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  guestCount: z.number().int().min(1).max(50000),
  venueType: VenueTypeSchema,
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
  culturalSignificance: z.string().optional(),
});
export type EventFunction = z.infer<typeof EventFunctionSchema>;

/**
 * Complete Event Profile schema (single source of truth for intake)
 */
export const EventProfileSchema = z.strictObject({
  eventType: EventTypeSchema,
  title: z.string().min(2).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  city: z.string().min(2).max(80),
  cityTier: CityTierSchema,
  totalBudget: z
    .number()
    .min(10000, 'Minimum budget is ₹10,000')
    .max(1000000000, 'Budget exceeds limit'),
  functions: z.array(EventFunctionSchema).min(1, 'At least one event function is required'),
  dietaryConstraints: z.array(z.string()).default(['pure_veg']),
  priorities: z.array(ExpenseCategorySchema).default(['venue', 'catering', 'decor']),
  venuePreference: VenueTypeSchema.default('indoor'),
  religionCultureNotes: z.string().max(500).default(''),
  language: SupportedLanguageSchema.default('en'),
});
export type EventProfile = z.infer<typeof EventProfileSchema>;

/**
 * Partial profile schema for conversational step-by-step intake
 */
export const PartialEventProfileSchema = EventProfileSchema.partial().extend({
  functions: z.array(EventFunctionSchema.partial()).optional(),
});
export type PartialEventProfile = z.infer<typeof PartialEventProfileSchema>;

/**
 * Feasibility verdict for overall budget or individual category
 */
export const FeasibilityVerdictSchema = z.enum(['Comfortable', 'Tight', 'Unrealistic']);
export type FeasibilityVerdict = z.infer<typeof FeasibilityVerdictSchema>;

/**
 * Category budget allocation item
 */
export const CategoryAllocationSchema = z.strictObject({
  category: ExpenseCategorySchema,
  label: z.string(),
  percentage: z.number().min(0).max(100),
  amount: z.number().min(0),
  perGuestCost: z.number().min(0),
  feasibilityVerdict: FeasibilityVerdictSchema,
  why: z.string(),
  benchmarks: z.object({
    minSuggested: z.number(),
    idealSuggested: z.number(),
    maxSuggested: z.number(),
  }),
});
export type CategoryAllocation = z.infer<typeof CategoryAllocationSchema>;

/**
 * Budget Decision Engine complete output
 */
export const BudgetEngineOutputSchema = z.strictObject({
  totalBudget: z.number(),
  allocatedBudget: z.number(),
  contingencyBudget: z.number(),
  perGuestTotalCost: z.number(),
  overallVerdict: FeasibilityVerdictSchema,
  verdictReason: z.string(),
  allocations: z.array(CategoryAllocationSchema),
  currency: z.literal('INR'),
  formattedTotal: z.string(),
});
export type BudgetEngineOutput = z.infer<typeof BudgetEngineOutputSchema>;

/**
 * Reverse Timeline Task schema
 */
export const TimelineTaskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type TimelineTaskPriority = z.infer<typeof TimelineTaskPrioritySchema>;

export const TimelineTaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked']);
export type TimelineTaskStatus = z.infer<typeof TimelineTaskStatusSchema>;

export const TimelineTaskSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(2),
  category: ExpenseCategorySchema,
  functionId: z.string().optional(),
  owner: z.string(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysBeforeEvent: z.number(),
  priority: TimelineTaskPrioritySchema,
  status: TimelineTaskStatusSchema,
  dependencies: z.array(z.string()),
  isCriticalPath: z.boolean(),
  isOverdue: z.boolean(),
  isAtRisk: z.boolean(),
  compressionNotice: z.string().optional(),
});
export type TimelineTask = z.infer<typeof TimelineTaskSchema>;

/**
 * Timeline Engine complete output
 */
export const TimelineEngineOutputSchema = z.strictObject({
  tasks: z.array(TimelineTaskSchema),
  criticalPathCount: z.number(),
  overdueCount: z.number(),
  atRiskCount: z.number(),
  isCompressed: z.boolean(),
  leadTimeWeeks: z.number(),
});
export type TimelineEngineOutput = z.infer<typeof TimelineEngineOutputSchema>;

/**
 * Risk & Conflict Detector schema
 */
export const RiskSeveritySchema = z.enum(['low', 'medium', 'high']);
export type RiskSeverity = z.infer<typeof RiskSeveritySchema>;

export const EventRiskSchema = z.strictObject({
  id: z.string().min(1),
  category: z.string(),
  severity: RiskSeveritySchema,
  title: z.string(),
  explanation: z.string(),
  fixSuggestion: z.string(),
  actionKey: z.string().optional(),
  isResolved: z.boolean().default(false),
});
export type EventRisk = z.infer<typeof EventRiskSchema>;

/**
 * Vendor Checklist item
 */
export const VendorPipelineStatusSchema = z.enum(['shortlisted', 'quoted', 'booked', 'paid']);
export type VendorPipelineStatus = z.infer<typeof VendorPipelineStatusSchema>;

export const VendorChecklistItemSchema = z.strictObject({
  id: z.string().min(1),
  category: ExpenseCategorySchema,
  categoryLabel: z.string(),
  allocatedBudget: z.number(),
  actualCost: z.number().optional(),
  vendorName: z.string().optional(),
  status: VendorPipelineStatusSchema,
  questionsToAsk: z.array(z.string()),
  redFlags: z.array(z.string()),
  negotiationTips: z.array(z.string()),
  documentsToCollect: z.array(z.string()),
  notes: z.string().optional(),
});
export type VendorChecklistItem = z.infer<typeof VendorChecklistItemSchema>;

/**
 * Personalized Ideas schema
 */
export const FunctionIdeaSchema = z.strictObject({
  functionId: z.string(),
  functionName: z.string(),
  theme: z.string(),
  colorPalette: z.strictObject({
    name: z.string(),
    hexCodes: z.array(z.string()),
    description: z.string(),
  }),
  decorIdeas: z.array(z.string()),
  menuRecommendations: z.array(
    z.strictObject({
      section: z.string(),
      items: z.array(z.string()),
      estimatedGramsPerGuest: z.string(),
    })
  ),
  entertainmentIdeas: z.array(z.string()),
  returnGiftIdeas: z.array(z.string()),
});
export type FunctionIdea = z.infer<typeof FunctionIdeaSchema>;

/**
 * Event Health Score schema
 */
export const HealthFactorStatusSchema = z.enum(['good', 'warning', 'critical']);
export type HealthFactorStatus = z.infer<typeof HealthFactorStatusSchema>;

export const HealthScoreBreakdownSchema = z.strictObject({
  budgetScore: z.number().min(0).max(100),
  timelineScore: z.number().min(0).max(100),
  vendorScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
});
export type HealthScoreBreakdown = z.infer<typeof HealthScoreBreakdownSchema>;

export const HealthFactorItemSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  category: z.enum(['budget', 'timeline', 'vendors', 'risks']),
  impact: z.number(),
  status: HealthFactorStatusSchema,
  fixSuggestion: z.string(),
});
export type HealthFactorItem = z.infer<typeof HealthFactorItemSchema>;

export const EventHealthScoreSchema = z.strictObject({
  overallScore: z.number().min(0).max(100),
  grade: z.enum(['A+', 'A', 'B', 'C', 'D']),
  verdict: z.string(),
  breakdown: HealthScoreBreakdownSchema,
  factors: z.array(HealthFactorItemSchema),
});
export type EventHealthScore = z.infer<typeof EventHealthScoreSchema>;

/**
 * Plan B Contingency Scenario schema
 */
export const PlanBScenarioSchema = z.strictObject({
  id: z.string(),
  triggerType: z.enum(['weather_rain_heat', 'vendor_dropout', 'budget_overrun', 'guest_surge']),
  title: z.string(),
  severity: RiskSeveritySchema,
  triggerCondition: z.string(),
  immediateActionSteps: z.array(z.string()),
  resourceRequirements: z.array(z.string()),
  costImpactEstimate: stringOrFormatted(),
});
export type PlanBScenario = z.infer<typeof PlanBScenarioSchema>;

function stringOrFormatted() {
  return z.string();
}

/**
 * Full Event Plan State (Complete plan holding all features)
 */
export const EventPlanSchema = z.strictObject({
  id: z.string(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: EventProfileSchema,
  budget: BudgetEngineOutputSchema,
  timeline: TimelineEngineOutputSchema,
  risks: z.array(EventRiskSchema),
  vendors: z.array(VendorChecklistItemSchema),
  ideas: z.array(FunctionIdeaSchema),
  health: EventHealthScoreSchema,
  planB: z.array(PlanBScenarioSchema),
});
export type EventPlan = z.infer<typeof EventPlanSchema>;
