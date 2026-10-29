import * as XLSX from 'xlsx';
import { ElectricityRecord } from '../db/schema';
import { THAI_MONTHS } from '../validations/record';
import {
  getFiscalYear,
  getFiscalQuarter,
  FISCAL_MONTH_ORDER,
  THAI_FISCAL_MONTHS,
} from '../utils/math';

export interface ParsedImportRecord {
  yearBe: number;
  month: number;
  amount: number;
  note?: string;
  isDuplicate?: boolean;
}

/**
 * Strips UTF-8 BOM (\uFEFF) and trims string content safely
 */
function cleanVal(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).replace(/^\uFEFF/, '').trim();
}

export function parseExcelBuffer(buffer: Buffer): ParsedImportRecord[] {
  // Check if buffer is Excel binary (starts with 'PK' for zip-based .xlsx)
  const isZip = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b;
  let workbook: XLSX.WorkBook;

  if (isZip) {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } else {
    // For CSV or plain text, decode UTF-8 explicitly and strip any UTF-8 BOM
    const text = buffer.toString('utf-8').replace(/^\uFEFF/, '');
    workbook = XLSX.read(text, { type: 'string' });
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  const results: ParsedImportRecord[] = [];

  // Check format: Is it a 2D matrix (first row or col contains years 25xx and 12 month columns)
  // or a tabular format (columns: year, month, amount)?

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r] as unknown[];
    if (!row || row.length === 0) continue;

    const firstCol = Number(cleanVal(row[0]));
    // Matrix format check: row[0] is year 2500 - 2650 and row contains month columns (> 4 columns)
    if (!isNaN(firstCol) && firstCol >= 2500 && firstCol <= 2650 && row.length > 4) {
      const yearBe = firstCol;
      for (let month = 1; month <= 12; month++) {
        const val = row[month];
        if (val !== null && val !== undefined && val !== '') {
          const num = Number(cleanVal(val));
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

      const yearBe = Number(cleanVal(row[0]));
      const month = Number(cleanVal(row[1]));
      const amount = Number(cleanVal(row[2]));
      const rawNote = row[3] ? cleanVal(row[3]) : undefined;
      const note = rawNote && rawNote.length > 0 ? rawNote : undefined;

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

  // 1. Sheet 1: Tabular List with Government Fiscal Year Attribution
  const tabularData = records.map((r) => {
    const fy = getFiscalYear(r.yearBe, r.month);
    const fq = getFiscalQuarter(r.month);
    return {
      'ปี พ.ศ. (ปฏิทิน)': r.yearBe,
      'ปี ค.ศ.': r.yearCe,
      'เดือน': THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`,
      'ลำดับเดือน': r.month,
      'ปีงบประมาณ (FY)': fy,
      'ไตรมาส (Quarter)': fq.shortLabel,
      'ยอดค่าไฟฟ้า (บาท)': parseFloat(r.amount),
      'หมายเหตุ': r.note || '',
      'อัปเดตเมื่อ': new Date(r.updatedAt).toISOString().split('T')[0],
    };
  });

  const wsList = XLSX.utils.json_to_sheet(tabularData);
  XLSX.utils.book_append_sheet(wb, wsList, 'รายการค่าไฟฟ้าทั้งหมด');

  // 2. Sheet 2: Thai Fiscal Year Matrix (ต.ค. - ก.ย., 12 เดือนเต็มต่อปีงบ)
  const fyRecordMap = new Map<string, number>();
  const fySet = new Set<number>();

  for (const r of records) {
    const fy = getFiscalYear(r.yearBe, r.month);
    fySet.add(fy);
    fyRecordMap.set(`${r.yearBe}-${r.month}`, parseFloat(r.amount));
  }

  const sortedFYs = Array.from(fySet).sort((a, b) => b - a);
  const fiscalMatrixData: (string | number | null)[][] = [
    ['สรุปข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 ตามระบบปีงบประมาณไทย'],
    ['(เริ่มต้น 1 ต.ค. ของปีปัจจุบัน ถึง 30 ก.ย. ของปีถัดไป โดยใช้ พ.ศ. ของปีถัดไปเป็นชื่อเรียก)'],
    ['หน่วย : ค่าไฟฟ้า (บาท)'],
    ['ปีงบประมาณ', ...THAI_FISCAL_MONTHS, 'รวมทั้งปีงบประมาณ', 'เฉลี่ยต่อเดือน'],
  ];

  for (const fy of sortedFYs) {
    const monthVals: (number | null)[] = FISCAL_MONTH_ORDER.map((month) => {
      const yearBe = month >= 10 ? fy - 1 : fy;
      const amt = fyRecordMap.get(`${yearBe}-${month}`);
      return amt !== undefined ? amt : null;
    });

    const validVals = monthVals.filter((v): v is number => v !== null);
    const yearTotal = validVals.reduce((sum, v) => sum + v, 0);
    const monthAvg = validVals.length > 0 ? yearTotal / validVals.length : 0;

    fiscalMatrixData.push([
      `ปีงบ ${fy}`,
      ...monthVals,
      yearTotal,
      monthAvg,
    ]);
  }

  const wsFiscalMatrix = XLSX.utils.aoa_to_sheet(fiscalMatrixData);
  XLSX.utils.book_append_sheet(wb, wsFiscalMatrix, 'สรุปตามปีงบประมาณ (ต.ค.-ก.ย.)');

  // 3. Sheet 3: Calendar Year Matrix (ม.ค. - ธ.ค. ตามต้นฉบับ Excel)
  const calYearMap = new Map<number, (number | null)[]>();
  for (const r of records) {
    if (!calYearMap.has(r.yearBe)) {
      calYearMap.set(r.yearBe, new Array(12).fill(null));
    }
    const arr = calYearMap.get(r.yearBe)!;
    arr[r.month - 1] = parseFloat(r.amount);
  }

  const calMatrixData: (string | number | null)[][] = [
    ['สรุปข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 ตามปีปฏิทิน'],
    ['หน่วย : ค่าไฟฟ้า (บาท)'],
    ['ปี พ.ศ.', ...THAI_MONTHS, 'รวมทั้งปีปฏิทิน'],
  ];

  const sortedCalYears = Array.from(calYearMap.keys()).sort((a, b) => b - a);
  for (const y of sortedCalYears) {
    const months = calYearMap.get(y)!;
    const yearTotal = months.reduce((sum: number, val) => sum + (val || 0), 0);
    calMatrixData.push([y, ...months, yearTotal]);
  }

  const wsCalMatrix = XLSX.utils.aoa_to_sheet(calMatrixData);
  XLSX.utils.book_append_sheet(wb, wsCalMatrix, 'สรุปตามปีปฏิทิน (ม.ค.-ธ.ค.)');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Sanitizes cell content for CSV output to prevent CSV Formula Injection (DDE attacks).
 * If a cell starts with formula characters (=, +, -, @, tab, cr), it prepends an apostrophe.
 */
function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  const isFormulaTrigger = /^[=+\-@\t\r]/.test(str);
  const safeStr = isFormulaTrigger ? `'${str}` : str;
  return `"${safeStr.replace(/"/g, '""')}"`;
}

export function generateCsvString(records: ElectricityRecord[]): string {
  // UTF-8 BOM (\uFEFF) ensures Excel opens Thai characters without encoding issues
  const bom = '\uFEFF';
  const headers = [
    '"ปี พ.ศ. (ปฏิทิน)"',
    '"ปี ค.ศ."',
    '"เดือน"',
    '"ปีงบประมาณ (FY)"',
    '"ไตรมาส"',
    '"ยอดค่าไฟฟ้า (บาท)"',
    '"หมายเหตุ"',
    '"อัปเดตเมื่อ"',
  ];
  const lines = [headers.join(',')];

  for (const r of records) {
    const monthName = THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`;
    const fy = getFiscalYear(r.yearBe, r.month);
    const fq = getFiscalQuarter(r.month);
    const updatedDate = new Date(r.updatedAt).toISOString().split('T')[0];

    lines.push(
      [
        r.yearBe,
        r.yearCe,
        sanitizeCsvCell(monthName),
        sanitizeCsvCell(`ปีงบ ${fy}`),
        sanitizeCsvCell(fq.shortLabel),
        parseFloat(r.amount).toFixed(2),
        sanitizeCsvCell(r.note || ''),
        sanitizeCsvCell(updatedDate),
      ].join(',')
    );
  }

  return bom + lines.join('\r\n');
}
