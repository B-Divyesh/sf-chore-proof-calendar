import { describe, expect, it } from 'vitest';
import { buildCsv, buildIcs, buildPdf, pdfTextHex } from '../../src/exports';
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

  it('@claim:pdf-export writes every sample row and preserves Unicode text', () => {
    const pdf = new TextDecoder().decode(buildPdf(SAMPLE_DATA));
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    for (const completion of SAMPLE_DATA.completions) {
      const chore = SAMPLE_DATA.chores.find((item) => item.id === completion.choreId)!;
      expect(pdf).toContain(pdfTextHex(chore.name));
      if (completion.note) expect(pdf).toContain(pdfTextHex(completion.note));
    }
    const unicode = {
      chores: [{ id: 'sink', name: 'Nettoyer l’évier 洗碗', intervalDays: 1, createdAt: '2026-08-28T12:00:00Z' }],
      completions: [{ id: 'done', choreId: 'sink', completedAt: '2026-08-28T12:00:00Z', note: 'Fait — très propre' }]
    };
    const unicodePdf = new TextDecoder().decode(buildPdf(unicode));
    expect(unicodePdf).toContain(pdfTextHex('Nettoyer l’évier 洗碗'));
    expect(unicodePdf).toContain(pdfTextHex('Fait — très propre'));
    expect(pdf.endsWith('%%EOF')).toBe(true);
  });

  it('@claim:photo-tier raises the tested photo limit from 5 to 500', () => {
    expect(photoLimit(false)).toBe(5);
    expect(photoLimit(true)).toBe(500);
  });
});
