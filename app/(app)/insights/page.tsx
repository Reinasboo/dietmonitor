'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { generateInsights, Insight, Entry } from '@/lib/patterns';
import { InsightCard } from '@/components';
import { getMondayOfWeek } from '@/lib/date-utils';
import { Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Fetch entries from the past 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data, error: fetchError } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('logged_at', weekAgo.toISOString())
          .order('logged_at', { ascending: false });

        if (fetchError) throw new Error(fetchError.message);

        const generatedInsights = generateInsights((data || []) as Entry[]);
        setInsights(generatedInsights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="space-y-2xl">
      <div className="mb-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-md">This week</h1>
        <p className="text-sm text-gray-600">
          No judgment here—just data from the past 7 days.
        </p>
      </div>

      {error && (
        <div className="rounded-pill bg-red-50 p-lg border-2 border-red-200">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-pill bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-3xl text-center">
          <div className="h-16 w-16 rounded-full bg-lilac-100 flex items-center justify-center mb-lg">
            <Lightbulb size={32} className="text-lilac-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-md">No patterns yet</h2>
          <p className="text-sm text-gray-600 max-w-xs">
            Log more meals to see your eating patterns emerge.
          </p>
        </div>
      ) : (
        <div className="space-y-lg">
          {insights.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
