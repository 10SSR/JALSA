export type Language = 'en' | 'hi' | 'mr';

export interface TranslationDictionary {
  brand: {
    title: string;
    tagline: string;
    subtitle: string;
  };
  navigation: {
    overview: string;
    budget: string;
    timeline: string;
    risks: string;
    vendors: string;
    ideas: string;
    health: string;
    planB: string;
    export: string;
    whatIf: string;
  };
  common: {
    currencySymbol: string;
    loading: string;
    save: string;
    cancel: string;
    retry: string;
    error: string;
    back: string;
    continue: string;
    completed: string;
    pending: string;
    inProgress: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    days: string;
    weeks: string;
    guests: string;
    total: string;
  };
  intake: {
    welcomeMessage: string;
    inputPlaceholder: string;
    listening: string;
    speakNow: string;
    send: string;
    switchForm: string;
    switchChat: string;
    eventTypeLabel: string;
    budgetLabel: string;
    cityLabel: string;
    dateLabel: string;
    dietaryLabel: string;
    prioritiesLabel: string;
    generatePlanButton: string;
  };
  budget: {
    totalBudget: string;
    allocated: string;
    contingency: string;
    perGuestCost: string;
    verdictComfortable: string;
    verdictTight: string;
    verdictUnrealistic: string;
    categoryLabel: string;
    sharePercent: string;
  };
  health: {
    scoreTitle: string;
    scoreSubtitle: string;
    breakdownTitle: string;
    budgetImpact: string;
    timelineImpact: string;
    vendorImpact: string;
    riskImpact: string;
  };
  risks: {
    title: string;
    subtitle: string;
    severityLabel: string;
    fixSuggestion: string;
    resolveButton: string;
    resolvedStatus: string;
  };
  planB: {
    title: string;
    subtitle: string;
    trigger: string;
    actionSteps: string;
    contingencySuppliers: string;
  };
  export: {
    title: string;
    pdfDownload: string;
    calendarDownload: string;
    copyShareLink: string;
    shareLinkCopied: string;
  };
}
