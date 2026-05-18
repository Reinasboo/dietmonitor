'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button, Input } from '@/components';
import { ArrowLeft, Bell, Download, Lock, User } from 'lucide-react';
import { reportError, trackEvent } from '@/lib/monitoring';
import { downloadWithAuth, fetchWithAuth } from '@/lib/auth-fetch';

interface ReminderSuggestion {
  timeLabel: string;
  hour24: number;
  minute: number;
  reason: string;
  message: string;
}

interface UserPreferences {
  timezone: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  weekly_steps_goal_days: number;
  weekly_hydration_goal_days: number;
  weekly_exercise_goal_days: number;
  weekly_entry_goal_days: number;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [weeklyStepsGoalDays, setWeeklyStepsGoalDays] = useState(4);
  const [weeklyHydrationGoalDays, setWeeklyHydrationGoalDays] = useState(4);
  const [weeklyExerciseGoalDays, setWeeklyExerciseGoalDays] = useState(3);
  const [weeklyEntryGoalDays, setWeeklyEntryGoalDays] = useState(5);
  const [isSaving, setSaving] = useState(false);
  const [reminder, setReminder] = useState<ReminderSuggestion | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          return;
        }

        setUser(session.user);

        // Fetch user preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (data && !error) {
          const preferences = data as UserPreferences;
          setTimezone(preferences.timezone);
          setReminderEnabled(preferences.reminder_enabled);
          setReminderTime(preferences.reminder_time || '18:00');
          setWeeklyStepsGoalDays(preferences.weekly_steps_goal_days || 4);
          setWeeklyHydrationGoalDays(preferences.weekly_hydration_goal_days || 4);
          setWeeklyExerciseGoalDays(preferences.weekly_exercise_goal_days || 3);
          setWeeklyEntryGoalDays(preferences.weekly_entry_goal_days || 5);
        }
        if (error) throw new Error(error.message);
      } catch (err) {
        setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loadReminderSuggestion = async () => {
    setReminderLoading(true);
    try {
      const response = await fetchWithAuth('/api/reminders');
      if (!response.ok) {
        throw new Error('Failed to load reminder suggestion');
      }
      const payload = (await response.json()) as { suggestion: ReminderSuggestion; reminderEnabled?: boolean; reminderTime?: string | null };
      setReminder(payload.suggestion ?? null);
      if (typeof payload.reminderEnabled === 'boolean') {
        setReminderEnabled(payload.reminderEnabled);
      }
      if (payload.reminderTime) {
        setReminderTime(payload.reminderTime);
      }
      trackEvent('reminder_refreshed', { timeLabel: payload.suggestion?.timeLabel }, '/settings');
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Failed to load reminder suggestion');
      reportError(err, '/settings', { action: 'load_reminder' });
    } finally {
      setReminderLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadReminderSuggestion();
    }
  }, [loading]);

  const handleSavePreferences = async () => {
    const supabase = createClient();
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: session.user.id,
            timezone,
            reminder_enabled: reminderEnabled,
            reminder_time: reminderTime,
            weekly_steps_goal_days: weeklyStepsGoalDays,
            weekly_hydration_goal_days: weeklyHydrationGoalDays,
            weekly_exercise_goal_days: weeklyExerciseGoalDays,
            weekly_entry_goal_days: weeklyEntryGoalDays,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      trackEvent('settings_saved', { timezone }, '/settings');
    } catch (err) {
      reportError(err, '/settings', { action: 'save_settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await downloadWithAuth(`/api/export?format=${format}`, `mindful-entries.${format}`);
      trackEvent('export_clicked', { format }, '/settings');
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Failed to export data');
      reportError(err, '/settings', { action: 'export_data', format });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-md text-sm font-medium text-lilac-600 hover:text-lilac-700 mb-lg"
      >
        <ArrowLeft size={16} />
        Back to timeline
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-md">Settings</h1>
        <p className="text-sm text-gray-600">Manage your preferences</p>
      </div>

      {settingsError && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200">
          <p className="text-sm text-red-700">{settingsError}</p>
        </div>
      )}

      {/* Account section */}
      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl">
        <div className="mb-lg flex items-center gap-lg border-b-2 border-gray-100 pb-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac-100">
            <User size={20} className="text-lilac-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Account</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences section */}
      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl space-y-lg">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-md">Preferences</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-md">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-pill border-2 border-gray-200 bg-white px-lg py-md text-sm font-medium focus:border-lilac-500 focus:outline-none focus:ring-2 focus:ring-lilac-500"
          >
            <option value="UTC">UTC</option>
            <option value="UTC-5">UTC-5 (EST)</option>
            <option value="UTC-6">UTC-6 (CST)</option>
            <option value="UTC-7">UTC-7 (MST)</option>
            <option value="UTC-8">UTC-8 (PST)</option>
            <option value="UTC+1">UTC+1 (CET)</option>
            <option value="UTC+5:30">UTC+5:30 (IST)</option>
            <option value="UTC+8">UTC+8 (SGT)</option>
            <option value="UTC+9">UTC+9 (JST)</option>
          </select>
        </div>

        <Button onClick={handleSavePreferences} isLoading={isSaving} size="md">
          Save preferences
        </Button>
      </div>

      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl space-y-lg">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-md">Goals</h2>
          <p className="text-xs text-gray-600">Set the weekly targets the app should use when showing progress.</p>
        </div>

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="number"
            min={1}
            label="Steps days / week"
            value={weeklyStepsGoalDays}
            onChange={(e) => setWeeklyStepsGoalDays(Number(e.target.value || 0))}
          />
          <Input
            type="number"
            min={1}
            label="Hydration days / week"
            value={weeklyHydrationGoalDays}
            onChange={(e) => setWeeklyHydrationGoalDays(Number(e.target.value || 0))}
          />
          <Input
            type="number"
            min={1}
            label="Exercise days / week"
            value={weeklyExerciseGoalDays}
            onChange={(e) => setWeeklyExerciseGoalDays(Number(e.target.value || 0))}
          />
          <Input
            type="number"
            min={1}
            label="Logging days / week"
            value={weeklyEntryGoalDays}
            onChange={(e) => setWeeklyEntryGoalDays(Number(e.target.value || 0))}
          />
        </div>
      </div>

      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl space-y-lg">
        <div className="flex items-start gap-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac-100">
            <Bell size={20} className="text-lilac-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900 mb-md">Smart reminder</h2>
            <div className="mb-md flex items-center gap-sm">
              <input
                id="reminders-enabled"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
              />
              <label htmlFor="reminders-enabled" className="text-sm font-medium text-gray-700">
                Enable reminders
              </label>
            </div>
            <Input
              type="time"
              label="Preferred reminder time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            {reminder ? (
              <>
                <p className="text-sm text-gray-700">Suggested time: <span className="font-semibold">{reminder.timeLabel}</span></p>
                <p className="text-xs text-gray-600 mt-sm">{reminder.message}</p>
                <p className="text-xs text-gray-500 mt-sm">Reason: {reminder.reason}</p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No suggestion yet.</p>
            )}
            <div className="mt-md flex flex-wrap gap-sm">
              <Button variant="secondary" size="sm" onClick={loadReminderSuggestion} isLoading={reminderLoading}>
                Refresh suggestion
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSavePreferences} isLoading={isSaving}>
                Save reminders
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl space-y-md">
        <h2 className="text-sm font-semibold text-gray-900">Export and backup</h2>
        <p className="text-xs text-gray-600">
          Download your data anytime in JSON or CSV format.
        </p>
        <div className="flex flex-wrap gap-sm">
          <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
            <Download size={14} />
            Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Privacy section */}
      <div className="rounded-pill border-2 border-gray-200 bg-white p-2xl">
        <div className="flex items-start gap-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac-100">
            <Lock size={20} className="text-lilac-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-md">Privacy</h2>
            <p className="text-xs text-gray-600 mb-lg">
              Your data is private by default. We don&apos;t share, sell, or track anything.
            </p>
            <p className="text-xs text-gray-500">
              All your food entries are encrypted and stored securely. Only you can access them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
