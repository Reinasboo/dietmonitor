import { describe, expect, it } from 'vitest';
import {
  calculateWeeklyProgress,
  detectLateNightEating,
  detectRepeatedMeals,
  generateReminderSuggestion,
  groupEntriesByDay,
} from './patterns';

const baseEntries = [
  {
    id: '1',
    content: 'Rice and beans',
    created_at: '2026-05-18T20:00:00.000Z',
    logged_at: '2026-05-18T20:00:00.000Z',
    steps: 6500,
    water_sachets: 2,
    exercised: true,
  },
  {
    id: '2',
    content: 'rice & beans',
    created_at: '2026-05-17T20:00:00.000Z',
    logged_at: '2026-05-17T20:00:00.000Z',
    steps: 7000,
    water_sachets: 2,
    exercised: true,
  },
  {
    id: '3',
    content: 'Late snack',
    created_at: '2026-05-17T23:30:00.000Z',
    logged_at: '2026-05-17T23:30:00.000Z',
    steps: 5000,
    water_sachets: 1,
    exercised: false,
  },
  {
    id: '4',
    content: 'Fruit salad',
    created_at: '2026-05-16T23:40:00.000Z',
    logged_at: '2026-05-16T23:40:00.000Z',
    steps: 6200,
    water_sachets: 3,
    exercised: true,
  },
  {
    id: '5',
    content: 'Another late bite',
    created_at: '2026-05-15T23:20:00.000Z',
    logged_at: '2026-05-15T23:20:00.000Z',
    steps: 3000,
    water_sachets: 2,
    exercised: false,
  },
];

describe('patterns', () => {
  it('detects repeated meals with normalization', () => {
    const insight = detectRepeatedMeals(baseEntries);
    expect(insight).not.toBeNull();
    expect(insight?.type).toBe('repeated_meal');
    expect(insight?.count).toBeGreaterThanOrEqual(2);
  });

  it('detects late-night entries in timezone', () => {
    const insight = detectLateNightEating(baseEntries, 'UTC');
    expect(insight).not.toBeNull();
    expect(insight?.count).toBeGreaterThanOrEqual(3);
    expect(insight?.confidence).toBe('low');
  });

  it('computes weekly progress goals', () => {
    const progress = calculateWeeklyProgress(baseEntries, 'UTC');
    expect(progress.stepsGoalDays).toBe(3);
    expect(progress.exerciseDays).toBe(3);
    expect(progress.hydrationGoalDays).toBe(4);
  });

  it('builds reminder suggestions', () => {
    const suggestion = generateReminderSuggestion(baseEntries, 'UTC');
    expect(suggestion.timeLabel).toContain(':00');
    expect(suggestion.message.length).toBeGreaterThan(10);
  });

  it('groups entries by timezone-aware day key', () => {
    const grouped = groupEntriesByDay(
      [
        {
          id: 'tz-1',
          content: 'Late meal',
          created_at: '2026-05-18T23:30:00.000Z',
          logged_at: '2026-05-18T23:30:00.000Z',
          steps: null,
          water_sachets: 0,
          exercised: false,
        },
        {
          id: 'tz-2',
          content: 'Same meal next day locally',
          created_at: '2026-05-19T00:30:00.000Z',
          logged_at: '2026-05-19T00:30:00.000Z',
          steps: null,
          water_sachets: 0,
          exercised: false,
        },
      ],
      'UTC-2'
    );

    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.entries).toHaveLength(2);
  });
});
