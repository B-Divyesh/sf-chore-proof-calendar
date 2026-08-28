import { describe, expect, it } from 'vitest';
import { dueInfo } from '../../src/dates';
import type { Chore, Completion } from '../../src/types';

describe('calendar-day due status', () => {
  const chore: Chore = { id: 'daily', name: 'Daily sink wipe', intervalDays: 1, createdAt: '2026-08-28T16:00:45.000Z' };

  it('treats a chore created later today as due today', () => {
    const result = dueInfo(chore, [], new Date('2026-08-28T16:00:45.000Z'));
    expect(result.label).toBe('Due today');
    expect(result.due.toISOString()).toBe('2026-08-28T16:00:45.000Z');
  });

  it('treats one local calendar day after completion as one day away', () => {
    const completions: Completion[] = [{ id: 'done', choreId: 'daily', completedAt: '2026-08-28T16:00:45.000Z' }];
    const result = dueInfo(chore, completions, new Date('2026-08-28T16:00:45.000Z'));
    expect(result.label).toBe('Due in 1 day');
    expect(result.due.toISOString()).toBe('2026-08-29T16:00:45.000Z');
  });
});
