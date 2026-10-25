'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import {
  ShieldAlert,
  CloudRain,
  UserX,
  TrendingDown,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export function PlanBSection() {
  const { currentPlan, language } = useAppStore();
  const dict = getDictionary(language);

  if (!currentPlan) return null;
  const { planB } = currentPlan;

  const triggerIcons: Record<string, React.ReactNode> = {
    weather_rain_heat: <CloudRain className="h-5 w-5 text-blue-500" />,
    vendor_dropout: <UserX className="h-5 w-5 text-red-500" />,
    budget_overrun: <TrendingDown className="h-5 w-5 text-amber-500" />,
    guest_surge: <Users className="h-5 w-5 text-purple-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="rounded-lg bg-red-100 p-1.5 text-red-700 dark:bg-red-950 dark:text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            {dict.planB.title}
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{dict.planB.subtitle}</p>
      </div>

      {/* Playbook Scenarios Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {planB.map((scenario) => (
          <div
            key={scenario.id}
            className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
                  {triggerIcons[scenario.triggerType] || (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {scenario.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {scenario.severity} Severity Threat
                  </span>
                </div>
              </div>

              {/* Trigger Condition */}
              <div className="rounded-xl border border-stone-200/60 bg-stone-50 p-3 text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Trigger Threshold:{' '}
                </span>
                {scenario.triggerCondition}
              </div>

              {/* Immediate Steps */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Immediate 2-Hour Action Steps
                </h4>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                  {scenario.immediateActionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 leading-relaxed">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resource Requirements */}
              <div className="space-y-1 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Pre-Requisites:{' '}
                </span>
                <span>{scenario.resourceRequirements.join(' • ')}</span>
              </div>
            </div>

            {/* Estimated Cost Impact */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
              <span className="font-semibold text-stone-400">Cost Impact:</span>
              <span className="font-bold text-maroon-800 dark:text-gold-300">
                {scenario.costImpactEstimate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
