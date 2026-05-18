import { parseISO, getHours, getMinutes, startOfDay } from 'date-fns';

export interface Entry {
  id: string;
  content: string;
  logged_at: string;
  created_at: string;
  steps?: number | null;
  water_sachets?: number;
  exercised?: boolean;
}

export interface Insight {
  type:
    | 'late_night'
    | 'early_morning'
    | 'repeated_meal'
    | 'snack_frequency'
    | 'steps_goal'
    | 'hydration'
    | 'exercise_frequency';
  message: string;
  count?: number;
  time?: string;
  meal?: string;
}

/**
 * Detects late-night eating patterns (11 PM - 3 AM)
 */
export function detectLateNightEating(entries: Entry[]): Insight | null {
  const lateNightEntries = entries.filter((entry) => {
    const hour = getHours(parseISO(entry.logged_at));
    return hour >= 23 || hour < 3;
  });

  if (lateNightEntries.length < 3) return null;

  const times = lateNightEntries.map((e) => {
    const date = parseISO(e.logged_at);
    const hour = getHours(date);
    const minutes = getMinutes(date);
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minutes.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  });

  return {
    type: 'late_night',
    message: `You logged ${lateNightEntries.length} entries between 11 PM and 3 AM this week.`,
    count: lateNightEntries.length,
  };
}

/**
 * Detects early morning eating patterns (5 AM - 8 AM)
 */
export function detectEarlyMorningEating(entries: Entry[]): Insight | null {
  const earlyEntries = entries.filter((entry) => {
    const hour = getHours(parseISO(entry.logged_at));
    return hour >= 5 && hour < 8;
  });

  if (earlyEntries.length < 2) return null;

  return {
    type: 'early_morning',
    message: `You logged ${earlyEntries.length} entries between 5-8 AM this week.`,
    count: earlyEntries.length,
  };
}

/**
 * Detects frequently repeated meals
 */
export function detectRepeatedMeals(entries: Entry[]): Insight | null {
  const contentLower = entries.map((e) => e.content.toLowerCase());
  const frequencies: Record<string, number> = {};

  contentLower.forEach((content) => {
    // Find similar meals (simple substring matching)
    const similar = contentLower.filter((c) => {
      const dist = levenshteinDistance(content, c);
      return dist < 5; // Allow small variations
    });
    frequencies[content] = similar.length;
  });

  const mostRepeated = Object.entries(frequencies)
    .sort(([, a], [, b]) => b - a)
    .at(0)?.[0];

  if (!mostRepeated || frequencies[mostRepeated] < 2) return null;

  return {
    type: 'repeated_meal',
    message: `You logged "${mostRepeated}" ${frequencies[mostRepeated]} times this week.`,
    meal: mostRepeated,
    count: frequencies[mostRepeated],
  };
}

/**
 * Detects snacking frequency
 */
export function detectSnackFrequency(entries: Entry[]): Insight | null {
  const snackKeywords = [
    'snack',
    'chips',
    'candy',
    'chocolate',
    'biscuit',
    'cookie',
    'cake',
    'soda',
    'juice',
    'ice cream',
    'fast food',
    'burger',
    'fries',
    'pizza',
  ];

  const snackEntries = entries.filter((entry) =>
    snackKeywords.some((keyword) => entry.content.toLowerCase().includes(keyword))
  );

  if (snackEntries.length < 3) return null;

  return {
    type: 'snack_frequency',
    message: `You logged ${snackEntries.length} snack-related entries this week.`,
    count: snackEntries.length,
  };
}

/**
 * Generate all insights for a week of entries
 */
