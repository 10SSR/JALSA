'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { Info } from 'lucide-react';

export function BudgetSection() {
  const { currentPlan, language } = useAppStore();
  const dict = getDictionary(language);

  if (!currentPlan) return null;
  const { budget, profile } = currentPlan;
  const maxGuests = Math.max(1, ...profile.functions.map((f) => f.guestCount));

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            {dict.budget.totalBudget}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Deterministic allocation calibrated for {profile.city} ({profile.cityTier.toUpperCase()}
            ) across {maxGuests} guests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              budget.overallVerdict === 'Comfortable'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : budget.overallVerdict === 'Tight'
                  ? 'dark:bg-saffron-950 bg-saffron-100 text-saffron-800 dark:text-saffron-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {budget.overallVerdict} Verdict
          </span>
        </div>
      </div>

      {/* Rationale Banner */}
      <div className="flex items-start space-x-3 rounded-xl border border-gold-200 bg-ivory-100 p-4 dark:border-stone-700 dark:bg-stone-800/80">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600 dark:text-gold-400" />
        <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {budget.verdictReason}
        </p>
      </div>

      {/* Top Cards: Total, Direct, Contingency, Per Guest */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Total Budget
          </span>
          <div className="mt-1 font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100">
            ₹{(budget.totalBudget / 100000).toFixed(1)} Lakhs
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">Full celebration allocation</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Direct Expenses
          </span>
          <div className="mt-1 font-serif text-2xl font-extrabold text-stone-800 dark:text-stone-200">
            ₹{(budget.allocatedBudget / 100000).toFixed(1)} Lakhs
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">Vendor & production costs</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Contingency Fund
          </span>
          <div className="mt-1 font-serif text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{(budget.contingencyBudget / 100000).toFixed(1)} Lakhs
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">8-10% emergency buffer</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Per-Guest Spend
          </span>
          <div className="mt-1 font-serif text-2xl font-extrabold text-saffron-600 dark:text-saffron-400">
            ₹{budget.perGuestTotalCost.toLocaleString('en-IN')}
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">Across all functions</span>
        </div>
      </div>

      {/* Visual Budget Flow Bar */}
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
          <span>Category Share Distribution</span>
          <span>100% Allocated</span>
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          {budget.allocations.map((alloc, idx) => {
            const colors = [
              'bg-maroon-700',
              'bg-saffron-600',
              'bg-gold-500',
              'bg-emerald-600',
              'bg-purple-600',
              'bg-pink-600',
              'bg-blue-600',
              'bg-amber-600',
              'bg-teal-600',
              'bg-indigo-600',
              'bg-rose-500',
              'bg-stone-500',
            ];
            return (
              <div
                key={alloc.category}
                style={{ width: `${alloc.percentage}%` }}
                className={`${colors[idx % colors.length]} h-full transition-all`}
                title={`${alloc.label}: ${alloc.percentage}% (₹${(alloc.amount / 100000).toFixed(1)}L)`}
              />
            );
          })}
        </div>
      </div>

      {/* Detailed Category Allocations Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {budget.allocations.map((alloc) => (
          <div
            key={alloc.category}
            className="flex flex-col justify-between space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {alloc.label}
                </h3>
                <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  {alloc.percentage}% Share
                </span>
              </div>

              <div className="mt-2 flex items-baseline space-x-2">
                <span className="font-serif text-xl font-extrabold text-maroon-800 dark:text-gold-300">
                  ₹{alloc.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500">
                  (₹{alloc.perGuestCost.toLocaleString('en-IN')} / guest)
                </span>
              </div>

              <p className="mt-2 rounded-lg border border-stone-100 bg-stone-50 p-2.5 text-xs leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-300">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Engine Rationale:{' '}
                </span>
                {alloc.why}
              </p>
            </div>

            {/* Benchmarks */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500 dark:border-stone-800">
              <span>Benchmark: Min ₹{alloc.benchmarks.minSuggested}</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Ideal ₹{alloc.benchmarks.idealSuggested}
              </span>
              <span>Max ₹{alloc.benchmarks.maxSuggested}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
