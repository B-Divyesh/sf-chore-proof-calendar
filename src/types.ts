export type Chore = {
  id: string;
  name: string;
  intervalDays: number;
  createdAt: string;
  archived?: boolean;
};

export type Completion = {
  id: string;
  choreId: string;
  completedAt: string;
  note?: string;
  photo?: string;
};

export type AppData = { chores: Chore[]; completions: Completion[] };

export const uid = () => crypto.randomUUID();

export const SAMPLE_DATA: AppData = {
  chores: [
    { id: 'plants', name: 'Water the houseplants', intervalDays: 5, createdAt: '2026-08-01T09:00:00.000Z' },
    { id: 'sheets', name: 'Change the bed sheets', intervalDays: 7, createdAt: '2026-08-01T09:00:00.000Z' },
    { id: 'fridge', name: 'Clear the fridge shelf', intervalDays: 14, createdAt: '2026-08-01T09:00:00.000Z' },
    { id: 'filter', name: 'Rinse the coffee filter', intervalDays: 3, createdAt: '2026-08-01T09:00:00.000Z' }
  ],
  completions: [
    { id: 'p1', choreId: 'plants', completedAt: '2026-08-26T07:22:00.000Z', note: 'Fern soil was still damp.' },
    { id: 'p2', choreId: 'plants', completedAt: '2026-08-21T07:15:00.000Z' },
    { id: 's1', choreId: 'sheets', completedAt: '2026-08-24T18:40:00.000Z', note: 'Blue set is on the guest bed.' },
    { id: 'f1', choreId: 'fridge', completedAt: '2026-08-18T12:10:00.000Z', note: 'Used the spinach and wiped the top shelf.' },
    { id: 'c1', choreId: 'filter', completedAt: '2026-08-27T08:05:00.000Z' },
    { id: 'c2', choreId: 'filter', completedAt: '2026-08-24T08:02:00.000Z' },
    { id: 'c3', choreId: 'filter', completedAt: '2026-08-20T08:09:00.000Z' }
  ]
};
