import { describe, it, expect } from 'bun:test';

type TestRecord = {
  id: number;
  yearBe: number;
  month: number;
  amount: string;
  updatedAt: Date;
};

export function sortRecords<T extends { yearBe: number; month: number; amount: string; updatedAt: Date }>(
  records: T[],
  field: 'period' | 'amount' | 'updatedAt',
  order: 'asc' | 'desc'
): T[] {
  return [...records].sort((a, b) => {
    let comparison = 0;
    if (field === 'period') {
      const periodA = a.yearBe * 100 + a.month;
      const periodB = b.yearBe * 100 + b.month;
      comparison = periodA - periodB;
    } else if (field === 'amount') {
      comparison = parseFloat(a.amount) - parseFloat(b.amount);
    } else if (field === 'updatedAt') {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return order === 'asc' ? comparison : -comparison;
  });
}

describe('Admin Data Grid Sorting', () => {
  const sampleRecords: TestRecord[] = [
    { id: 1, yearBe: 2568, month: 1, amount: '45000.00', updatedAt: new Date('2026-01-10') },
    { id: 2, yearBe: 2567, month: 12, amount: '32000.50', updatedAt: new Date('2026-02-15') },
    { id: 3, yearBe: 2568, month: 4, amount: '68000.00', updatedAt: new Date('2026-03-01') },
  ];

  it('sorts by amount descending (highest amount first)', () => {
    const sorted = sortRecords(sampleRecords, 'amount', 'desc');
    expect(sorted[0].id).toBe(3);
    expect(sorted[1].id).toBe(1);
    expect(sorted[2].id).toBe(2);
  });

  it('sorts by amount ascending (lowest amount first)', () => {
    const sorted = sortRecords(sampleRecords, 'amount', 'asc');
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(1);
    expect(sorted[2].id).toBe(3);
  });

  it('sorts by period chronologically ascending (oldest first)', () => {
    const sorted = sortRecords(sampleRecords, 'period', 'asc');
    expect(sorted[0].yearBe).toBe(2567);
    expect(sorted[1].month).toBe(1);
    expect(sorted[2].month).toBe(4);
  });

  it('sorts by period chronologically descending (newest first)', () => {
    const sorted = sortRecords(sampleRecords, 'period', 'desc');
    expect(sorted[0].month).toBe(4);
    expect(sorted[1].month).toBe(1);
    expect(sorted[2].yearBe).toBe(2567);
  });

  it('sorts by updatedAt timestamp correctly', () => {
    const sorted = sortRecords(sampleRecords, 'updatedAt', 'desc');
    expect(sorted[0].id).toBe(3); // 2026-03-01
    expect(sorted[2].id).toBe(1); // 2026-01-10
  });
});
