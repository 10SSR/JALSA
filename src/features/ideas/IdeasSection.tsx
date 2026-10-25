'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Sparkles, Utensils, Music, Gift, Palette, Check } from 'lucide-react';

export function IdeasSection() {
  const { currentPlan } = useAppStore();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!currentPlan) return null;
  const { ideas } = currentPlan;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-maroon-900 dark:text-stone-100 sm:text-3xl">
            Personalized Themes, Decor & Culinary Concepts
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Bespoke color palettes, portion-calibrated banquet menus, and cultural concepts per
          function.
        </p>
      </div>

      {/* Ideas Cards per Function */}
      <div className="space-y-8">
        {ideas.map((idea) => (
          <div
            key={idea.functionId}
            className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            {/* Function Title & Theme */}
            <div className="flex flex-col justify-between gap-2 border-b border-stone-100 pb-4 dark:border-stone-800 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  {idea.functionName}
                </span>
                <h2 className="mt-0.5 font-serif text-xl font-bold text-maroon-900 dark:text-stone-100">
                  {idea.theme}
                </h2>
              </div>

              {/* Color Palette Swatches */}
              <div className="flex items-center space-x-2">
                <span className="mr-1 flex items-center text-xs text-stone-500">
                  <Palette className="mr-1 h-3.5 w-3.5" />
                  {idea.colorPalette.name}:
                </span>
                <div className="flex space-x-1.5">
                  {idea.colorPalette.hexCodes.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(hex)}
                      className="group relative h-7 w-7 rounded-full border border-stone-300/60 shadow-sm transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: hex }}
                      title={`Copy ${hex}`}
                    >
                      {copiedHex === hex && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">
                          <Check className="h-3 w-3 drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decor & Staging Ideas */}
            <div className="space-y-2">
              <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <Sparkles className="mr-1.5 h-4 w-4 text-gold-500" />
                Decor & Atmospheric Elements
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {idea.decorIdeas.map((decor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 rounded-xl border border-stone-200/60 bg-ivory-50 p-3 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-saffron-500" />
                    <span className="leading-relaxed">{decor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Recommendations with Portion Grams */}
            <div className="space-y-3">
              <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <Utensils className="mr-1.5 h-4 w-4 text-saffron-500" />
                Curated Banquet Menu & Portion Estimates
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {idea.menuRecommendations.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between border-b border-stone-200/60 pb-2 dark:border-stone-700">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {section.section}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start space-x-1.5">
                            <span className="font-bold text-gold-600 dark:text-gold-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span className="mt-3 border-t border-stone-200/40 pt-2 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                      Portion: {section.estimatedGramsPerGuest}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entertainment & Return Gifts */}
            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60">
                <h4 className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <Music className="mr-1.5 h-4 w-4 text-purple-500" />
                  Curated Entertainment & Entry
                </h4>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                  {idea.entertainmentIdeas.map((ent, idx) => (
                    <li key={idx} className="leading-relaxed">
                      • {ent}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60">
                <h4 className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <Gift className="mr-1.5 h-4 w-4 text-rose-500" />
                  Thoughtful Return Souvenirs
                </h4>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                  {idea.returnGiftIdeas.map((gift, idx) => (
                    <li key={idx} className="leading-relaxed">
                      • {gift}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
