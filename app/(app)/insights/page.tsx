'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Entry, Insight, WeeklyProgress } from '@/lib/patterns';
import { InsightCard, WeeklySummary } from '@/components';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import { reportError, trackEvent } from '@/lib/monitoring';

interface InsightsApiResponse {
  insights: Insight[];
  entries: Entry[];
  progress: WeeklyProgress;
  source: 'cache' | 'computed';
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [source, setSource] = useState<'cache' | 'computed' | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchInsights = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/insights${forceRefresh ? '?refresh=1' : ''}`, {
        method: 'GET',
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const payload = (await response.json()) as InsightsApiResponse;
      setInsights(payload.insights || []);
      setEntries(payload.entries || []);
      setProgress(payload.progress || null);
      setSource(payload.source || null);
      if (forceRefresh) {
        trackEvent('insights_refreshed', { source: payload.source, insightCount: payload.insights?.length || 0 }, '/insights');
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
      reportError(err, '/insights', { action: forceRefresh ? 'refresh_insights' : 'load_insights' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-2xl">
      <div className="mb-2xl flex items-end justify-between gap-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-md">This week</h1>
          <p className="text-sm text-gray-600">
            No judgment here—just data from the past 7 days.
          </p>
          {source && (
            <p className="mt-sm text-xs text-gray-500">
              Source: {source === 'cache' ? 'cached insights' : 'freshly computed insights'}
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchInsights(true)}
          isLoading={refreshing}
          className="whitespace-nowrap"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {progress && (
        <div className="grid gap-md lg:grid-cols-3">
          <div className="rounded-pill border-2 border-gray-200 bg-white p-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recap</p>
            <p className="mt-sm text-sm text-gray-700">
              You logged on <span className="font-semibold text-gray-900">{progress.trackedDays}</span> days and kept a <span className="font-semibold text-gray-900">{progress.streakDays}-day</span> streak.
            </p>
          </div>
          <div className="rounded-pill border-2 border-gray-200 bg-white p-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Most useful habit</p>
            <p className="mt-sm text-sm text-gray-700">
              {progress.stepsGoalMet ? 'You are already hitting your movement goal on a consistent basis.' : 'Movement is the clearest place to build momentum this week.'}
            </p>
          </div>
          <div className="rounded-pill border-2 border-gray-200 bg-white p-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Next target</p>
            <p className="mt-sm text-sm text-gray-700">
              {progress.entryGoalMet ? 'Keep the logging streak going and tighten one other habit.' : `Reach ${progress.targets.entryGoalDays} logging days to lock in consistency.`}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-pill bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-3xl text-center">
          <div className="h-16 w-16 rounded-full bg-lilac-100 flex items-center justify-center mb-lg">
            <Lightbulb size={32} className="text-lilac-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-md">No patterns yet</h2>
          <p className="text-sm text-gray-600 max-w-xs">
            Log more meals to see your eating patterns emerge.
          </p>
        </div>
      ) : (
        <div className="space-y-lg">
          <WeeklySummary entries={entries} progress={progress ?? undefined} />
          {insights.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
