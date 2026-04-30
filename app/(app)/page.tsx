'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useEntryStore } from '@/lib/store';
import { groupEntriesByDay } from '@/lib/patterns';
import { Entry } from '@/lib/patterns';
import { LogForm, TimelineDay, EmptyState, LoadingDay } from '@/components';

export default function HomePage() {
  const supabase = createClient();
  const { entries, loading, error, setEntries, setLoading, setError, addEntry, removeEntry, updateEntry } =
    useEntryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError('Not authenticated');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('logged_at', { ascending: false });

        if (fetchError) throw fetchError;
        setEntries(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [supabase, setEntries, setLoading, setError]);

  const handleLogEntry = async (content: string, loggedAt: Date) => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Not authenticated');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('entries')
        .insert([
          {
            user_id: session.user.id,
            content,
            logged_at: loggedAt.toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      addEntry(data as Entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('entries').delete().eq('id', id);

      if (deleteError) throw deleteError;
      removeEntry(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const handleUpdateEntry = async (id: string, content: string, loggedAt: string) => {
    try {
      const { error: updateError } = await supabase
        .from('entries')
        .update({
          content,
          logged_at: loggedAt,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      updateEntry(id, content, loggedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
    }
  };

  const groupedEntries = groupEntriesByDay(entries);

  return (
    <div className="space-y-2xl">
      {error && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200 animate-slide-in">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <LogForm onSubmit={handleLogEntry} isLoading={isSubmitting} />

      {loading ? (
        <div className="space-y-2xl">
          {[1, 2, 3].map((i) => (
            <LoadingDay key={i} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {groupedEntries.map(({ date, entries: dayEntries }) => (
            <TimelineDay
              key={date.toISOString()}
              date={date}
              entries={dayEntries}
              onDelete={handleDeleteEntry}
              onUpdate={handleUpdateEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
