'use client';

import React, { useMemo, useState } from 'react';
import { Clock, Send, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { format, parseISO } from 'date-fns';

interface LogFormProps {
  onSubmit: (
    content: string,
    loggedAt: Date,
    steps?: number | null,
    waterSachets?: number,
    exercised?: boolean
  ) => Promise<void>;
  isLoading?: boolean;
  recentMeals?: string[];
}

export function LogForm({ onSubmit, isLoading = false, recentMeals = [] }: LogFormProps) {
  const [content, setContent] = useState('');
  const [loggedAt, setLoggedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [steps, setSteps] = useState<string>('');
  const [waterSachets, setWaterSachets] = useState<string>('0');
  const [exercised, setExercised] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const quickMeals = useMemo(() => recentMeals.slice(0, 5), [recentMeals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Please enter what you ate');
      return;
    }

    try {
      const date = parseISO(loggedAt);
      await onSubmit(
        content.trim(),
        date,
        steps === '' ? null : Number(steps),
        Number(waterSachets || 0),
        exercised
      );
      setContent('');
      setLoggedAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setSteps('');
      setWaterSachets('0');
      setExercised(false);
      setShowDetails(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3xl">
      <div className="rounded-pill border-2 border-lilac-200 bg-lilac-50 p-xl shadow-md transition-all hover:border-lilac-300">
        <div className="space-y-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-lilac-700">Quick log</p>
              <p className="text-sm text-gray-600">Capture a meal fast, then add details only if you want them.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowDetails((value) => !value)}>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? 'Hide details' : 'More details'}
            </Button>
          </div>

          {quickMeals.length > 0 && (
            <div className="space-y-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lilac-700">
                <Sparkles size={14} />
                Recent meals
              </div>
              <div className="flex flex-wrap gap-sm">
                {quickMeals.map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setContent(meal)}
                    className="rounded-full border border-lilac-200 bg-white px-md py-sm text-xs font-medium text-gray-700 transition-colors hover:border-lilac-300 hover:bg-lilac-50"
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Food input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-lilac-700 mb-md">
              What did you eat?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., 2 packs Indomie + egg, or just 'shawarma'"
              className="w-full resize-none rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium placeholder:text-gray-400 focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
              rows={2}
            />
          </div>

          {/* Time input */}
          <div className="flex flex-wrap items-end gap-lg">
            <div className="min-w-[260px] flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-lilac-700 mb-md">
                <Clock size={14} className="inline mr-2" />
                Time logged
              </label>
              <input
                type="datetime-local"
                value={loggedAt}
                onChange={(e) => setLoggedAt(e.target.value)}
                className="w-full rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
              />
            </div>
          </div>

          {showDetails && (
            <div className="rounded-2xl border border-lilac-200 bg-white/80 p-lg shadow-sm space-y-lg">
              <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-md">Steps</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g., 6000"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="w-full rounded-pill border-2 border-gray-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-md">Water</label>
                  <input
                    type="number"
                    min={0}
                    value={waterSachets}
                    onChange={(e) => setWaterSachets(e.target.value)}
                    className="w-full rounded-pill border-2 border-gray-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
                  />
                </div>
                <div className="flex items-end gap-sm pb-sm">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-700 mr-2">
                    <span>Exercised</span>
                    <Info size={14} className="text-gray-400" />
                  </label>
                  <input type="checkbox" checked={exercised} onChange={(e) => setExercised(e.target.checked)} />
                </div>
              </div>
              <p className="text-xs text-gray-500">Tip: keep details off for fast logging, then expand only when needed.</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              size="md"
              className="whitespace-nowrap"
            >
              <Send size={16} />
              <span>Log</span>
            </Button>
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </form>
  );
}
