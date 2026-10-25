import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventPlan, EventProfile, VendorPipelineStatus, EventPlanSchema } from '@/lib/validation';
import { generateCompleteEventPlan } from '@/lib/engine';
import { Language } from '@/lib/i18n';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export type ActiveTab =
  | 'overview'
  | 'budget'
  | 'timeline'
  | 'risks'
  | 'vendors'
  | 'ideas'
  | 'health'
  | 'planB'
  | 'whatIf'
  | 'export';

interface AppState {
  language: Language;
  theme: 'light' | 'dark';
  reduceMotion: boolean;
  activeTab: ActiveTab;
  currentPlan: EventPlan | null;
  chatMessages: ChatMessage[];
  intakeDraft: Partial<EventProfile>;
  isGenerating: boolean;
  aiNotice: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setReduceMotion: (reduce: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setCurrentPlan: (plan: EventPlan) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateIntakeDraft: (draft: Partial<EventProfile>) => void;
  setIsGenerating: (generating: boolean) => void;
  setAiNotice: (notice: string | null) => void;
  updateVendorStatus: (vendorId: string, status: VendorPipelineStatus) => void;
  resolveRisk: (riskId: string) => void;
  applyWhatIf: (newBudget: number, newGuests: number, newDate: string) => void;
  loadSamplePlan: (type?: 'wedding' | 'birthday' | 'community') => void;
  resetPlan: () => void;
}

const sampleWeddingProfile: EventProfile = {
  eventType: 'wedding',
  title: 'Ananya & Rohan Royal Wedding',
  date: '2026-12-18',
  city: 'Jaipur',
  cityTier: 'tier2',
  totalBudget: 4500000,
  functions: [
    {
      id: 'fn-mehendi',
      name: 'Mehendi & Sangeet Soiree',
      type: 'mehendi',
      date: '2026-12-17',
      guestCount: 250,
      venueType: 'hybrid',
      timeOfDay: 'afternoon',
    },
    {
      id: 'fn-haldi',
      name: 'Auspicious Haldi Ceremony',
      type: 'haldi',
      date: '2026-12-18',
      guestCount: 200,
      venueType: 'outdoor',
      timeOfDay: 'morning',
    },
    {
      id: 'fn-wedding',
      name: 'Vedic Pheras & Royal Reception',
      type: 'wedding',
      date: '2026-12-18',
      guestCount: 350,
      venueType: 'hybrid',
      timeOfDay: 'evening',
    },
  ],
  dietaryConstraints: ['pure_veg', 'jain'],
  priorities: ['venue', 'catering', 'photography'],
  venuePreference: 'hybrid',
  religionCultureNotes: 'Traditional ceremonies with Jain food counters and folk music',
  language: 'en',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      theme: 'light',
      reduceMotion: false,
      activeTab: 'overview',
      currentPlan: null,
      chatMessages: [
        {
          id: 'welcome',
          sender: 'assistant',
          text: 'Namaste! I am JALSA, your AI event co-pilot. Tell me about your celebration (e.g., "Planning a 3-day royal wedding in Jaipur for 350 guests in December with 45 Lakhs budget"). You can speak or type in English, Hindi, or Marathi!',
          timestamp: new Date().toISOString(),
        },
      ],
      intakeDraft: {
        eventType: 'wedding',
        city: 'Jaipur',
        cityTier: 'tier2',
        totalBudget: 4500000,
        dietaryConstraints: ['pure_veg'],
        priorities: ['venue', 'catering', 'photography'],
      },
      isGenerating: false,
      aiNotice: null,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setCurrentPlan: (currentPlan) => set({ currentPlan, activeTab: 'overview' }),
      addChatMessage: (msg) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              ...msg,
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      updateIntakeDraft: (draft) =>
        set((state) => ({
          intakeDraft: { ...state.intakeDraft, ...draft },
        })),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setAiNotice: (aiNotice) => set({ aiNotice }),

      updateVendorStatus: (vendorId, status) => {
        const plan = get().currentPlan;
        if (!plan) return;
        const updatedVendors = plan.vendors.map((v) => (v.id === vendorId ? { ...v, status } : v));
        // Re-run health score with updated vendor status
        const updatedHealth = generateCompleteEventPlan({
          ...plan.profile,
        }).health;

        set({
          currentPlan: {
            ...plan,
            vendors: updatedVendors,
            health: {
              ...updatedHealth,
              overallScore: Math.min(
                100,
                updatedHealth.overallScore + (status === 'booked' || status === 'paid' ? 4 : 0)
              ),
            },
          },
        });
      },

      resolveRisk: (riskId) => {
        const plan = get().currentPlan;
        if (!plan) return;
        const updatedRisks = plan.risks.map((r) =>
          r.id === riskId ? { ...r, isResolved: true } : r
        );
        set({
          currentPlan: {
            ...plan,
            risks: updatedRisks,
            health: {
              ...plan.health,
              overallScore: Math.min(100, plan.health.overallScore + 6),
              breakdown: {
                ...plan.health.breakdown,
                riskScore: Math.min(100, plan.health.breakdown.riskScore + 15),
              },
            },
          },
        });
      },

      applyWhatIf: (newBudget, newGuests, newDate) => {
        const plan = get().currentPlan;
        if (!plan) return;
        const updatedProfile: EventProfile = {
          ...plan.profile,
          totalBudget: newBudget,
          date: newDate,
          functions: plan.profile.functions.map((f) => ({
            ...f,
            guestCount: newGuests,
            date: newDate,
          })),
        };
        const newPlan = generateCompleteEventPlan(updatedProfile);
        set({ currentPlan: newPlan });
      },

      loadSamplePlan: (_type = 'wedding') => {
        const profile = sampleWeddingProfile;
        const plan = generateCompleteEventPlan(profile);
        set({ currentPlan: plan, activeTab: 'overview' });
      },

      resetPlan: () => set({ currentPlan: null, activeTab: 'overview' }),
    }),
    {
      name: 'jalsa-storage',
      storage: createJSONStorage(() => localStorage),
      // Validate schema on load to prevent corrupt state
      onRehydrateStorage: () => (state) => {
        if (state?.currentPlan) {
          const result = EventPlanSchema.safeParse(state.currentPlan);
          if (!result.success) {
            state.currentPlan = null;
          }
        }
      },
    }
  )
);
