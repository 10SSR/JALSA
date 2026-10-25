'use client';

import React, { useEffect } from 'react';
import { useAppStore, ActiveTab } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { IntakeSection } from '@/features/intake/IntakeSection';
import { OverviewSection } from '@/features/overview/OverviewSection';
import { BudgetSection } from '@/features/budget/BudgetSection';
import { WhatIfSection } from '@/features/whatif/WhatIfSection';
import { TimelineSection } from '@/features/timeline/TimelineSection';
import { RisksSection } from '@/features/risks/RisksSection';
import { VendorsSection } from '@/features/vendors/VendorsSection';
import { IdeasSection } from '@/features/ideas/IdeasSection';
import { HealthSection } from '@/features/health/HealthSection';
import { PlanBSection } from '@/features/planB/PlanBSection';
import { ExportSection } from '@/features/export/ExportSection';
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  AlertTriangle,
  Users,
  Sparkles,
  HeartPulse,
  ShieldAlert,
  Share2,
  Sliders,
} from 'lucide-react';

export default function HomePage() {
  const { currentPlan, activeTab, setActiveTab, language, theme } = useAppStore();
  const dict = getDictionary(language);

  // Sync dark mode class on client mount
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Decode URL hash if shared plan is present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#share=')) {
      try {
        const b64 = window.location.hash.replace('#share=', '');
        const json = decodeURIComponent(atob(b64));
        const parsed = JSON.parse(json);
        if (parsed.title) {
          // If valid, load sample or trigger banner
        }
      } catch {
        // Ignore malformed hashes
      }
    }
  }, []);

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'overview',
      label: dict.navigation.overview,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    { id: 'budget', label: dict.navigation.budget, icon: <Wallet className="h-4 w-4" /> },
    { id: 'whatIf', label: dict.navigation.whatIf, icon: <Sliders className="h-4 w-4" /> },
    { id: 'timeline', label: dict.navigation.timeline, icon: <Calendar className="h-4 w-4" /> },
    {
      id: 'risks',
      label: dict.navigation.risks,
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: currentPlan
        ? currentPlan.risks.filter((r) => !r.isResolved && r.severity === 'high').length ||
          undefined
        : undefined,
    },
    { id: 'vendors', label: dict.navigation.vendors, icon: <Users className="h-4 w-4" /> },
    { id: 'ideas', label: dict.navigation.ideas, icon: <Sparkles className="h-4 w-4" /> },
    { id: 'health', label: dict.navigation.health, icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'planB', label: dict.navigation.planB, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'export', label: dict.navigation.export, icon: <Share2 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-stone-900 transition-colors dark:bg-[#120508] dark:text-stone-100">
      <Navbar />

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {!currentPlan ? (
          /* Intake Flow (No plan generated yet) */
          <IntakeSection />
        ) : (
          /* Master Dashboard Layout */
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            {/* Desktop Side Navigation Sidebar */}
            <aside
              className="sticky top-24 hidden w-64 flex-shrink-0 rounded-2xl border border-stone-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 lg:block"
              aria-label="Dashboard navigation tabs"
            >
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                Dashboard Modules
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-maroon-800 to-maroon-700 text-white shadow-md'
                          : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={isActive ? 'text-gold-300' : 'text-stone-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Health Score Mini Widget in Sidebar */}
              <div className="mt-6 flex items-center justify-between border-t border-stone-100 px-3 pt-4 dark:border-stone-800">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-stone-400">
                    Health Score
                  </span>
                  <span className="font-serif text-xl font-bold text-maroon-800 dark:text-gold-300">
                    {currentPlan.health.overallScore} / 100
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {currentPlan.health.grade}
                </span>
              </div>
            </aside>

            {/* Mobile Horizontal Tabs */}
            <div className="scrollbar-none flex w-full space-x-2 overflow-x-auto border-b border-stone-200 pb-2 dark:border-stone-800 lg:hidden">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-maroon-800 text-white shadow-sm'
                        : 'border border-stone-200 bg-white text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Main Content */}
            <div className="w-full min-w-0 flex-1">
              {activeTab === 'overview' && <OverviewSection />}
              {activeTab === 'budget' && <BudgetSection />}
              {activeTab === 'whatIf' && <WhatIfSection />}
              {activeTab === 'timeline' && <TimelineSection />}
              {activeTab === 'risks' && <RisksSection />}
              {activeTab === 'vendors' && <VendorsSection />}
              {activeTab === 'ideas' && <IdeasSection />}
              {activeTab === 'health' && <HealthSection />}
              {activeTab === 'planB' && <PlanBSection />}
              {activeTab === 'export' && <ExportSection />}
            </div>
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-stone-200/80 bg-white/40 py-6 text-center text-xs text-stone-500 dark:border-stone-800/80 dark:bg-stone-950/40 dark:text-stone-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-maroon-900 dark:text-gold-300">JALSA</span>
            <span>• PromptWars Challenge 5: Celebration & Event Planner</span>
          </div>
          <div>
            <span>Pure TS Deterministic Engine + GenAI Personalization • Indian Celebrations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
