'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import { EventProfile, EventType } from '@/lib/validation';
import { generateCompleteEventPlan } from '@/lib/engine';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  MapPin,
  IndianRupee,
} from 'lucide-react';

export function IntakeSection() {
  const {
    language,
    chatMessages,
    addChatMessage,
    intakeDraft,
    updateIntakeDraft,
    setCurrentPlan,
    isGenerating,
    setIsGenerating,
  } = useAppStore();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'form'>('chat');
  const [speechSupported, setSpeechSupported] = useState(false);

  const dict = getDictionary(language);

  // Check Web Speech API availability
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    try {
      const windowObj = window as unknown as Record<string, unknown>;
      const SpeechRecognitionCtor = (windowObj.SpeechRecognition ||
        windowObj.webkitSpeechRecognition) as new () => {
        lang: string;
        interimResults: boolean;
        onstart: () => void;
        onend: () => void;
        onerror: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        start: () => void;
      };
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isGenerating) return;

    setInputVal('');
    addChatMessage({ sender: 'user', text });
    setIsGenerating(true);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, existingState: intakeDraft }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const extracted = data.data;

      // Update store draft with newly extracted entities
      updateIntakeDraft(extracted);

      // Assistant responds with next question or confirmation
      addChatMessage({
        sender: 'assistant',
        text: extracted.nextQuestion,
      });

      // If all required fields are present, offer instant plan generation
      if (extracted.missingRequiredFields.length === 0) {
        addChatMessage({
          sender: 'assistant',
          text: 'All required parameters have been identified! Click the "Generate Master Plan" button below to calculate the deterministic budget and reverse timeline.',
        });
      }
    } catch {
      // Fallback response if fetch fails
      addChatMessage({
        sender: 'assistant',
        text: 'Received your details! You can also review or adjust any details directly using the Manual Form view.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePlan = () => {
    const draft = intakeDraft;
    const profile: EventProfile = {
      eventType: draft.eventType || 'wedding',
      title: draft.title || `${draft.city || 'Royal'} Celebration`,
      date: draft.date || '2026-12-18',
      city: draft.city || 'Jaipur',
      cityTier: draft.cityTier || 'tier2',
      totalBudget: draft.totalBudget || 4500000,
      functions:
        draft.functions && draft.functions.length > 0
          ? (draft.functions as EventProfile['functions'])
          : [
              {
                id: 'fn-1',
                name: 'Mehendi & Sangeet',
                type: 'sangeet',
                date: draft.date || '2026-12-17',
                guestCount: Math.round((draft.totalBudget ? draft.totalBudget / 15000 : 300) * 0.8),
                venueType: 'indoor',
                timeOfDay: 'night',
              },
              {
                id: 'fn-2',
                name: 'Vedic Wedding & Reception',
                type: 'wedding',
                date: draft.date || '2026-12-18',
                guestCount: draft.totalBudget ? Math.round(draft.totalBudget / 12000) : 350,
                venueType: draft.venuePreference || 'hybrid',
                timeOfDay: 'evening',
              },
            ],
      dietaryConstraints: draft.dietaryConstraints || ['pure_veg'],
      priorities: draft.priorities || ['venue', 'catering', 'photography'],
      venuePreference: draft.venuePreference || 'indoor',
      religionCultureNotes: draft.religionCultureNotes || '',
      language: draft.language || language,
    };

    const plan = generateCompleteEventPlan(profile);
    setCurrentPlan(plan);
  };

  const suggestionChips = [
    '3-day Royal Wedding in Jaipur, 350 guests, 45 Lakhs in December',
    'Intimate 1-day Wedding in Pune, 150 guests, 18 Lakhs, Pure Veg & Jain',
    '50th Milestone Birthday Gala in Mumbai, 120 guests, 8 Lakhs budget',
    'Community Cultural Festival in Ahmedabad, 600 guests, 15 Lakhs in Nov',
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="space-y-2 pt-4 text-center">
        <span className="dark:bg-saffron-950/60 inline-flex items-center space-x-1.5 rounded-full border border-saffron-200 bg-saffron-100 px-3 py-1 text-xs font-semibold text-saffron-800 dark:border-saffron-900 dark:text-saffron-300">
          <Sparkles className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400" />
          <span>Hybrid AI Event Planner</span>
        </span>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-maroon-900 dark:text-stone-100 sm:text-5xl">
          Plan Your Celebration with JALSA
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-stone-600 dark:text-stone-300 sm:text-base">
          Describe your celebration in natural language or voice. Our deterministic engine computes
          budget splits, reverse timelines, and conflict detection instantly.
        </p>

        {/* View Switcher */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800/80">
            <button
              onClick={() => setViewMode('chat')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'chat'
                  ? 'bg-white text-maroon-900 shadow-sm dark:bg-stone-900 dark:text-gold-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              AI Intake Chat
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`flex items-center space-x-1 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'form'
                  ? 'bg-white text-maroon-900 shadow-sm dark:bg-stone-900 dark:text-gold-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
              <span>Manual Form</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'chat' ? (
        /* Conversational Chat View */
        <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          {/* Chat message stream */}
          <div
            className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            aria-live="polite"
            role="log"
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${
                    msg.sender === 'user'
                      ? 'rounded-br-none bg-maroon-700 text-white'
                      : 'rounded-bl-none border border-stone-200/60 bg-ivory-100 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 rounded-2xl bg-stone-100 px-4 py-2 text-xs text-stone-500 dark:bg-stone-800">
                  <span className="h-2 w-2 animate-ping rounded-full bg-saffron-500" />
                  <span>Processing with hybrid engine...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="scrollbar-none flex space-x-2 overflow-x-auto border-t border-stone-100 bg-stone-50 px-4 py-2 dark:border-stone-800 dark:bg-stone-950/40">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-gold-400 hover:bg-gold-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-maroon-950/40"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={dict.intake.inputPlaceholder}
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                disabled={isGenerating}
              />

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`rounded-xl border p-3 transition-colors ${
                  isListening
                    ? 'animate-pulse border-red-600 bg-red-500 text-white'
                    : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
                title="Voice input (English / Hindi / Marathi)"
                aria-label="Toggle voice input"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isGenerating}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-maroon-700 to-saffron-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-maroon-800 hover:to-saffron-700 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Manual Form Fallback View */
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-800 dark:bg-stone-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Event Vertical
              </label>
              <select
                value={intakeDraft.eventType || 'wedding'}
                onChange={(e) => updateIntakeDraft({ eventType: e.target.value as EventType })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"
              >
                <option value="wedding">Indian Wedding (Multi-function)</option>
                <option value="birthday">Milestone Birthday Gala</option>
                <option value="community">Community Cultural Festival</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Event Title
              </label>
              <input
                type="text"
                value={intakeDraft.title || ''}
                onChange={(e) => updateIntakeDraft({ title: e.target.value })}
                placeholder="e.g. Royal Wedding Celebration"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Host City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={intakeDraft.city || ''}
                  onChange={(e) => updateIntakeDraft({ city: e.target.value })}
                  placeholder="e.g. Jaipur, Mumbai, Pune"
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                City Tier
              </label>
              <select
                value={intakeDraft.cityTier || 'tier2'}
                onChange={(e) =>
                  updateIntakeDraft({ cityTier: e.target.value as 'tier1' | 'tier2' | 'tier3' })
                }
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"
              >
                <option value="tier1">Tier 1 (Metro: Mumbai, Delhi, Bengaluru)</option>
                <option value="tier2">Tier 2 (Jaipur, Pune, Ahmedabad, Lucknow)</option>
                <option value="tier3">Tier 3 (Regional Towns & Districts)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total Budget (INR)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="number"
                  step="50000"
                  value={intakeDraft.totalBudget || 4500000}
                  onChange={(e) => updateIntakeDraft({ totalBudget: parseInt(e.target.value, 10) })}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Event Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="date"
                  value={intakeDraft.date || '2026-12-18'}
                  onChange={(e) => updateIntakeDraft({ date: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Dietary Constraints
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'pure_veg', label: 'Pure Veg' },
                  { id: 'jain', label: 'Jain (No Root Veg)' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'non_veg', label: 'Includes Non-Veg' },
                ].map((item) => {
                  const active = (intakeDraft.dietaryConstraints || []).includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        const current = intakeDraft.dietaryConstraints || [];
                        const updated = active
                          ? current.filter((c) => c !== item.id)
                          : [...current, item.id];
                        updateIntakeDraft({ dietaryConstraints: updated });
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        active
                          ? 'border-maroon-700 bg-maroon-700 text-white'
                          : 'border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Venue Preference
              </label>
              <select
                value={intakeDraft.venuePreference || 'indoor'}
                onChange={(e) =>
                  updateIntakeDraft({
                    venuePreference: e.target.value as 'indoor' | 'outdoor' | 'hybrid',
                  })
                }
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"
              >
                <option value="indoor">Indoor Banquet / Palace Hall</option>
                <option value="outdoor">Outdoor Royal Lawn</option>
                <option value="hybrid">Hybrid (Indoor Hall + Open Lawn)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGeneratePlan}
          className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-maroon-800 via-saffron-600 to-gold-500 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:from-maroon-900 hover:to-gold-600 hover:shadow-gold-glow"
        >
          <CheckCircle2 className="h-5 w-5 text-amber-200" />
          <span>Generate Master Event Plan</span>
        </button>
      </div>
    </div>
  );
}
