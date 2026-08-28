import { describe, expect, it } from 'vitest';
import { validateData } from '../../src/storage';
import { SAMPLE_DATA } from '../../src/types';

describe('backup validation', () => {
  it('accepts a complete exported backup', () => {
    expect(validateData(structuredClone(SAMPLE_DATA))).toEqual(SAMPLE_DATA);
  });

  it.each([
    { chores: [{ id: 'broken' }], completions: [] },
    { chores: [{ id: 'c', name: 'Sink', intervalDays: 0, createdAt: '2026-08-28T12:00:00Z' }], completions: [] },
    { chores: [], completions: [{ id: 'x', choreId: 'missing', completedAt: '2026-08-28T12:00:00Z' }] }
  ])('rejects malformed records before storage replacement', (backup) => {
    expect(() => validateData(backup)).toThrow(/current calendar was not changed|not a Done Here backup/);
  });
});
