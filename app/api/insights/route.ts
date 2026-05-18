import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import {
  Entry,
  Insight,
  calculateWeeklyProgress,
  generateInsights,
} from '@/lib/patterns';
import { getMondayOfWeek } from '@/lib/date-utils';
import { createAuthenticatedSupabase } from '@/lib/server-auth';

type InsightInsert = Database['public']['Tables']['insights']['Insert'];

function parseCachedInsights(data: Array<Record<string, unknown>>): Insight[] {
  return data
    .map((row) => row.data)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      type: String(item.type ?? ''),
      message: String(item.message ?? ''),
      count: typeof item.count === 'number' ? item.count : undefined,
      time: typeof item.time === 'string' ? item.time : undefined,
      meal: typeof item.meal === 'string' ? item.meal : undefined,
      confidence:
        item.confidence === 'low' || item.confidence === 'medium' || item.confidence === 'high'
          ? item.confidence
          : undefined,
      sampleSize: typeof item.sampleSize === 'number' ? item.sampleSize : undefined,
      confidenceNote: typeof item.confidenceNote === 'string' ? item.confidenceNote : undefined,
    }))
    .filter((insight) => insight.type && insight.message) as Insight[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refresh = url.searchParams.get('refresh') === '1';
  const { supabase, user, error: userError } = await createAuthenticatedSupabase(request);

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferenceQuery = await (supabase.from('user_preferences') as any)
    .select('timezone, weekly_steps_goal_days, weekly_hydration_goal_days, weekly_exercise_goal_days, weekly_entry_goal_days')
    .eq('user_id', user.id)
    .maybeSingle();

  const timezone = preferenceQuery.data?.timezone || 'UTC';
  const goals = {
    stepsGoalDays: preferenceQuery.data?.weekly_steps_goal_days,
    hydrationGoalDays: preferenceQuery.data?.weekly_hydration_goal_days,
    exerciseGoalDays: preferenceQuery.data?.weekly_exercise_goal_days,
    entryGoalDays: preferenceQuery.data?.weekly_entry_goal_days,
  };
  const weekStart = getMondayOfWeek(new Date(), timezone);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: entriesData, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', weekAgo.toISOString())
    .order('logged_at', { ascending: false });

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const entries = (entriesData || []) as Entry[];

  const { data: cachedRows, error: cachedError } = await supabase
    .from('insights')
    .select('data, created_at')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .order('created_at', { ascending: false });

  if (cachedError) {
    return NextResponse.json({ error: cachedError.message }, { status: 500 });
  }

  if (!refresh && cachedRows && cachedRows.length > 0) {
    const insights = parseCachedInsights(cachedRows as unknown as Array<Record<string, unknown>>);
    return NextResponse.json({
      insights,
      entries,
      progress: calculateWeeklyProgress(entries, timezone, goals),
      source: 'cache',
    });
  }

  const insights = generateInsights(entries, timezone);

  const deleteResult = await supabase
    .from('insights')
    .delete()
    .eq('user_id', user.id)
    .eq('week_start', weekStart);

  if (deleteResult.error) {
    return NextResponse.json({ error: deleteResult.error.message }, { status: 500 });
  }

  if (insights.length) {
    const rows: InsightInsert[] = insights.map((insight) => ({
      user_id: user.id,
      insight_type: insight.type,
      data: insight as unknown as Record<string, unknown>,
      week_start: weekStart,
    }));

    const { error: insertError } = await (supabase.from('insights') as any).insert(rows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    insights,
    entries,
    progress: calculateWeeklyProgress(entries, timezone, goals),
    source: 'computed',
  });
}
