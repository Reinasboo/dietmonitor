'use client';

import React, { useState } from 'react';
import { Clock, Send, Info } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
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
}

export function LogForm({ onSubmit, isLoading = false }: LogFormProps) {
  const [content, setContent] = useState('');
  const [loggedAt, setLoggedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [steps, setSteps] = useState<string>('');
  const [waterSachets, setWaterSachets] = useState<string>('0');
  const [exercised, setExercised] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3xl">
      <div className="rounded-pill border-2 border-lilac-200 bg-lilac-50 p-xl shadow-md transition-all hover:border-lilac-300">
        <div className="space-y-lg">
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
          <div className="flex items-end gap-lg">
            <div className="flex-1">
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

            <div className="flex items-end gap-md">
              <div className="w-40">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lilac-700 mb-md">
                  <span>Steps</span>
                  <Info size={14} className="text-gray-400" title="Daily steps (benchmark: 6,000)" />
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g., 6000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
                />
                <p className="text-xs text-gray-400 mt-1">Benchmark: 6,000 steps/day</p>
              </div>

              <div className="w-32">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lilac-700 mb-md">
                  <span>Water</span>
                  <Info size={14} className="text-gray-400" title="Number of water sachets consumed today" />
                </label>
                <input
                  type="number"
                  min={0}
                  value={waterSachets}
                  onChange={(e) => setWaterSachets(e.target.value)}
                  className="w-full rounded-pill border-2 border-lilac-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
                />
                <p className="text-xs text-gray-400 mt-1">Avg target: 2 sachets/day</p>
              </div>

              <div className="flex items-center gap-sm">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lilac-700 mb-md mr-2">
                  <span>Exercised</span>
                  <Info size={14} className="text-gray-400" title="Check if you exercised today" />
                </label>
                <input type="checkbox" checked={exercised} onChange={(e) => setExercised(e.target.checked)} />
              </div>
            </div>

            {/* Submit button */}
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
