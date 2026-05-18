'use client';

import React from 'react';
import { Entry, WeeklyProgress, calculateWeeklyProgress } from '@/lib/patterns';

interface WeeklySummaryProps {
  entries: Entry[];
  progress?: WeeklyProgress;
}

export function WeeklySummary({ entries, progress: progressFromProps }: WeeklySummaryProps) {
  if (!entries || entries.length === 0) return null;
  const progress = progressFromProps ?? calculateWeeklyProgress(entries);

  return (
    <div className="mb-3xl space-y-lg">
      <div className="rounded-pill bg-emerald-50 border-2 border-emerald-200 p-lg">
        <h3 className="text-sm font-semibold text-emerald-900">Weekly summary</h3>
        <div className="mt-md text-sm text-emerald-800">
          <div>
            Current streak: <span className="font-medium">{progress.streakDays} day{progress.streakDays === 1 ? '' : 's'}</span>
          </div>
          <div>
            Average steps/day: <span className="font-medium">{progress.avgSteps}</span>
          </div>
          <div>
            Average water/day: <span className="font-medium">{progress.avgWater}</span> sachets
          </div>
          <div>
            Days exercised: <span className="font-medium">{progress.exerciseDays}</span>
          </div>
          <div>
            Days meeting 6,000 steps: <span className="font-medium">{progress.stepsGoalDays}</span> / {progress.targets.stepsGoalDays}
          </div>
          <div>
            Days meeting hydration target (2+): <span className="font-medium">{progress.hydrationGoalDays}</span> / {progress.targets.hydrationGoalDays}
          </div>
          <div>
            Logging days: <span className="font-medium">{progress.trackedDays}</span> / {progress.targets.entryGoalDays}
          </div>
        </div>
      </div>

      {progress.stepsGoalMet && (
        <div className="rounded-pill bg-green-50 border-2 border-green-200 p-lg">
          <p className="text-sm font-medium text-green-900">
            Great job — you met the 6,000-step benchmark on {progress.stepsGoalDays} days this week.
          </p>
        </div>
      )}

      {!progress.stepsGoalMet && (
        <div className="rounded-pill bg-amber-50 border-2 border-amber-200 p-lg">
          <p className="text-sm font-medium text-amber-900">
            You are {Math.max(0, 4 - progress.stepsGoalDays)} day{Math.max(0, 4 - progress.stepsGoalDays) === 1 ? '' : 's'} away from your weekly steps goal.
          </p>
        </div>
      )}

      {progress.entryGoalMet && (
        <div className="rounded-pill bg-lilac-50 border-2 border-lilac-200 p-lg">
          <p className="text-sm font-medium text-lilac-900">
            You are meeting your logging target for the week. Keep the streak alive.
          </p>
        </div>
      )}
    </div>
  );
}

export default WeeklySummary;
