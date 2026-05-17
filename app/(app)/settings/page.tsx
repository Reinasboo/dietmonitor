'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button, Input } from '@/components';
import { ArrowLeft, Lock, User } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [isSaving, setSaving] = useState(false);

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
          setTimezone(data.timezone);
        }
        if (error) throw new Error(error.message);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
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
