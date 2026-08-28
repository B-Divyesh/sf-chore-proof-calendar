import type { Chore, Completion } from './types';

const DAY_MS = 86_400_000;

function localDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

export function addCalendarDays(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date;
}

export function dueInfo(chore: Chore, completions: Completion[], now = new Date()) {
  const last = completions
    .filter((item) => item.choreId === chore.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const due = last ? addCalendarDays(last.completedAt, chore.intervalDays) : new Date(chore.createdAt);
  const diff = localDayNumber(due) - localDayNumber(now);
  const amount = Math.abs(diff);
  const label = diff < 0
    ? `${amount} day${amount === 1 ? '' : 's'} overdue`
    : diff === 0
      ? 'Due today'
      : `Due in ${diff} day${diff === 1 ? '' : 's'}`;
  return { last, due, diff, label };
}
