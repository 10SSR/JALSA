import { ExpenseCategory, EventType, TimelineTaskPriority } from '@/lib/validation';

export interface TaskBlueprint {
  id: string;
  title: string;
  category: ExpenseCategory;
  defaultDaysBeforeEvent: number;
  priority: TimelineTaskPriority;
  owner: string;
  dependencies: string[];
  applicableFunctionTypes?: string[];
}

export interface VendorCategoryBlueprint {
  category: ExpenseCategory;
  categoryLabel: string;
  questionsToAsk: string[];
  redFlags: string[];
  negotiationTips: string[];
  documentsToCollect: string[];
}

export interface EventTemplateConfig {
  eventType: EventType;
  title: string;
  description: string;
  defaultFunctions: Array<{
    type: string;
    name: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    venueType: 'indoor' | 'outdoor' | 'hybrid';
    guestRatio: number; // ratio compared to max guest count
    significance: string;
  }>;
  baseCategoryWeights: Record<ExpenseCategory, number>; // percentages summing to 100
  tierCostPerGuestFloor: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  tierCostPerGuestCeiling: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  taskBlueprints: TaskBlueprint[];
  vendorBlueprints: VendorCategoryBlueprint[];
  defaultThemes: Array<{
    name: string;
    palette: { name: string; hexCodes: string[]; description: string };
    decorIdeas: string[];
    entertainment: string[];
    returnGifts: string[];
  }>;
}
