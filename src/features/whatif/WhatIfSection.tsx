'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { simulateTradeOffs } from '@/lib/engine';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Users,
  IndianRupee,
} from 'lucide-react';

export function WhatIfSection() {
  const { currentPlan, applyWhatIf } = useAppStore();

  const baseBudget = currentPlan ? currentPlan.budget.totalBudget : 4500000;
  const baseGuests = currentPlan
    ? Math.max(1, ...currentPlan.profile.functions.map((f) => f.guestCount))
    : 300;
  const baseDate = currentPlan ? currentPlan.profile.date : '2026-12-18';

  const [simBudget, setSimBudget] = useState(baseBudget);
  const [simGuests, setSimGuests] = useState(baseGuests);
  const [simDate, setSimDate] = useState(baseDate);

  const diff = useMemo(() => {
    if (!currentPlan) return null;
    return simulateTradeOffs(currentPlan, simBudget, simGuests, simDate);
  }, [currentPlan, simBudget, simGuests, simDate]);

  if (!currentPlan || !diff) return null;

  const handleApply = () => {
    applyWhatIf(simBudget, simGuests, simDate);
    alert('Simulated trade-offs successfully applied to Master Plan!');
  };

  const handleReset = () => {
    setSimBudget(baseBudget);
    setSimGuests(baseGuests);
    setSimDate(baseDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="dark:bg-saffron-950 rounded-lg bg-saffron-100 p-1.5 text-saffron-700 dark:text-saffron-300">
            <Sliders className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            What-If Simulator & Trade-Off Engine
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Adjust sliders to test sensitivity. The pure deterministic rules engine re-calculates
          constraints client-side in &lt;10ms.
        </p>
      </div>

      {/* Interactive Controls & Live Diff Side-by-Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sliders Card */}
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            Simulated Parameters
          </h2>

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center font-semibold text-stone-700 dark:text-stone-300">
                <IndianRupee className="mr-1 h-4 w-4 text-gold-500" /> Total Budget
              </span>
              <span className="font-serif text-lg font-extrabold text-maroon-800 dark:text-gold-300">
                ₹{(simBudget / 100000).toFixed(1)} Lakhs
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="100000"
              value={simBudget}
              onChange={(e) => setSimBudget(parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer rounded-lg bg-stone-200 accent-maroon-700 dark:bg-stone-700"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>₹5.0 Lakhs</span>
              <span>Baseline: ₹{(baseBudget / 100000).toFixed(1)}L</span>
              <span>₹2.0 Crore</span>
            </div>
          </div>

          {/* Guest Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center font-semibold text-stone-700 dark:text-stone-300">
                <Users className="mr-1 h-4 w-4 text-saffron-500" /> Guest Count
              </span>
              <span className="font-serif text-lg font-extrabold text-maroon-800 dark:text-gold-300">
                {simGuests} Guests
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={simGuests}
              onChange={(e) => setSimGuests(parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer rounded-lg bg-stone-200 accent-saffron-600 dark:bg-stone-700"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>50 pax</span>
              <span>Baseline: {baseGuests} pax</span>
              <span>1500 pax</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-stone-700 dark:text-stone-300">
              <Calendar className="mr-1 h-4 w-4 text-emerald-500" /> Target Celebration Date
            </label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"
            />
            <span className="block text-[11px] text-stone-400">
              Moving across months triggers peak vs off-peak seasonal weightings automatically.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-stone-500 underline hover:text-stone-800 dark:text-stone-400"
            >
              Reset to Original
            </button>
            <button
              onClick={handleApply}
              className="rounded-xl bg-maroon-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-maroon-900"
            >
              Apply to Master Plan
            </button>
          </div>
        </div>

        {/* Live Diff Panel */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Live Trade-Off Analysis
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-500">Health Impact:</span>
                <span
                  className={`flex items-center text-sm font-extrabold ${
                    diff.healthScoreDelta >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {diff.healthScoreDelta >= 0 ? (
                    <TrendingUp className="mr-0.5 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-4 w-4" />
                  )}
                  {diff.healthScoreDelta >= 0 ? `+${diff.healthScoreDelta}` : diff.healthScoreDelta}{' '}
                  pts ({diff.newHealthScore}/100)
                </span>
              </div>
            </div>

            {/* Verdict Diff */}
            <div className="my-4 flex items-center justify-between rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-800/60">
              <span className="text-stone-500">Feasibility Verdict:</span>
              <div className="flex items-center space-x-2">
                <span className="text-stone-400 line-through">{diff.oldVerdict}</span>
                <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                <span className="font-bold text-maroon-800 dark:text-gold-300">
                  {diff.newVerdict}
                </span>
              </div>
            </div>

            {/* Generated Trade-off Explanations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Concrete Trade-Off Deductions
              </h3>
              {diff.tradeOffStatements.map((stmt, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-stone-200/60 bg-ivory-50 p-3 text-xs leading-relaxed text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  {stmt}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Delta Summary */}
          <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-4 text-xs dark:border-stone-800">
            <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800">
              <span className="block text-[10px] font-semibold uppercase text-stone-400">
                Budget Delta
              </span>
              <span
                className={`font-bold ${diff.budgetDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {diff.budgetDelta >= 0
                  ? `+₹${(diff.budgetDelta / 100000).toFixed(1)}L`
                  : `-₹${(Math.abs(diff.budgetDelta) / 100000).toFixed(1)}L`}
              </span>
            </div>
            <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800">
              <span className="block text-[10px] font-semibold uppercase text-stone-400">
                Guest Delta
              </span>
              <span
                className={`font-bold ${diff.guestDelta >= 0 ? 'text-saffron-600' : 'text-blue-600'}`}
              >
                {diff.guestDelta >= 0 ? `+${diff.guestDelta} pax` : `${diff.guestDelta} pax`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
