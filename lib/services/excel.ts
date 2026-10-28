import * as XLSX from 'xlsx';
import { ElectricityRecord } from '../db/schema';
import { THAI_MONTHS } from '../validations/record';

export interface ParsedImportRecord {
  yearBe: number;
  month: number;
  amount: number;
  note?: string;
  isDuplicate?: boolean;
}

export function parseExcelBuffer(buffer: Buffer): ParsedImportRecord[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  const results: ParsedImportRecord[] = [];

  // Check format: Is it a 2D matrix (first row or col contains years 25xx and 12 month columns)
  // or a tabular format (columns: year, month, amount)?

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r] as unknown[];
    if (!row || row.length === 0) continue;

    const firstCol = Number(row[0]);
    // Matrix format check: row[0] is year 2500 - 2650
    if (!isNaN(firstCol) && firstCol >= 2500 && firstCol <= 2650) {
      const yearBe = firstCol;
      for (let month = 1; month <= 12; month++) {
        const val = row[month];
        if (val !== null && val !== undefined && val !== '') {
          const num = Number(val);
          if (!isNaN(num) && num > 0) {
            results.push({
              yearBe,
              month,
              amount: num,
              note: `นำเข้าจาก Excel (${sheetName})`,
            });
          }
        }
      }
    }
  }

  // If no matrix rows matched, try tabular format (Header row in row 0, then Year, Month, Amount)
  if (results.length === 0) {
    for (let r = 1; r < rawRows.length; r++) {
      const row = rawRows[r] as unknown[];
      if (!row || row.length < 3) continue;

      const yearBe = Number(row[0]);
      const month = Number(row[1]);
      const amount = Number(row[2]);
      const note = row[3] ? String(row[3]) : undefined;

      if (
        !isNaN(yearBe) &&
        yearBe >= 2500 &&
        yearBe <= 2650 &&
        !isNaN(month) &&
        month >= 1 &&
        month <= 12 &&
        !isNaN(amount) &&
        amount > 0
      ) {
        results.push({
          yearBe,
          month,
          amount,
          note,
        });
      }
    }
  }

  return results;
}

export function generateExcelWorkbook(records: ElectricityRecord[]): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Tabular List
  const tabularData = records.map((r) => ({
    'ปี พ.ศ.': r.yearBe,
    'ปี ค.ศ.': r.yearCe,
    'เดือน': THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`,
    'ลำดับเดือน': r.month,
    'ยอดค่าไฟฟ้า (บาท)': parseFloat(r.amount),
    'หมายเหตุ': r.note || '',
    'อัปเดตเมื่อ': new Date(r.updatedAt).toISOString().split('T')[0],
  }));

  const wsList = XLSX.utils.json_to_sheet(tabularData);
  XLSX.utils.book_append_sheet(wb, wsList, 'รายการค่าไฟฟ้าทั้งหมด');

  // 2. Sheet 2: Matrix View (like original format)
  // Group by year
  const yearMap = new Map<number, (number | null)[]>();
  for (const r of records) {
    if (!yearMap.has(r.yearBe)) {
      yearMap.set(r.yearBe, new Array(12).fill(null));
    }
    const arr = yearMap.get(r.yearBe)!;
    arr[r.month - 1] = parseFloat(r.amount);
  }

  const matrixData: (string | number | null)[][] = [
    ['สรุปข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7'],
    ['หน่วย : ค่าไฟฟ้า (บาท)'],
    ['ปี พ.ศ.', ...THAI_MONTHS, 'รวมทั้งปี'],
  ];

  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
  for (const y of sortedYears) {
    const months = yearMap.get(y)!;
    const yearTotal = months.reduce((sum: number, val) => sum + (val || 0), 0);
    matrixData.push([y, ...months, yearTotal]);
  }

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'สรุปตารางรายเดือน');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function generateCsvString(records: ElectricityRecord[]): string {
  // UTF-8 BOM (\uFEFF) ensures Excel opens Thai characters without encoding issues
  const bom = '\uFEFF';
  const headers = ['"ปี พ.ศ."', '"ปี ค.ศ."', '"เดือน"', '"ยอดค่าไฟฟ้า (บาท)"', '"หมายเหตุ"', '"อัปเดตเมื่อ"'];
  const lines = [headers.join(',')];

  for (const r of records) {
    const monthName = THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`;
    const cleanNote = (r.note || '').replace(/"/g, '""');
    const updatedDate = new Date(r.updatedAt).toISOString().split('T')[0];

    lines.push(
      [
        r.yearBe,
        r.yearCe,
        `"${monthName}"`,
        parseFloat(r.amount).toFixed(2),
        `"${cleanNote}"`,
        `"${updatedDate}"`,
      ].join(',')
    );
  }

  return bom + lines.join('\n');
}
