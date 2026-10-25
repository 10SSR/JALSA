'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { Share2, FileText, Calendar, Copy, Check, Printer } from 'lucide-react';

export function ExportSection() {
  const { currentPlan, language } = useAppStore();
  const [copied, setCopied] = useState(false);
  const dict = getDictionary(language);

  if (!currentPlan) return null;
  const { profile, budget, timeline, health } = currentPlan;

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateShareLink = () => {
    try {
      const stateObj = {
        title: profile.title,
        date: profile.date,
        city: profile.city,
        totalBudget: profile.totalBudget,
        score: health.overallScore,
        verdict: budget.overallVerdict,
      };
      const jsonStr = JSON.stringify(stateObj);
      const b64 = btoa(encodeURIComponent(jsonStr));
      const shareUrl = `${window.location.origin}/#share=${b64}`;

      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Unable to copy share link.');
    }
  };

  const downloadCalendar = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JALSA//AI Event Planner//EN',
      'CALSCALE:GREGORIAN',
    ];
    for (const task of timeline.tasks) {
      const clean = task.dueDate.replace(/-/g, '');
      ics.push(
        'BEGIN:VEVENT',
        `UID:jalsa-${task.id}@jalsa.app`,
        `DTSTAMP:${clean}T090000Z`,
        `DTSTART;VALUE=DATE:${clean}`,
        `SUMMARY:JALSA: ${task.title}`,
        'END:VEVENT'
      );
    }
    ics.push('END:VCALENDAR');

    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.title}_Timeline.ics`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="dark:bg-gold-950 rounded-lg bg-gold-100 p-1.5 text-gold-700 dark:text-gold-300">
            <Share2 className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            {dict.export.title}
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Zero database footprint. Download lightweight PDF summaries, sync tasks to calendar, or
          copy compressed share links.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* PDF Executive Printout */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="space-y-2">
            <div className="w-fit rounded-xl bg-maroon-50 p-2.5 text-maroon-700 dark:bg-maroon-950/60 dark:text-gold-400">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Executive PDF Report
            </h3>
            <p className="text-xs leading-relaxed text-stone-500">
              Client-side rendered executive summary ready for family review, vendor negotiations,
              or paper printing.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-maroon-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-maroon-900"
          >
            <FileText className="h-4 w-4" />
            <span>{dict.export.pdfDownload}</span>
          </button>
        </div>

        {/* Sync Calendar */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="space-y-2">
            <div className="dark:bg-gold-950/60 w-fit rounded-xl bg-gold-50 p-2.5 text-gold-600 dark:text-gold-400">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Calendar Sync (.ICS)
            </h3>
            <p className="text-xs leading-relaxed text-stone-500">
              Import all {timeline.tasks.length} reverse timeline milestones into Google Calendar,
              Apple Calendar, or Outlook.
            </p>
          </div>
          <button
            onClick={downloadCalendar}
            className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs font-bold text-stone-900 shadow-sm transition-all hover:bg-gold-600"
          >
            <Calendar className="h-4 w-4" />
            <span>{dict.export.calendarDownload}</span>
          </button>
        </div>

        {/* Encoded Share Link */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="space-y-2">
            <div className="dark:bg-saffron-950/60 w-fit rounded-xl bg-saffron-50 p-2.5 text-saffron-600 dark:text-saffron-400">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Stateless Share Link
            </h3>
            <p className="text-xs leading-relaxed text-stone-500">
              Share your celebration plan with partner or family via an encrypted URL hash. No
              database or account needed.
            </p>
          </div>
          <button
            onClick={handleGenerateShareLink}
            className={`flex w-full items-center justify-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? dict.export.shareLinkCopied : dict.export.copyShareLink}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
