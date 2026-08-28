import type { AppData } from './types';

const CRLF = '\r\n';
const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function buildIcs(data: AppData): string {
  const byId = new Map(data.chores.map((chore) => [chore.id, chore]));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Done Here//Chore History//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Done Here history'];
  for (const item of [...data.completions].sort((a, b) => a.completedAt.localeCompare(b.completedAt))) {
    const chore = byId.get(item.choreId);
    if (!chore) continue;
    const start = icsDate(item.completedAt);
    const end = icsDate(new Date(new Date(item.completedAt).getTime() + 60_000).toISOString());
    lines.push('BEGIN:VEVENT', `UID:${item.id}@chore-proof-calendar.sociobot.in`, `DTSTAMP:${start}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeIcs(chore.name)} — done`);
    if (item.note) lines.push(`DESCRIPTION:${escapeIcs(item.note)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.join(CRLF)}${CRLF}`;
}

export function buildCsv(data: AppData): string {
  const byId = new Map(data.chores.map((chore) => [chore.id, chore]));
  const q = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return ['chore,completed_at,note,has_photo', ...data.completions.map((item) => [q(byId.get(item.choreId)?.name ?? 'Unknown chore'), q(item.completedAt), q(item.note ?? ''), item.photo ? 'yes' : 'no'].join(','))].join('\n');
}

export function pdfTextHex(value: string): string {
  let hex = '';
  for (let index = 0; index < value.length; index += 1) hex += value.charCodeAt(index).toString(16).padStart(4, '0');
  return hex.toUpperCase();
}

export function buildPdf(data: AppData): ArrayBuffer {
  const byId = new Map(data.chores.map((chore) => [chore.id, chore]));
  const rows = [...data.completions].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).map((item) => `${new Date(item.completedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}  ${byId.get(item.choreId)?.name ?? 'Unknown chore'}${item.note ? ` — ${item.note}` : ''}`);
  const pages: string[][] = [];
  const all = rows.length ? rows : ['No completions recorded yet.'];
  for (let i = 0; i < all.length; i += 42) pages.push(all.slice(i, i + 42));
  const objects: string[] = [];
  const add = (value: string) => (objects.push(value), objects.length);
  // UniGB-UCS2-H preserves the user's Unicode text instead of replacing it
  // with ASCII question marks. STSong-Light is one of PDF's predefined CJK
  // fonts, so the history stays selectable without bundling a large web font.
  const cidFont = add('<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 4 >> /DW 1000 >>');
  const font = add(`<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [${cidFont} 0 R] >>`);
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  pages.forEach((page, index) => {
    const commands = [`BT /F1 18 Tf 54 750 Td <${pdfTextHex('Done Here — completion history')}> Tj`, `/F1 10 Tf 0 -28 Td <${pdfTextHex(`Exported ${new Date().toISOString().slice(0, 10)} · page ${index + 1}`)}> Tj`];
    page.forEach((row) => commands.push(`0 -16 Td <${pdfTextHex(row.slice(0, 92))}> Tj`));
    commands.push('ET');
    const stream = commands.join('\n');
    contentIds.push(add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`));
    pageIds.push(add(''));
  });
  const pagesId = add('');
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pageIds.forEach((id, index) => { objects[id - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`; });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer << /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf).buffer as ArrayBuffer;
}

export function download(name: string, blob: Blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}
