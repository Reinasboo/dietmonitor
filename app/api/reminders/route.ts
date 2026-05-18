import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { Entry, generateReminderSuggestion } from '@/lib/patterns';

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferenceQuery = await (supabase.from('user_preferences') as any)
    .select('timezone, reminder_enabled, reminder_time')
    .eq('user_id', user.id)
    .maybeSingle();

  const timezone = preferenceQuery.data?.timezone || 'UTC';
  const reminderEnabled = Boolean(preferenceQuery.data?.reminder_enabled);
  const reminderTime = preferenceQuery.data?.reminder_time || null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suggestion = generateReminderSuggestion((data || []) as Entry[], timezone);
  return NextResponse.json({ suggestion, reminderEnabled, reminderTime });
}
