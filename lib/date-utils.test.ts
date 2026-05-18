import { describe, expect, it } from 'vitest';
import { getDayKeyInTimezone, getHourInTimezone, getMondayOfWeek, parseTimezoneOffsetMinutes } from './date-utils';

describe('date-utils timezone helpers', () => {
  it('parses timezone offsets correctly', () => {
    expect(parseTimezoneOffsetMinutes('UTC')).toBe(0);
    expect(parseTimezoneOffsetMinutes('UTC+5:30')).toBe(330);
    expect(parseTimezoneOffsetMinutes('UTC-8')).toBe(-480);
  });

  it('returns hour in timezone', () => {
    expect(getHourInTimezone('2026-05-18T23:00:00.000Z', 'UTC+2')).toBe(1);
    expect(getHourInTimezone('2026-05-18T23:00:00.000Z', 'UTC-5')).toBe(18);
  });

  it('builds day key in timezone', () => {
    expect(getDayKeyInTimezone('2026-05-18T23:30:00.000Z', 'UTC+2')).toBe('2026-05-19');
    expect(getDayKeyInTimezone('2026-05-18T01:00:00.000Z', 'UTC-3')).toBe('2026-05-17');
  });

  it('computes monday date in timezone', () => {
    const sundayUtc = new Date('2026-05-17T23:30:00.000Z');
    expect(getMondayOfWeek(sundayUtc, 'UTC')).toBe('2026-05-11');
    expect(getMondayOfWeek(sundayUtc, 'UTC+2')).toBe('2026-05-18');
  });
});
