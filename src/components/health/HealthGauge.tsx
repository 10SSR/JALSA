'use client';

import React, { useState } from 'react';
import { EventHealthScore } from '@/lib/validation';
import { useAppStore } from '@/lib/store';

interface HealthGaugeProps {
  health: EventHealthScore;
  size?: number;
}

export function HealthGauge({ health, size = 180 }: HealthGaugeProps) {
  const [showTable, setShowTable] = useState(false);
  const { reduceMotion } = useAppStore();

  const score = health.overallScore;
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#CF335C'; // Maroon / Red
  if (score >= 80)
    color = '#0A9060'; // Emerald
  else if (score >= 60) color = '#EA580C'; // Saffron

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Event Health Score: ${score} out of 100, Grade ${health.grade}`}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform drop-shadow-sm"
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-stone-200 dark:text-stone-800"
          />
          {/* Animated Gauge Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={reduceMotion ? strokeDashoffset : strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: reduceMotion ? 'none' : 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-serif text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            {score}
          </span>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            Grade {health.grade}
          </span>
        </div>
      </div>

      <p className="mt-3 max-w-xs text-center text-sm font-medium text-stone-600 dark:text-stone-300">
        {health.verdict}
      </p>

      {/* Accessibility Table Toggle */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="mt-2 text-xs text-stone-500 underline hover:text-maroon-700 focus:outline-none dark:text-stone-400 dark:hover:text-gold-300"
      >
        {showTable ? 'Hide data table' : 'View accessible table view'}
      </button>

      {showTable && (
        <table className="mt-3 w-full rounded border border-stone-200 text-xs dark:border-stone-800">
          <caption className="sr-only">Health Score Pillar Breakdown</caption>
          <thead>
            <tr className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              <th className="p-1.5 text-left">Pillar</th>
              <th className="p-1.5 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-stone-200 dark:border-stone-800">
              <td className="p-1.5">Budget Discipline</td>
              <td className="p-1.5 text-right font-semibold">{health.breakdown.budgetScore}%</td>
            </tr>
            <tr className="border-t border-stone-200 dark:border-stone-800">
              <td className="p-1.5">Timeline Feasibility</td>
              <td className="p-1.5 text-right font-semibold">{health.breakdown.timelineScore}%</td>
            </tr>
            <tr className="border-t border-stone-200 dark:border-stone-800">
              <td className="p-1.5">Vendor Readiness</td>
              <td className="p-1.5 text-right font-semibold">{health.breakdown.vendorScore}%</td>
            </tr>
            <tr className="border-t border-stone-200 dark:border-stone-800">
              <td className="p-1.5">Risk Exposure</td>
              <td className="p-1.5 text-right font-semibold">{health.breakdown.riskScore}%</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
