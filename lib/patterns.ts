import { parseISO } from 'date-fns';
import { getDayKeyInTimezone, getHourInTimezone, getMinuteInTimezone } from './date-utils';

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
  confidence?: 'low' | 'medium' | 'high';
  sampleSize?: number;
  confidenceNote?: string;
}

export interface WeeklyProgress {
  trackedDays: number;
  avgSteps: number;
  avgWater: number;
  exerciseDays: number;
  stepsGoalDays: number;
  hydrationGoalDays: number;
  streakDays: number;
  stepsGoalMet: boolean;
  hydrationGoalMet: boolean;
  exerciseGoalMet: boolean;
  entryGoalMet: boolean;
  targets: {
    stepsGoalDays: number;
    hydrationGoalDays: number;
    exerciseGoalDays: number;
    entryGoalDays: number;
  };
}

export interface WeeklyGoals {
  stepsGoalDays?: number;
  hydrationGoalDays?: number;
  exerciseGoalDays?: number;
  entryGoalDays?: number;
}

export interface ReminderSuggestion {
  timeLabel: string;
  hour24: number;
  minute: number;
  reason: string;
  message: string;
}

const STOP_WORDS = new Set(['and', 'with', 'the', 'a', 'an', 'my', 'for', 'of', 'to']);
const distanceCache = new Map<string, number>();

function getConfidence(sampleSize: number): 'low' | 'medium' | 'high' {
  if (sampleSize >= 7) return 'high';
  if (sampleSize >= 4) return 'medium';
  return 'low';
}

function getConfidenceNote(confidence: 'low' | 'medium' | 'high', sampleSize: number): string {
  if (confidence === 'low') {
    return `Based on a small sample (${sampleSize} data point${sampleSize === 1 ? '' : 's'}).`;
  }
  if (confidence === 'medium') {
    return `Moderate signal from ${sampleSize} data points.`;
  }
  return `Strong signal from ${sampleSize} data points.`;
}

