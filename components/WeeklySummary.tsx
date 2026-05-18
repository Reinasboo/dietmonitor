'use client';

import React from 'react';
import { Entry } from '@/lib/patterns';

interface WeeklySummaryProps {
  entries: Entry[];
}

export function WeeklySummary({ entries }: WeeklySummaryProps) {
  if (!entries || entries.length === 0) return null;

  const dayMap: Record<string, { steps: number; water: number; exercised: boolean }> = {};
  entries.forEach((e) => {
    const day = new Date(e.logged_at).toDateString();
    if (!dayMap[day]) dayMap[day] = { steps: 0, water: 0, exercised: false };
    if (typeof e.steps === 'number') dayMap[day].steps = Math.max(dayMap[day].steps, e.steps ?? 0);
    dayMap[day].water += e.water_sachets ?? 0;
    dayMap[day].exercised = dayMap[day].exercised || !!e.exercised;
  });

  const days = Object.keys(dayMap).length;
  const avgSteps = Math.round(Object.values(dayMap).reduce((s, d) => s + d.steps, 0) / days);
  const avgWater = (Object.values(dayMap).reduce((s, d) => s + d.water, 0) / days).toFixed(1);
  const exerciseDays = Object.values(dayMap).filter((d) => d.exercised).length;
  const stepsGoalDays = Object.values(dayMap).filter((d) => d.steps >= 6000).length;

  return (
    <div className="mb-3xl space-y-lg">
      <div className="rounded-pill bg-emerald-50 border-2 border-emerald-200 p-lg">
        <h3 className="text-sm font-semibold text-emerald-900">Weekly summary</h3>
        <div className="mt-md text-sm text-emerald-800">
          <div>
            Average steps/day: <span className="font-medium">{avgSteps}</span>
          </div>
          <div>
            Average water/day: <span className="font-medium">{avgWater}</span> sachets
          </div>
          <div>
            Days exercised: <span className="font-medium">{exerciseDays}</span>
          </div>
          <div>
            Days meeting 6,000 steps: <span className="font-medium">{stepsGoalDays}</span>
          </div>
        </div>
      </div>

      {stepsGoalDays >= 4 && (
        <div className="rounded-pill bg-green-50 border-2 border-green-200 p-lg">
          <p className="text-sm font-medium text-green-900">Great job — you met the 6,000-step benchmark on {stepsGoalDays} days this week!</p>
        </div>
      )}
    </div>
  );
}

export default WeeklySummary;
