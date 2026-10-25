'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { HealthGauge } from '@/components/health/HealthGauge';
import { HeartPulse, TrendingUp } from 'lucide-react';

export function HealthSection() {
  const { currentPlan, language } = useAppStore();
  const dict = getDictionary(language);

  if (!currentPlan) return null;
  const { health } = currentPlan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <HeartPulse className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            {dict.health.scoreTitle}
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {dict.health.scoreSubtitle}
        </p>
      </div>

      {/* Main Gauge + Pillar Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Gauge Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <HealthGauge health={health} size={200} />
        </div>

        {/* 4 Pillars Breakdown Bars */}
        <div className="flex flex-col justify-center space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 md:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            {dict.health.breakdownTitle}
          </h2>

          {/* Budget */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-700 dark:text-stone-300">
                Budget Discipline (30% Weight)
              </span>
              <span className="text-stone-900 dark:text-stone-100">
                {health.breakdown.budgetScore}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-maroon-700 transition-all"
                style={{ width: `${health.breakdown.budgetScore}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-700 dark:text-stone-300">
                Timeline Feasibility (25% Weight)
              </span>
              <span className="text-stone-900 dark:text-stone-100">
                {health.breakdown.timelineScore}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-gold-500 transition-all"
                style={{ width: `${health.breakdown.timelineScore}%` }}
              />
            </div>
          </div>

          {/* Vendors */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-700 dark:text-stone-300">
                Vendor Pipeline Readiness (25% Weight)
              </span>
              <span className="text-stone-900 dark:text-stone-100">
                {health.breakdown.vendorScore}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-saffron-600 transition-all"
                style={{ width: `${health.breakdown.vendorScore}%` }}
              />
            </div>
          </div>

          {/* Risks */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-700 dark:text-stone-300">
                Risk Exposure & Mitigation (20% Weight)
              </span>
              <span className="text-stone-900 dark:text-stone-100">
                {health.breakdown.riskScore}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${health.breakdown.riskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Points Improvement List */}
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h2 className="flex items-center text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          <TrendingUp className="mr-1.5 h-4 w-4 text-emerald-500" />
          Health Factors & Opportunities to Boost Score
        </h2>

        <div className="space-y-3">
          {health.factors.map((factor) => (
            <div
              key={factor.id}
              className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
                factor.status === 'critical'
                  ? 'border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20'
                  : factor.status === 'warning'
                    ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20'
                    : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {factor.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-stone-400">
                    ({factor.category})
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  <span className="font-semibold">Action to gain points: </span>
                  {factor.fixSuggestion}
                </p>
              </div>

              <span
                className={`flex-shrink-0 text-xs font-extrabold ${
                  factor.impact < 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {factor.impact < 0 ? `${factor.impact} pts` : '+0 pts (Good)'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
