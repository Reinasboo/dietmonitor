'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-3xl text-center">
      <div className="h-16 w-16 rounded-full bg-lilac-100 flex items-center justify-center mb-lg">
        <BookOpen size={32} className="text-lilac-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-md">No entries yet</h2>
      <p className="text-sm text-gray-600 max-w-xs">
        Start logging your meals to build awareness of your eating patterns. No judgment—just honesty.
      </p>
    </div>
  );
}

export function LoadingEntry() {
  return (
    <div className="rounded-pill border-2 border-gray-200 bg-white p-lg shadow-sm">
      <div className="space-y-md">
        <div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

export function LoadingDay() {
  return (
    <div className="mb-3xl">
      <div className="mb-xl h-5 w-1/4 rounded-full bg-gray-200 animate-pulse" />
      <div className="space-y-md">
        {[1, 2, 3].map((i) => (
          <LoadingEntry key={i} />
        ))}
      </div>
    </div>
  );
}
