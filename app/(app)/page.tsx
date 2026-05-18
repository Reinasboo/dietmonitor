'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useEntryStore } from '@/lib/store';
import { groupEntriesByDay, calculateWeeklyProgress, Entry } from '@/lib/patterns';
import { LogForm, TimelineDay, EmptyState, LoadingDay, Button, HomeSummary } from '@/components';
import { reportError, trackEvent } from '@/lib/monitoring';
import { getHourInTimezone } from '@/lib/date-utils';
import { Search } from 'lucide-react';

const PAGE_SIZE = 20;

export default function HomePage() {
  const { entries, loading, error, setEntries, appendEntries, setLoading, setError, addEntry, removeEntry, updateEntry } =
    useEntryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [timezone, setTimezone] = useState('UTC');
  const [stepsGoalDays, setStepsGoalDays] = useState(4);
  const [hydrationGoalDays, setHydrationGoalDays] = useState(4);
  const [exerciseGoalDays, setExerciseGoalDays] = useState(3);
  const [entryGoalDays, setEntryGoalDays] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'late-night' | 'exercise' | 'water' | 'steps'>('all');
  const [deletedEntry, setDeletedEntry] = useState<{ entry: Entry; restoreTimeout: number | null } | null>(null);
  const router = useRouter();

  const loadTimezone = async () => {
    const supabase = createClient();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const preferenceQuery = await (supabase.from('user_preferences') as any)
        .select('timezone, weekly_steps_goal_days, weekly_hydration_goal_days, weekly_exercise_goal_days, weekly_entry_goal_days')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setTimezone(preferenceQuery.data?.timezone || 'UTC');
      setStepsGoalDays(preferenceQuery.data?.weekly_steps_goal_days ?? 4);
      setHydrationGoalDays(preferenceQuery.data?.weekly_hydration_goal_days ?? 4);
      setExerciseGoalDays(preferenceQuery.data?.weekly_exercise_goal_days ?? 3);
      setEntryGoalDays(preferenceQuery.data?.weekly_entry_goal_days ?? 5);
    } catch {
      setTimezone('UTC');
    }
  };

  const fetchEntriesPage = async (pageIndex: number, reset = false) => {
    const supabase = createClient();
    const pageStart = pageIndex * PAGE_SIZE;
    const pageEnd = pageStart + PAGE_SIZE - 1;

    if (reset) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .range(pageStart, pageEnd);

      if (fetchError) throw new Error(fetchError.message);

      const fetched = (data || []) as Entry[];
      if (reset) {
        setEntries(fetched);
      } else {
        appendEntries(fetched);
      }

      setPage(pageIndex);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch entries on mount
  useEffect(() => {
    fetchEntriesPage(0, true);
    loadTimezone();
  }, [setEntries, setLoading, setError]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchEntriesPage(page + 1, false);
  };

  const handleFilterSelect = (filter: string) => {
    if (filter === 'late-night' || filter === 'exercise' || filter === 'water' || filter === 'steps') {
      setActiveFilter(filter);
    }
  };

  const handleUndoDelete = async () => {
    if (!deletedEntry) return;
    const supabase = createClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { error: insertError } = await supabase.from('entries').insert([deletedEntry.entry]);
      if (insertError) throw new Error(insertError.message);
      setEntries([deletedEntry.entry, ...entries]);
      setDeletedEntry(null);
      await supabase.from('insights').delete().eq('user_id', session.user.id);
      trackEvent('entry_created', { undo: true }, '/');
    } catch (err) {
      reportError(err, '/', { action: 'undo_delete' });
    }
  };

  const handleLogEntry = async (
    content: string,
    loggedAt: Date,
    steps?: number | null,
    waterSachets?: number,
    exercised?: boolean
  ) => {
    const supabase = createClient();
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('entries')
        .insert([
          {
            user_id: session.user.id,
            content,
            logged_at: loggedAt.toISOString(),
            steps: steps ?? null,
            water_sachets: waterSachets ?? 0,
            exercised: exercised ?? false,
          },
        ])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      addEntry(data as Entry);
      trackEvent('entry_created', { hasSteps: steps != null, hasWater: (waterSachets ?? 0) > 0, exercised: !!exercised }, '/');
      setDeletedEntry(null);

      // Keep weekly insights cache fresh after writes.
      await supabase.from('insights').delete().eq('user_id', session.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log entry');
      reportError(err, '/', { action: 'create_entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const supabase = createClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { error: deleteError } = await supabase.from('entries').delete().eq('id', id);

      if (deleteError) throw new Error(deleteError.message);
      const entryToDelete = entries.find((entry) => entry.id === id);
      if (entryToDelete) {
        removeEntry(id);
        if (deletedEntry?.restoreTimeout) {
          window.clearTimeout(deletedEntry.restoreTimeout);
        }
        const restoreTimeout = window.setTimeout(() => setDeletedEntry(null), 10000);
        setDeletedEntry({ entry: entryToDelete, restoreTimeout });
      }
      trackEvent('entry_deleted', { entryId: id }, '/');
      await supabase.from('insights').delete().eq('user_id', session.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      reportError(err, '/', { action: 'delete_entry', entryId: id });
    }
  };

  const handleUpdateEntry = async (
    id: string,
    content: string,
    loggedAt: string,
    steps?: number | null,
    waterSachets?: number,
    exercised?: boolean
  ) => {
    const supabase = createClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { error: updateError } = await supabase
        .from('entries')
        .update({
          content,
          logged_at: loggedAt,
          steps: steps ?? null,
          water_sachets: waterSachets ?? 0,
          exercised: exercised ?? false,
        })
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);
      updateEntry(id, {
        content,
        logged_at: loggedAt,
        steps: steps ?? null,
        water_sachets: waterSachets ?? 0,
        exercised: exercised ?? false,
      });
      trackEvent('entry_updated', { entryId: id }, '/');
      await supabase.from('insights').delete().eq('user_id', session.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      reportError(err, '/', { action: 'update_entry', entryId: id });
    }
  };

  const weeklyProgress = calculateWeeklyProgress(entries, timezone, {
    stepsGoalDays,
    hydrationGoalDays,
    exerciseGoalDays,
    entryGoalDays,
  });

  const recentMeals = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.content.trim()).filter(Boolean))).slice(0, 5),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return entries.filter((entry) => {
      const content = entry.content.toLowerCase();
      const matchesQuery = !query || content.includes(query);
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'late-night' && getHourInTimezone(entry.logged_at, timezone) >= 23) ||
        (activeFilter === 'exercise' && !!entry.exercised) ||
        (activeFilter === 'water' && (entry.water_sachets ?? 0) >= 2) ||
        (activeFilter === 'steps' && (entry.steps ?? 0) >= 6000);

      return matchesQuery && matchesFilter;
    });
  }, [entries, searchQuery, activeFilter]);

  const groupedEntries = groupEntriesByDay(filteredEntries, timezone);

  return (
    <div className="space-y-2xl">
      {error && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200 animate-slide-in">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {deletedEntry && (
        <div className="rounded-pill border-2 border-amber-200 bg-amber-50 p-lg flex flex-wrap items-center justify-between gap-md">
          <div>
            <p className="text-sm font-medium text-amber-900">Entry deleted.</p>
            <p className="text-xs text-amber-800">You can undo this for a few seconds.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleUndoDelete}>
            Undo delete
          </Button>
        </div>
      )}

      <HomeSummary entries={entries} timezone={timezone} progress={weeklyProgress} onFilterSelect={handleFilterSelect} />

      <div className="rounded-pill border-2 border-gray-200 bg-white p-lg shadow-sm space-y-md">
        <div className="flex items-center gap-md">
          <Search size={16} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meals, notes, or ingredients"
            className="w-full rounded-pill border-2 border-gray-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
          />
        </div>
        <div className="flex flex-wrap gap-sm">
          {(['all', 'late-night', 'exercise', 'water', 'steps'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-md py-sm text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-lilac-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'late-night' ? 'Late-night' : filter === 'exercise' ? 'Exercise' : filter === 'water' ? 'Hydration' : 'Steps'}
            </button>
          ))}
        </div>
      </div>

      <LogForm onSubmit={handleLogEntry} isLoading={isSubmitting} recentMeals={recentMeals} />

      {loading ? (
        <div className="space-y-2xl">
          {[1, 2, 3].map((i) => (
            <LoadingDay key={i} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-lg">
          {groupedEntries.map(({ date, entries: dayEntries }) => (
            <TimelineDay
              key={date.toISOString()}
              date={date}
              entries={dayEntries}
              onDelete={handleDeleteEntry}
              onUpdate={handleUpdateEntry}
            />
          ))}

          {filteredEntries.length === 0 && (
            <div className="rounded-pill border-2 border-gray-200 bg-white p-xl text-center">
              <p className="text-sm font-medium text-gray-900">No entries match this search or filter.</p>
              <p className="mt-sm text-xs text-gray-500">Clear the search or switch to another filter.</p>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-md">
              <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoadingMore}>
                Load more entries
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
