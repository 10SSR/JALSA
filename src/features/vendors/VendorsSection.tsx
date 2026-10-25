'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { VendorPipelineStatus } from '@/lib/validation';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import {
  Users,
  HelpCircle,
  AlertOctagon,
  TrendingDown,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function VendorsSection() {
  const { currentPlan, updateVendorStatus, reduceMotion } = useAppStore();
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  if (!currentPlan) return null;
  const { vendors } = currentPlan;

  const handleStatusChange = (vendorId: string, nextStatus: VendorPipelineStatus) => {
    updateVendorStatus(vendorId, nextStatus);
    if (nextStatus === 'booked' || nextStatus === 'paid') {
      fireCelebrationConfetti(reduceMotion);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedVendorId(expandedVendorId === id ? null : id);
  };

  const stages: VendorPipelineStatus[] = ['shortlisted', 'quoted', 'booked', 'paid'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="dark:bg-gold-950 rounded-lg bg-gold-100 p-1.5 text-gold-700 dark:text-gold-300">
            <Users className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            Vendor Management & Contract Playbook
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Interview questions, red flags, negotiation tactics, and live pipeline status per
          category.
        </p>
      </div>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {vendors.map((vendor) => {
          const isExpanded = expandedVendorId === vendor.id;
          return (
            <div
              key={vendor.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all dark:border-stone-800 dark:bg-stone-900"
            >
              {/* Main Card Summary Bar */}
              <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {vendor.categoryLabel}
                    </h3>
                    <span className="text-xs font-semibold text-stone-500">
                      (Allocated: ₹{(vendor.allocatedBudget / 100000).toFixed(1)}L)
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {vendor.questionsToAsk.length} key interview questions •{' '}
                    {vendor.redFlags.length} contract traps
                  </p>
                </div>

                {/* Pipeline Status Buttons */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {stages.map((stage) => {
                    const isActive = vendor.status === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => handleStatusChange(vendor.id, stage)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                          isActive
                            ? 'bg-maroon-700 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {stage}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => toggleExpand(vendor.id)}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    aria-label={`Toggle playbook details for ${vendor.categoryLabel}`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep-Dive Playbook */}
              {isExpanded && (
                <div className="grid grid-cols-1 gap-6 border-t border-stone-100 bg-stone-50/60 p-5 dark:border-stone-800 dark:bg-stone-800/40 md:grid-cols-2">
                  {/* Interview Questions */}
                  <div className="space-y-2">
                    <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      <HelpCircle className="mr-1.5 h-4 w-4 text-blue-500" />
                      Must-Ask Interview Questions
                    </h4>
                    <ul className="list-inside list-disc space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                      {vendor.questionsToAsk.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contract Red Flags */}
                  <div className="space-y-2">
                    <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      <AlertOctagon className="mr-1.5 h-4 w-4" />
                      Contract Traps & Red Flags
                    </h4>
                    <ul className="list-inside list-disc space-y-1.5 text-xs text-red-700 dark:text-red-300">
                      {vendor.redFlags.map((rf, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negotiation Tips */}
                  <div className="space-y-2">
                    <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <TrendingDown className="mr-1.5 h-4 w-4" />
                      Hard Negotiation Tips
                    </h4>
                    <ul className="list-inside list-disc space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                      {vendor.negotiationTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Documents to Collect */}
                  <div className="space-y-2">
                    <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-400">
                      <FileCheck className="mr-1.5 h-4 w-4" />
                      Compliance Documents to Collect
                    </h4>
                    <ul className="list-inside list-disc space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                      {vendor.documentsToCollect.map((doc, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
