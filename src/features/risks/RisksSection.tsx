'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { AlertTriangle, CheckCircle2, Wrench, ShieldCheck, Sparkles } from 'lucide-react';

export function RisksSection() {
  const { currentPlan, resolveRisk, reduceMotion, language } = useAppStore();
  const dict = getDictionary(language);

  if (!currentPlan) return null;
  const { risks } = currentPlan;

  const handleResolve = (riskId: string) => {
    resolveRisk(riskId);
    fireCelebrationConfetti(reduceMotion);
  };

  const unresolvedCount = risks.filter((r) => !r.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-red-100 p-1.5 text-red-700 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
              {dict.risks.title}
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {dict.risks.subtitle} ({unresolvedCount} active conflicts detected)
          </p>
        </div>

        {unresolvedCount === 0 && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>All System Risks Mitigated</span>
          </div>
        )}
      </div>

      {/* Risk Cards */}
      <div className="space-y-4">
        {risks.map((risk) => (
          <div
            key={risk.id}
            className={`rounded-2xl border p-5 transition-all ${
              risk.isResolved
                ? 'border-emerald-200 bg-emerald-50/50 opacity-70 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                : risk.severity === 'high'
                  ? 'border-red-200 bg-white shadow-sm dark:border-red-900 dark:bg-stone-900'
                  : 'border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900'
            }`}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      risk.isResolved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : risk.severity === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {risk.isResolved ? 'Resolved' : `${risk.severity} Severity`}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {risk.category}
                  </span>
                </div>

                <h3
                  className={`text-base font-bold ${
                    risk.isResolved
                      ? 'text-stone-500 line-through'
                      : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {risk.title}
                </h3>

                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {risk.explanation}
                </p>

                {/* Fix Suggestion Box */}
                <div className="flex items-start space-x-2 rounded-xl border border-stone-200/60 bg-stone-50 p-3 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  <Wrench className="mt-0.5 h-4 w-4 flex-shrink-0 text-maroon-700 dark:text-gold-400" />
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      Recommended Fix:{' '}
                    </span>
                    {risk.fixSuggestion}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-shrink-0 items-center justify-end gap-2 md:flex-col md:justify-start">
                {risk.isResolved ? (
                  <span className="inline-flex items-center space-x-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mitigation Applied</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolve(risk.id)}
                    className="flex items-center space-x-1.5 rounded-xl bg-maroon-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-maroon-900"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-gold-300" />
                    <span>Apply 1-Click Fix</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
