'use client';

import React from 'react';
import { Entry, WeeklyProgress, groupEntriesByDay } from '@/lib/patterns';
import { getDayKeyInTimezone } from '@/lib/date-utils';
import { Button } from './Button';
import clsx from 'clsx';

interface HomeSummaryProps {
  entries: Entry[];
  timezone?: string;
  progress?: WeeklyProgress;
  onFilterSelect?: (filter: string) => void;
}

function StatPill({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={clsx('rounded-pill border-2 p-md', tone)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ProgressRing({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const safeMax = Math.max(max, 1);
  const pct = Math.min(100, Math.round((value / safeMax) * 100));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-md rounded-pill border-2 border-gray-200 bg-white p-md">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="#e5e7eb" strokeWidth="5" fill="none" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={tone}
        />
      </svg>
      <div>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}/{max}</p>
      </div>
    </div>
  );
}

export function HomeSummary({ entries, timezone = 'UTC', progress, onFilterSelect }: HomeSummaryProps) {
  if (!entries.length) return null;

  const now = new Date();
  const todayKey = getDayKeyInTimezone(now.toISOString(), timezone);
  const grouped = groupEntriesByDay(entries, timezone);
  const todayGroup = grouped.find((group) => group.date.toISOString().split('T')[0] === todayKey);
  const todayEntries = todayGroup?.entries ?? [];
  const todayCount = todayEntries.length;
  const todaySteps = todayEntries.reduce((sum, entry) => sum + (entry.steps || 0), 0);
  const todayWater = todayEntries.reduce((sum, entry) => sum + (entry.water_sachets || 0), 0);
  const todayExercise = todayEntries.some((entry) => entry.exercised);

  const lastSeven = grouped.slice(0, 7).reverse();
  const maxCount = Math.max(...lastSeven.map((group) => group.entries.length), 1);

  const weeklyProgress = progress ?? {
    trackedDays: 0,
    avgSteps: 0,
    avgWater: 0,
    exerciseDays: 0,
    stepsGoalDays: 0,
    hydrationGoalDays: 0,
    streakDays: 0,
    stepsGoalMet: false,
    hydrationGoalMet: false,
    exerciseGoalMet: false,
    entryGoalMet: false,
    targets: {
      stepsGoalDays: 4,
      hydrationGoalDays: 4,
      exerciseGoalDays: 3,
      entryGoalDays: 5,
    },
  };

  return (
    <section className="space-y-lg rounded-3xl border-2 border-gray-200 bg-white p-2xl shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-lg">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Today at a glance</h2>
          <p className="text-sm text-gray-600">A quick read on today&apos;s logging rhythm.</p>
        </div>
        <div className="flex flex-wrap gap-sm text-xs font-medium text-gray-600">
          {onFilterSelect && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onFilterSelect('exercise')}>
                Exercise
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onFilterSelect('steps')}>
                Steps
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onFilterSelect('water')}>
                Water
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Today&apos;s entries" value={String(todayCount)} tone="bg-lilac-50 border-lilac-200" />
        <StatPill label="Today&apos;s steps" value={String(todaySteps)} tone="bg-emerald-50 border-emerald-200" />
        <StatPill label="Today&apos;s water" value={String(todayWater)} tone="bg-cyan-50 border-cyan-200" />
        <StatPill label="Exercise" value={todayExercise ? 'Yes' : 'No'} tone={todayExercise ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} />
      </div>

      {weeklyProgress && (
        <div className="grid gap-md sm:grid-cols-3">
          <ProgressRing label="Steps goal" value={weeklyProgress.stepsGoalDays} max={weeklyProgress.targets.stepsGoalDays} tone="text-emerald-500" />
          <ProgressRing label="Hydration goal" value={weeklyProgress.hydrationGoalDays} max={weeklyProgress.targets.hydrationGoalDays} tone="text-cyan-500" />
          <ProgressRing label="Exercise goal" value={weeklyProgress.exerciseDays} max={weeklyProgress.targets.exerciseGoalDays} tone="text-rose-500" />
        </div>
      )}

      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">7-day trend</h3>
          <span className="text-xs text-gray-500">Entries per day</span>
        </div>
        <div className="flex items-end gap-2 rounded-2xl bg-gray-50 p-md">
          {lastSeven.map((group) => {
            const height = Math.max(24, Math.round((group.entries.length / maxCount) * 96));
            return (
              <div key={group.date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-lilac-500 to-lilac-300"
                  style={{ height: `${height}px` }}
                  aria-label={`${group.entries.length} entries`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {group.date.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
        <Button variant="secondary" onClick={() => onFilterSelect?.('late-night')}>
          Late-night meals
        </Button>
        <Button variant="secondary" onClick={() => onFilterSelect?.('exercise')}>
          Active days
        </Button>
        <Button variant="secondary" onClick={() => onFilterSelect?.('water')}>
          Hydration days
        </Button>
      </div>

      <div className="rounded-2xl bg-gray-50 p-md text-sm text-gray-700">
        <span className="font-semibold text-gray-900">Goal check: </span>
        {weeklyProgress.entryGoalMet ? 'You are meeting your logging target.' : `You are ${Math.max(0, weeklyProgress.targets.entryGoalDays - weeklyProgress.trackedDays)} day(s) away from your logging target.`}
      </div>
    </section>
  );
}

export default HomeSummary;
