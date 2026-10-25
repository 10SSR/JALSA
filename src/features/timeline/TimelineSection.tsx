'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Calendar, CheckCircle2, Clock, Download, Filter, Flame } from 'lucide-react';

export function TimelineSection() {
  const { currentPlan } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'overdue'>('all');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  if (!currentPlan) return null;
  const { timeline, profile } = currentPlan;

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const filteredTasks = timeline.tasks.filter((t) => {
    if (filter === 'critical') return t.isCriticalPath;
    if (filter === 'overdue') return t.isOverdue;
    return true;
  });

  const generateIcsCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JALSA//AI Event Planner//EN',
      'CALSCALE:GREGORIAN',
    ];

    for (const task of timeline.tasks) {
      const dateClean = task.dueDate.replace(/-/g, '');
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:jalsa-${task.id}@jalsa.app`,
        `DTSTAMP:${dateClean}T090000Z`,
        `DTSTART;VALUE=DATE:${dateClean}`,
        `SUMMARY:JALSA: ${task.title}`,
        `DESCRIPTION:Owner: ${task.owner} | Priority: ${task.priority.toUpperCase()} | Event: ${profile.title}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.title.replace(/\s+/g, '_')}_Timeline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-maroon-100 p-1.5 text-maroon-700 dark:bg-maroon-950 dark:text-gold-400">
              <Calendar className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
              Reverse Timeline & Critical Path
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Deadlines counted backwards from {profile.date}. Lead time: {timeline.leadTimeWeeks}{' '}
            weeks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={generateIcsCalendar}
            className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 shadow-sm transition-all hover:border-gold-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <Download className="h-4 w-4 text-gold-500" />
            <span>Sync to Calendar (.ICS)</span>
          </button>
        </div>
      </div>

      {/* Compression Banner */}
      {timeline.isCompressed && (
        <div className="flex items-start space-x-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold">Timeline Compression Active: </span>
            Event lead time is under 180 days. All vendor and rehearsal milestones have been
            compressed proportionately to maintain critical path feasibility.
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 dark:border-stone-800">
        <Filter className="h-4 w-4 text-stone-400" />
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            filter === 'all'
              ? 'bg-maroon-700 text-white'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          All Tasks ({timeline.tasks.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-xs font-semibold ${
            filter === 'critical'
              ? 'bg-gold-500 text-stone-900'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Critical Path ({timeline.criticalPathCount})</span>
        </button>
        {timeline.overdueCount > 0 && (
          <button
            onClick={() => setFilter('overdue')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              filter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            Overdue ({timeline.overdueCount})
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = completedTaskIds.has(task.id);
          return (
            <div
              key={task.id}
              className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-all ${
                isDone
                  ? 'border-stone-200 bg-stone-50/70 opacity-60 dark:border-stone-800 dark:bg-stone-900/40'
                  : task.isCriticalPath
                    ? 'border-gold-300/80 bg-white shadow-sm dark:border-gold-600/40 dark:bg-stone-900'
                    : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-0.5 rounded-full p-1 transition-colors ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950'
                      : 'text-stone-400 hover:text-maroon-700'
                  }`}
                  aria-label={`Mark task ${task.title} as ${isDone ? 'pending' : 'completed'}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isDone
                          ? 'text-stone-400 line-through'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isCriticalPath && (
                      <span className="dark:bg-gold-950 inline-flex items-center rounded border border-gold-300 bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-800 dark:text-gold-300">
                        Critical Path
                      </span>
                    )}
                    {task.isOverdue && !isDone && (
                      <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <span>
                      Due: {task.dueDate} ({task.daysBeforeEvent}d before event)
                    </span>
                    <span>•</span>
                    <span>Owner: {task.owner}</span>
                    <span>•</span>
                    <span className="capitalize">{task.category.replace('_', ' ')}</span>
                  </div>

                  {task.compressionNotice && (
                    <p className="text-[11px] italic text-amber-700 dark:text-amber-400">
                      {task.compressionNotice}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`flex-shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'critical'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : task.priority === 'high'
                      ? 'dark:bg-saffron-950 bg-saffron-50 text-saffron-700 dark:text-saffron-300'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}
              >
                {task.priority}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