function normalizeMeal(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeMeal(content: string): string[] {
  return normalizeMeal(content)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 1;
  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = [...aSet].filter((v) => bSet.has(v)).length;
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function getDistanceCached(str1: string, str2: string): number {
  const key = str1 < str2 ? `${str1}::${str2}` : `${str2}::${str1}`;
  const cached = distanceCache.get(key);
  if (cached != null) return cached;
  const distance = levenshteinDistance(str1, str2);
  distanceCache.set(key, distance);
  return distance;
}

function isSimilarMeal(a: string, b: string): boolean {
  const normA = normalizeMeal(a);
  const normB = normalizeMeal(b);
  if (normA === normB) return true;

  const tokensA = tokenizeMeal(normA);
  const tokensB = tokenizeMeal(normB);
  if (jaccardSimilarity(tokensA, tokensB) >= 0.7) return true;

  const shortest = Math.min(normA.length, normB.length);
  const maxDistance = shortest <= 5 ? 1 : 3;
  return getDistanceCached(normA, normB) <= maxDistance;
}

/**
 * Detects late-night eating patterns (11 PM - 3 AM)
 */
export function detectLateNightEating(entries: Entry[], timezone: string = 'UTC'): Insight | null {
  const lateNightEntries = entries.filter((entry) => {
    const hour = getHourInTimezone(entry.logged_at, timezone);
    return hour >= 23 || hour < 3;
  });

  if (lateNightEntries.length < 3) return null;

  const times = lateNightEntries.map((e) => {
    const hour = getHourInTimezone(e.logged_at, timezone);
    const minutes = getMinuteInTimezone(e.logged_at, timezone);
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minutes.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  });

  const sampleSize = lateNightEntries.length;
  const confidence = getConfidence(sampleSize);

  return {
    type: 'late_night',
    message: `You logged ${sampleSize} entries between 11 PM and 3 AM this week.`,
    count: sampleSize,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

/**
 * Detects early morning eating patterns (5 AM - 8 AM)
 */
export function detectEarlyMorningEating(entries: Entry[], timezone: string = 'UTC'): Insight | null {
  const earlyEntries = entries.filter((entry) => {
    const hour = getHourInTimezone(entry.logged_at, timezone);
    return hour >= 5 && hour < 8;
  });

  if (earlyEntries.length < 2) return null;

  const sampleSize = earlyEntries.length;
  const confidence = getConfidence(sampleSize);

  return {
    type: 'early_morning',
    message: `You logged ${sampleSize} entries between 5-8 AM this week.`,
    count: sampleSize,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

/**
 * Detects frequently repeated meals
 */
export function detectRepeatedMeals(entries: Entry[]): Insight | null {
  if (entries.length < 2) return null;

  const clusters: Array<{ anchor: string; count: number }> = [];
  entries.forEach((entry) => {
    const match = clusters.find((cluster) => isSimilarMeal(cluster.anchor, entry.content));
    if (match) {
      match.count += 1;
      return;
    }
    clusters.push({ anchor: entry.content, count: 1 });
  });

  const topCluster = clusters.sort((a, b) => b.count - a.count)[0];
  if (!topCluster || topCluster.count < 2) return null;

  const sampleSize = topCluster.count;
  const confidence = getConfidence(sampleSize);

  return {
    type: 'repeated_meal',
    message: `You logged "${normalizeMeal(topCluster.anchor)}" ${sampleSize} times this week.`,
    meal: normalizeMeal(topCluster.anchor),
    count: sampleSize,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
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

  const sampleSize = snackEntries.length;
  const confidence = getConfidence(sampleSize);

  return {
    type: 'snack_frequency',
    message: `You logged ${sampleSize} snack-related entries this week.`,
    count: sampleSize,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

/**
 * Generate all insights for a week of entries
 */
export function generateInsights(entries: Entry[], timezone: string = 'UTC'): Insight[] {
  const insights: Insight[] = [];

  const lateNight = detectLateNightEating(entries, timezone);
  if (lateNight) insights.push(lateNight);

  const earlyMorning = detectEarlyMorningEating(entries, timezone);
  if (earlyMorning) insights.push(earlyMorning);

  const repeated = detectRepeatedMeals(entries);
  if (repeated) insights.push(repeated);

  const snacks = detectSnackFrequency(entries);
  if (snacks) insights.push(snacks);

  const steps = detectStepsGoal(entries, timezone);
  if (steps) insights.push(steps);

  const hydration = detectHydration(entries, timezone);
  if (hydration) insights.push(hydration);

  const exercise = detectExerciseFrequency(entries, timezone);
  if (exercise) insights.push(exercise);

  return insights;
}

/**
 * Steps goal detection: counts days in the provided entries where steps >= 6000
 */
export function detectStepsGoal(entries: Entry[], timezone: string = 'UTC'): Insight | null {
  if (!entries.length) return null;

  // group by day and take the latest steps value for the day (or any non-null)
  const dayMap: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.steps == null) return;
    const day = getDayKeyInTimezone(e.logged_at, timezone);
    // keep max steps for the day
    dayMap[day] = Math.max(dayMap[day] || 0, e.steps ?? 0);
  });

  const days = Object.keys(dayMap).length;
  if (days === 0) return null;

  const goalMet = Object.values(dayMap).filter((s) => s >= 6000).length;
  const sampleSize = days;
  const confidence = getConfidence(sampleSize);

  if (goalMet === 0) {
    return {
      type: 'steps_goal',
      message: `You didn't record any days meeting the 6,000 steps benchmark this week.`,
      count: 0,
      sampleSize,
      confidence,
      confidenceNote: getConfidenceNote(confidence, sampleSize),
    };
  }

  return {
    type: 'steps_goal',
    message: `You met the 6,000 steps benchmark on ${goalMet} of ${Math.max(7, days)} tracked days this week.`,
    count: goalMet,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

/**
 * Hydration detection: average water sachets per tracked day
 */
export function detectHydration(entries: Entry[], timezone: string = 'UTC'): Insight | null {
  if (!entries.length) return null;

  const dayMap: Record<string, number> = {};
  entries.forEach((e) => {
    const day = getDayKeyInTimezone(e.logged_at, timezone);
    dayMap[day] = (dayMap[day] || 0) + (e.water_sachets ?? 0);
  });

  const days = Object.keys(dayMap).length;
  if (days === 0) return null;

  const total = Object.values(dayMap).reduce((a, b) => a + b, 0);
  const avg = total / days;
  const sampleSize = days;
  const confidence = getConfidence(sampleSize);

  if (avg < 2) {
    return {
      type: 'hydration',
      message: `Your average water intake is ${avg.toFixed(1)} sachets/day — try for at least 2/day.`,
      count: Math.round(avg),
      sampleSize,
      confidence,
      confidenceNote: getConfidenceNote(confidence, sampleSize),
    };
  }

  return {
    type: 'hydration',
    message: `Good hydration — average ${avg.toFixed(1)} sachets/day this week.`,
    count: Math.round(avg),
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

/**
 * Exercise frequency: count unique days with exercised === true
 */
export function detectExerciseFrequency(entries: Entry[], timezone: string = 'UTC'): Insight | null {
  if (!entries.length) return null;

  const exercisedDays = new Set<string>();
  entries.forEach((e) => {
    if (e.exercised) {
      exercisedDays.add(getDayKeyInTimezone(e.logged_at, timezone));
    }
  });

  const count = exercisedDays.size;
  const sampleSize = Object.keys(
    entries.reduce<Record<string, true>>((acc, entry) => {
      acc[getDayKeyInTimezone(entry.logged_at, timezone)] = true;
      return acc;
    }, {})
  ).length;
  const confidence = getConfidence(sampleSize);

  if (count === 0) {
    return {
      type: 'exercise_frequency',
      message: 'No exercise recorded this week. Even short activity counts — try a quick walk.',
      count: 0,
      sampleSize,
      confidence,
      confidenceNote: getConfidenceNote(confidence, sampleSize),
    };
  }

  return {
    type: 'exercise_frequency',
    message: `You recorded exercise on ${count} day${count > 1 ? 's' : ''} this week.`,
    count,
    sampleSize,
    confidence,
    confidenceNote: getConfidenceNote(confidence, sampleSize),
  };
}

export function calculateWeeklyProgress(
  entries: Entry[],
  timezone: string = 'UTC',
  goals: WeeklyGoals = {}
): WeeklyProgress {
  const targets = {
    stepsGoalDays: goals.stepsGoalDays ?? 4,
    hydrationGoalDays: goals.hydrationGoalDays ?? 4,
    exerciseGoalDays: goals.exerciseGoalDays ?? 3,
    entryGoalDays: goals.entryGoalDays ?? 5,
  };

  if (!entries.length) {
    return {
      trackedDays: 0,
      avgSteps: 0,
      avgWater: 0,
      exerciseDays: 0,
      stepsGoalDays: 0,
      hydrationGoalDays: 0,
      streakDays: 0,
      stepsGoalMet: false,
      hydrationGoalMet: false,
      exerciseGoalMet: false,
      entryGoalMet: false,
      targets,
    };
  }

  const dayMap: Record<string, { steps: number; water: number; exercised: boolean }> = {};
  entries.forEach((entry) => {
    const day = getDayKeyInTimezone(entry.logged_at, timezone);
    if (!dayMap[day]) dayMap[day] = { steps: 0, water: 0, exercised: false };
    if (typeof entry.steps === 'number') dayMap[day].steps = Math.max(dayMap[day].steps, entry.steps ?? 0);
    dayMap[day].water += entry.water_sachets ?? 0;
    dayMap[day].exercised = dayMap[day].exercised || !!entry.exercised;
  });

  const trackedDays = Object.keys(dayMap).length;
  const values = Object.values(dayMap);
  const totalSteps = values.reduce((sum, day) => sum + day.steps, 0);
  const totalWater = values.reduce((sum, day) => sum + day.water, 0);
  const stepsGoalDays = values.filter((day) => day.steps >= 6000).length;
  const hydrationGoalDays = values.filter((day) => day.water >= 2).length;
  const exerciseDays = values.filter((day) => day.exercised).length;

  const daysWithEntries = new Set(Object.keys(dayMap));
  const today = getDayKeyInTimezone(new Date().toISOString(), timezone);
  let streakDays = 0;
  let cursor = today;
  while (daysWithEntries.has(cursor)) {
    streakDays += 1;
    const next = new Date(`${cursor}T00:00:00.000Z`);
    next.setDate(next.getDate() - 1);
    cursor = next.toISOString().split('T')[0];
  }

  return {
    trackedDays,
    avgSteps: trackedDays ? Math.round(totalSteps / trackedDays) : 0,
    avgWater: trackedDays ? Number((totalWater / trackedDays).toFixed(1)) : 0,
    exerciseDays,
    stepsGoalDays,
    hydrationGoalDays,
    streakDays,
    stepsGoalMet: stepsGoalDays >= targets.stepsGoalDays,
    hydrationGoalMet: hydrationGoalDays >= targets.hydrationGoalDays,
    exerciseGoalMet: exerciseDays >= targets.exerciseGoalDays,
    entryGoalMet: trackedDays >= targets.entryGoalDays,
    targets,
  };
}

export function generateReminderSuggestion(entries: Entry[], timezone: string = 'UTC'): ReminderSuggestion {
  if (!entries.length) {
    return {
      timeLabel: '12:00 PM',
      hour24: 12,
      minute: 0,
      reason: 'No logging history yet',
      message: 'Try a midday reminder to build a consistent logging habit.',
    };
  }

  const hourlyCounts: Record<number, number> = {};
  entries.forEach((entry) => {
    const hour = getHourInTimezone(entry.logged_at, timezone);
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });

  const peakHour = Object.entries(hourlyCounts)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count)[0]?.hour;

  const reminderHour = peakHour == null ? 12 : Math.max(6, peakHour - 1);
  const isAm = reminderHour < 12;
  const displayHour = reminderHour % 12 === 0 ? 12 : reminderHour % 12;
  const suffix = isAm ? 'AM' : 'PM';
  const timeLabel = `${displayHour}:00 ${suffix}`;

  return {
    timeLabel,
    hour24: reminderHour,
    minute: 0,
    reason: peakHour == null ? 'Using a neutral default window' : `Based on your frequent ${peakHour}:00 logging window`,
    message: `Set a gentle reminder for ${timeLabel} so you can log before your usual window starts.`,
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
  entries: Entry[],
  timezone: string = 'UTC'
): Array<{
  date: Date;
  entries: Entry[];
}> {
  const grouped: Record<string, Entry[]> = {};

  entries.forEach((entry) => {
    const day = getDayKeyInTimezone(entry.logged_at, timezone);
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(entry);
  });

  return Object.entries(grouped)
    .map(([dateStr, dayEntries]) => ({
      date: parseISO(`${dateStr}T00:00:00.000Z`),
      entries: dayEntries.sort((a, b) =>
        parseISO(b.logged_at).getTime() - parseISO(a.logged_at).getTime()
      ),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
