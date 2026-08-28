import { describe, expect, it } from 'vitest';
import { buildCsv, buildIcs, buildPdf } from '../../src/exports';
import { photoLimit } from '../../src/policy';
import { SAMPLE_DATA } from '../../src/types';

describe('portable history', () => {
  it('@claim:ics-export writes a valid UTC calendar event for every completion', () => {
    const ics = buildIcs(SAMPLE_DATA);
    expect(ics).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(SAMPLE_DATA.completions.length);
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics.endsWith('\r\n')).toBe(true);
  });

  it('@claim:csv-export writes one row per completion', () => {
    const csv = buildCsv(SAMPLE_DATA);
    expect(csv.split('\n')).toHaveLength(SAMPLE_DATA.completions.length + 1);
    expect(csv).toContain('chore,completed_at,note,has_photo');
  });

  it('@claim:pdf-export writes a readable PDF document', () => {
    const pdf = new TextDecoder().decode(buildPdf(SAMPLE_DATA));
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('Done Here');
    expect(pdf.endsWith('%%EOF')).toBe(true);
  });

  it('@claim:photo-tier raises the tested photo limit from 5 to 500', () => {
    expect(photoLimit(false)).toBe(5);
    expect(photoLimit(true)).toBe(500);
  });
});
