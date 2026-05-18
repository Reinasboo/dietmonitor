'use client';

import React from 'react';
import { Insight } from '@/lib/patterns';
import { Lightbulb } from 'lucide-react';
import clsx from 'clsx';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
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

  return (
    <div className={clsx('animate-slide-in rounded-pill border-2 p-lg', getBgColor())}>
      <div className="flex items-start gap-lg">
        <div className="text-2xl">{getIcon()}</div>
        <p className={clsx('text-sm font-medium leading-relaxed', getTextColor())}>
          {insight.message}
        </p>
      </div>
    </div>
  );
}
