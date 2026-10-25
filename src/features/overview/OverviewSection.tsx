'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { HealthGauge } from '@/components/health/HealthGauge';
import {
  Calendar,
  Users,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export function OverviewSection() {
  const { currentPlan, setActiveTab, language } = useAppStore();
  const dict = getDictionary(language);

  if (!currentPlan) return null;

  const { profile, budget, timeline, risks, vendors, health } = currentPlan;

  // Calculate days remaining
  const eventDate = new Date(profile.date);
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const maxGuests = Math.max(1, ...profile.functions.map((f) => f.guestCount));

  const unresolvedHighRisks = risks.filter((r) => !r.isResolved && r.severity === 'high');
  const bookedVendorsCount = vendors.filter(
    (v) => v.status === 'booked' || v.status === 'paid'
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero Celebration Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-900 via-maroon-800 to-saffron-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="mb-2 inline-block rounded-full border border-gold-400/30 bg-gold-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-300">
              {profile.eventType.toUpperCase()} MASTER PLAN
            </span>
            <h1 className="font-serif text-2xl font-extrabold text-ivory-100 sm:text-4xl">
              {profile.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-200">
              <span className="flex items-center space-x-1">
                <Calendar className="mr-1 h-4 w-4 text-gold-400" />
                {profile.date} ({diffDays} days away)
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="mr-1 h-4 w-4 text-gold-400" />
                {profile.city} ({profile.cityTier.toUpperCase()})
              </span>
              <span className="flex items-center space-x-1">
                <Users className="mr-1 h-4 w-4 text-gold-400" />
                {maxGuests} Guests across {profile.functions.length} Functions
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm md:items-end">
            <span className="text-xs uppercase tracking-wider text-stone-300">Total Budget</span>
            <span className="font-serif text-2xl font-extrabold text-gold-300 sm:text-3xl">
              ₹{(budget.totalBudget / 100000).toFixed(1)} Lakhs
            </span>
            <span className="mt-0.5 text-xs text-stone-300">
              Avg ₹{budget.perGuestTotalCost.toLocaleString('en-IN')} / guest
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Health Score Pillar */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {dict.health.scoreTitle}
          </h2>
          <HealthGauge health={health} size={160} />
          <button
            onClick={() => setActiveTab('health')}
            className="mt-4 flex items-center space-x-1 text-xs font-semibold text-maroon-700 hover:underline dark:text-gold-400"
          >
            <span>View Full Diagnostic Breakdown</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Budget Verdict & Split */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Budget Feasibility
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  budget.overallVerdict === 'Comfortable'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : budget.overallVerdict === 'Tight'
                      ? 'dark:bg-saffron-950 bg-saffron-100 text-saffron-800 dark:text-saffron-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {budget.overallVerdict}
              </span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              {budget.verdictReason}
            </p>

            <div className="space-y-2">
              {budget.allocations.slice(0, 4).map((alloc) => (
                <div key={alloc.category} className="text-xs">
                  <div className="mb-1 flex justify-between text-stone-700 dark:text-stone-300">
                    <span>{alloc.label}</span>
                    <span className="font-semibold">
                      ₹{(alloc.amount / 100000).toFixed(1)}L ({alloc.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-maroon-700 dark:bg-gold-500"
                      style={{ width: `${alloc.percentage * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('budget')}
            className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-semibold text-maroon-700 hover:underline dark:border-stone-800 dark:text-gold-400"
          >
            <span>Explore Complete Budget Splits</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Timeline & Readiness */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Timeline & Readiness
              </h2>
              {timeline.isCompressed && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Compressed Schedule
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
                <span className="text-xs text-stone-600 dark:text-stone-300">
                  Critical Path Tasks
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {timeline.criticalPathCount} / {timeline.tasks.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
                <span className="text-xs text-stone-600 dark:text-stone-300">Vendors Locked</span>
                <span className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {bookedVendorsCount} / {vendors.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
                <span className="text-xs text-stone-600 dark:text-stone-300">
                  High Severity Risks
                </span>
                <span
                  className={`flex items-center text-sm font-bold ${
                    unresolvedHighRisks.length > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  {unresolvedHighRisks.length} Unresolved
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('timeline')}
            className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-semibold text-maroon-700 hover:underline dark:border-stone-800 dark:text-gold-400"
          >
            <span>Review Reverse Timeline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* High Alert Watchdog Banner if Risks Exist */}
      {unresolvedHighRisks.length > 0 && (
        <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                {unresolvedHighRisks[0].title}
              </h3>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {unresolvedHighRisks[0].explanation}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('risks')}
            className="ml-4 flex-shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
          >
            Fix in Risks Watchdog
          </button>
        </div>
      )}

      {/* Navigation Quick Links Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            id: 'whatIf',
            title: 'What-If Simulator',
            desc: 'Test trade-offs with sliders',
            icon: <Sparkles className="h-5 w-5 text-saffron-500" />,
          },
          {
            id: 'vendors',
            title: 'Vendor Pipeline',
            desc: 'Questions, tips & status',
            icon: <ShieldCheck className="h-5 w-5 text-gold-500" />,
          },
          {
            id: 'ideas',
            title: 'Themes & Ideas',
            desc: 'Palettes & menu portions',
            icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
          },
          {
            id: 'planB',
            title: 'Plan B Playbook',
            desc: 'Emergency contingencies',
            icon: <AlertTriangle className="h-5 w-5 text-maroon-500" />,
          },
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id as any)}
            className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 text-left transition-all hover:border-gold-400 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
          >
            <div>
              <div className="mb-2 w-fit rounded-lg bg-stone-50 p-2 dark:bg-stone-800">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{card.title}</h3>
              <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{card.desc}</p>
            </div>
            <ArrowRight className="mt-3 h-4 w-4 self-end text-stone-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