export function generateInsights(entries: Entry[]): Insight[] {
  const insights: Insight[] = [];

  const lateNight = detectLateNightEating(entries);
  if (lateNight) insights.push(lateNight);

  const earlyMorning = detectEarlyMorningEating(entries);
  if (earlyMorning) insights.push(earlyMorning);

  const repeated = detectRepeatedMeals(entries);
  if (repeated) insights.push(repeated);

  const snacks = detectSnackFrequency(entries);
  if (snacks) insights.push(snacks);

  const steps = detectStepsGoal(entries);
  if (steps) insights.push(steps);

  const hydration = detectHydration(entries);
  if (hydration) insights.push(hydration);

  const exercise = detectExerciseFrequency(entries);
  if (exercise) insights.push(exercise);

  return insights;
}

/**
 * Steps goal detection: counts days in the provided entries where steps >= 6000
 */
export function detectStepsGoal(entries: Entry[]): Insight | null {
  if (!entries.length) return null;

  // group by day and take the latest steps value for the day (or any non-null)
  const dayMap: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.steps == null) return;
    const day = startOfDay(parseISO(e.logged_at)).toISOString();
    // keep max steps for the day
    dayMap[day] = Math.max(dayMap[day] || 0, e.steps ?? 0);
  });

  const days = Object.keys(dayMap).length;
  if (days === 0) return null;

  const goalMet = Object.values(dayMap).filter((s) => s >= 6000).length;

  if (goalMet === 0) {
    return {
      type: 'steps_goal',
      message: `You didn't record any days meeting the 6,000 steps benchmark this week.`,
      count: 0,
    };
  }

  return {
    type: 'steps_goal',
    message: `You met the 6,000 steps benchmark on ${goalMet} of ${Math.max(7, days)} tracked days this week.`,
    count: goalMet,
  };
}

/**
 * Hydration detection: average water sachets per tracked day
 */
export function detectHydration(entries: Entry[]): Insight | null {
  if (!entries.length) return null;

  const dayMap: Record<string, number> = {};
  entries.forEach((e) => {
    const day = startOfDay(parseISO(e.logged_at)).toISOString();
    dayMap[day] = (dayMap[day] || 0) + (e.water_sachets ?? 0);
  });

  const days = Object.keys(dayMap).length;
  if (days === 0) return null;

  const total = Object.values(dayMap).reduce((a, b) => a + b, 0);
  const avg = total / days;

  if (avg < 2) {
    return {
      type: 'hydration',
      message: `Your average water intake is ${avg.toFixed(1)} sachets/day — try for at least 2/day.`,
      count: Math.round(avg),
    };
  }

  return {
    type: 'hydration',
    message: `Good hydration — average ${avg.toFixed(1)} sachets/day this week.`,
    count: Math.round(avg),
  };
}

/**
 * Exercise frequency: count unique days with exercised === true
 */
export function detectExerciseFrequency(entries: Entry[]): Insight | null {
  if (!entries.length) return null;

  const exercisedDays = new Set<string>();
  entries.forEach((e) => {
    if (e.exercised) {
      exercisedDays.add(startOfDay(parseISO(e.logged_at)).toISOString());
    }
  });

  const count = exercisedDays.size;
  if (count === 0) {
    return {
      type: 'exercise_frequency',
      message: 'No exercise recorded this week. Even short activity counts — try a quick walk.',
      count: 0,
    };
  }

  return {
    type: 'exercise_frequency',
    message: `You recorded exercise on ${count} day${count > 1 ? 's' : ''} this week.`,
    count,
  };
}

/**
 * Simple Levenshtein distance calculation for string similarity
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

/**
 * Group entries by day
 */
export function groupEntriesByDay(
  entries: Entry[]
): Array<{
  date: Date;
  entries: Entry[];
}> {
  const grouped: Record<string, Entry[]> = {};

  entries.forEach((entry) => {
    const day = startOfDay(parseISO(entry.logged_at)).toISOString();
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(entry);
  });

  return Object.entries(grouped)
    .map(([dateStr, dayEntries]) => ({
      date: parseISO(dateStr),
      entries: dayEntries.sort((a, b) =>
        parseISO(b.logged_at).getTime() - parseISO(a.logged_at).getTime()
      ),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
