import { NextResponse } from 'next/server';
import { createAuthenticatedSupabase } from '@/lib/server-auth';

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return 'id,content,logged_at,created_at,steps,water_sachets,exercised';
  }

  const headers = ['id', 'content', 'logged_at', 'created_at', 'steps', 'water_sachets', 'exercised'];
  const escape = (value: unknown) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const body = rows
    .map((row) => headers.map((header) => escape(row[header])).join(','))
    .join('\n');

  return `${headers.join(',')}\n${body}`;
}

export async function GET(request: Request) {
  const { supabase, user, error: userError } = await createAuthenticatedSupabase(request);

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as Array<Record<string, unknown>>;

  if (format === 'csv') {
    return new NextResponse(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mindful-entries.csv"',
      },
    });
  }

  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mindful-entries.json"',
    },
  });
}
