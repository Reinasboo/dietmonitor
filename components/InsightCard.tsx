'use client';

import React from 'react';
import { Insight } from '@/lib/patterns';
import clsx from 'clsx';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const confidence = insight.confidence ?? 'medium';

  const getIcon = () => {
    switch (insight.type) {
      case 'late_night':
        return '🌙';
      case 'early_morning':
        return '🌅';
      case 'repeated_meal':
        return '🔄';
      case 'snack_frequency':
        return '🍿';
      case 'steps_goal':
        return '👟';
      case 'hydration':
        return '💧';
      case 'exercise_frequency':
        return '🏃';
      default:
        return '💡';
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'late_night':
        return 'bg-indigo-50 border-indigo-200';
      case 'early_morning':
        return 'bg-orange-50 border-orange-200';
      case 'repeated_meal':
        return 'bg-green-50 border-green-200';
      case 'snack_frequency':
        return 'bg-yellow-50 border-yellow-200';
      case 'steps_goal':
        return 'bg-emerald-50 border-emerald-200';
      case 'hydration':
        return 'bg-cyan-50 border-cyan-200';
      case 'exercise_frequency':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-lilac-50 border-lilac-200';
    }
  };

  const getTextColor = () => {
    switch (insight.type) {
      case 'late_night':
        return 'text-indigo-900';
      case 'early_morning':
        return 'text-orange-900';
      case 'repeated_meal':
        return 'text-green-900';
      case 'snack_frequency':
        return 'text-yellow-900';
      case 'steps_goal':
        return 'text-emerald-900';
      case 'hydration':
        return 'text-cyan-900';
      case 'exercise_frequency':
        return 'text-rose-900';
      default:
        return 'text-lilac-900';
    }
  };

  const confidenceClasses =
    confidence === 'high'
      ? 'bg-emerald-100 text-emerald-800'
      : confidence === 'medium'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-100 text-slate-700';

  return (
    <div className={clsx('animate-slide-in rounded-pill border-2 p-lg', getBgColor())}>
      <div className="flex items-start gap-lg">
        <div className="text-2xl">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <div className="mb-sm flex items-center justify-between gap-md">
            <span className={clsx('inline-flex rounded-full px-sm py-1 text-xs font-semibold uppercase tracking-wide', confidenceClasses)}>
              {confidence} confidence
            </span>
            {typeof insight.sampleSize === 'number' && (
              <span className="text-xs text-gray-500">n={insight.sampleSize}</span>
            )}
          </div>
          <p className={clsx('text-sm font-medium leading-relaxed', getTextColor())}>{insight.message}</p>
          {insight.confidenceNote && (
            <p className="mt-sm text-xs text-gray-600">{insight.confidenceNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
