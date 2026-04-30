'use client';

import React from 'react';
import { Entry } from '@/lib/patterns';
import { LogEntry } from './LogEntry';
import { formatDateForDisplay } from '@/lib/date-utils';
import clsx from 'clsx';

interface TimelineDayProps {
  date: Date;
  entries: Entry[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, content: string, loggedAt: string) => Promise<void>;
}

export function TimelineDay({ date, entries, onDelete, onUpdate }: TimelineDayProps) {
  const dateDisplay = formatDateForDisplay(date.toISOString());
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div className="mb-3xl animate-fade-in">
      <div
        className={clsx(
          'mb-xl flex items-center gap-md px-lg py-sm',
          isToday && 'rounded-pill bg-lilac-50'
        )}
      >
        <div className="flex-1">
          <h2 className={clsx('text-sm font-semibold', isToday ? 'text-lilac-700' : 'text-gray-600')}>
            {dateDisplay}
          </h2>
          <p className="text-xs text-gray-500">{entries.length} entry-ries</p>
        </div>
        {isToday && (
          <div className="inline-block h-2 w-2 rounded-full bg-lilac-500 animate-pulse-subtle" />
        )}
      </div>

      <div className="space-y-md">
        {entries.map((entry) => (
          <LogEntry
            key={entry.id}
            entry={entry}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
