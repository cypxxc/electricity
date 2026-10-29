import { describe, expect, test } from 'bun:test';
import {
  calculatePercentageChange,
  FISCAL_MONTH_ORDER,
  THAI_FISCAL_MONTHS,
  getFiscalYear,
  getFiscalQuarter,
  getFiscalMonthOrder,
  formatFiscalYearRange,
  formatFiscalYearLabel,
} from '../lib/utils/math';
import { generateCsvString, parseExcelBuffer } from '../lib/services/excel';
import { ElectricityRecord } from '../lib/db/schema';

describe('Analytics Calculations & Fiscal Year Logic', () => {
  describe('Thai Fiscal Year Statutory Definition & Functions', () => {
    test('Official Thai Fiscal Year: Oct 1 of current year to Sep 30 of next year, named by next year B.E.', () => {
      // เดือน 10-12 พ.ศ. 2562 ต้องสังกัดปีงบประมาณ 2563
      expect(getFiscalYear(2562, 10)).toBe(2563);
      expect(getFiscalYear(2562, 11)).toBe(2563);
      expect(getFiscalYear(2562, 12)).toBe(2563);

      // เดือน 1-9 พ.ศ. 2563 ต้องสังกัดปีงบประมาณ 2563
      expect(getFiscalYear(2563, 1)).toBe(2563);
      expect(getFiscalYear(2563, 5)).toBe(2563);
      expect(getFiscalYear(2563, 9)).toBe(2563);

      // เดือน 10 พ.ศ. 2568 ถึง เดือน 9 พ.ศ. 2569 ต้องสังกัดปีงบประมาณ 2569
      expect(getFiscalYear(2568, 10)).toBe(2569);
      expect(getFiscalYear(2568, 12)).toBe(2569);
      expect(getFiscalYear(2569, 1)).toBe(2569);
      expect(getFiscalYear(2569, 9)).toBe(2569);
    });

    test('Fiscal Quarters: Q1 (Oct-Dec), Q2 (Jan-Mar), Q3 (Apr-Jun), Q4 (Jul-Sep)', () => {
      expect(getFiscalQuarter(10).quarter).toBe(1);
      expect(getFiscalQuarter(11).quarter).toBe(1);
      expect(getFiscalQuarter(12).quarter).toBe(1);

      expect(getFiscalQuarter(1).quarter).toBe(2);
      expect(getFiscalQuarter(2).quarter).toBe(2);
      expect(getFiscalQuarter(3).quarter).toBe(2);

      expect(getFiscalQuarter(4).quarter).toBe(3);
      expect(getFiscalQuarter(5).quarter).toBe(3);
      expect(getFiscalQuarter(6).quarter).toBe(3);

      expect(getFiscalQuarter(7).quarter).toBe(4);
      expect(getFiscalQuarter(8).quarter).toBe(4);
      expect(getFiscalQuarter(9).quarter).toBe(4);
    });

    test('Fiscal Month Sequence & Order (1 for Oct to 12 for Sep)', () => {
      expect(getFiscalMonthOrder(10)).toBe(1);
      expect(getFiscalMonthOrder(11)).toBe(2);
      expect(getFiscalMonthOrder(12)).toBe(3);
      expect(getFiscalMonthOrder(1)).toBe(4);
      expect(getFiscalMonthOrder(2)).toBe(5);
      expect(getFiscalMonthOrder(9)).toBe(12);

      expect(FISCAL_MONTH_ORDER).toEqual([10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(THAI_FISCAL_MONTHS[0]).toBe('ต.ค.');
      expect(THAI_FISCAL_MONTHS[11]).toBe('ก.ย.');
    });

    test('Fiscal Year range formatting', () => {
      expect(formatFiscalYearRange(2569)).toBe('1 ต.ค. 2568 – 30 ก.ย. 2569');
      expect(formatFiscalYearLabel(2569)).toBe('ปีงบประมาณ 2569 (1 ต.ค. 2568 – 30 ก.ย. 2569)');
    });

    test('Dataset Completeness: 84 records (Oct 2562 to Sep 2569) form 7 complete 12-month Thai Fiscal Years', () => {
      // Mock the 84 records structure
      const records: { yearBe: number; month: number }[] = [];
      // 2562: 10, 11, 12
      for (let m = 10; m <= 12; m++) records.push({ yearBe: 2562, month: m });
      // 2563 - 2568: 1..12
      for (let y = 2563; y <= 2568; y++) {
        for (let m = 1; m <= 12; m++) records.push({ yearBe: y, month: m });
      }
      // 2569: 1..9
      for (let m = 1; m <= 9; m++) records.push({ yearBe: 2569, month: m });

      expect(records.length).toBe(84);

      // Group by Fiscal Year
      const fyMap = new Map<number, number>();
      for (const r of records) {
        const fy = getFiscalYear(r.yearBe, r.month);
        fyMap.set(fy, (fyMap.get(fy) || 0) + 1);
      }

      // Must have exactly 7 fiscal years: 2563, 2564, 2565, 2566, 2567, 2568, 2569
      const fiscalYears = Array.from(fyMap.keys()).sort();
      expect(fiscalYears).toEqual([2563, 2564, 2565, 2566, 2567, 2568, 2569]);

      // Every single fiscal year has exactly 12 months!
      for (const fy of fiscalYears) {
        expect(fyMap.get(fy)).toBe(12);
      }
    });
  });

  describe('calculatePercentageChange', () => {
    test('calculates positive percentage increase correctly', () => {
      const result = calculatePercentageChange(110, 100);
      expect(result).toBeCloseTo(10.0, 2);
    });

    test('calculates negative percentage decrease correctly', () => {
      const result = calculatePercentageChange(85, 100);
      expect(result).toBeCloseTo(-15.0, 2);
    });

    test('handles zero denominator without throwing division by zero', () => {
      const result = calculatePercentageChange(500, 0);
      expect(result).toBeNull();
    });

    test('handles null and undefined baseline safely', () => {
      expect(calculatePercentageChange(500, null)).toBeNull();
      expect(calculatePercentageChange(500, undefined)).toBeNull();
    });

    test('handles negative baseline correctly with absolute difference', () => {
      const result = calculatePercentageChange(-50, -100);
      expect(result).toBeCloseTo(50.0, 2);
    });
  });

  describe('Statistical Anomaly Detection (2-Sigma)', () => {
    test('flags values exceeding mean + 2*stdDev and calculates z-score', () => {
      const data = [10, 12, 11, 10, 13, 9, 11, 10, 12, 11, 50]; // 50 is outlier
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const stdDev = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length);
      const threshold = mean + 2 * stdDev;

      const outliers = data.filter((v) => v > threshold);
      expect(outliers).toEqual([50]);

      const zScore = (50 - mean) / stdDev;
      expect(zScore).toBeGreaterThan(2.0);
    });

    test('computes exact delta amount and percentage above mean', () => {
      const mean = 40000;
      const amount = 80000;
      const deltaAmount = amount - mean;
      const deltaPct = ((amount - mean) / mean) * 100;

      expect(deltaAmount).toBe(40000);
      expect(deltaPct).toBe(100.0);
    });
  });

  describe('Fiscal Cumulative Calculation', () => {
    test('calculates running cumulative sum starting from month 10 (October)', () => {
      const monthlyAmounts = [
        { month: 10, amount: 40000 },
        { month: 11, amount: 30000 },
        { month: 12, amount: 25000 },
        { month: 1, amount: 28000 },
      ];

      let running = 0;
      const cumulative = monthlyAmounts.map((m) => {
        running += m.amount;
        return { month: m.month, cumulative: running };
      });

      expect(cumulative[0].cumulative).toBe(40000);
      expect(cumulative[1].cumulative).toBe(70000);
      expect(cumulative[2].cumulative).toBe(95000);
      expect(cumulative[3].cumulative).toBe(123000);
    });
  });

  describe('Year-over-Year Month-by-Month Matching & Extreme Detection', () => {
    test('calculates month differences and detects max increase and decrease', () => {
      const primaryYear = [
        { month: 10, amount: 43301.33 },
        { month: 11, amount: 34105.66 },
        { month: 7, amount: 49344.49 },
      ];
      const benchmarkYear = [
        { month: 10, amount: 50731.79 },
        { month: 11, amount: 52856.87 },
        { month: 7, amount: 42001.76 },
      ];

      const diffs = primaryYear.map((p) => {
        const b = benchmarkYear.find((x) => x.month === p.month)!;
        const diff = p.amount - b.amount;
        const pct = calculatePercentageChange(p.amount, b.amount)!;
        return { month: p.month, diff, pct };
      });

      // Month 11 (Nov) decreased by 18,751.21 (-35.5%)
      const novDiff = diffs.find((d) => d.month === 11)!;
      expect(novDiff.diff).toBeCloseTo(-18751.21, 2);
      expect(novDiff.pct).toBeCloseTo(-35.48, 2);

      // Month 7 (Jul) increased by 7,342.73 (+17.5%)
      const julDiff = diffs.find((d) => d.month === 7)!;
      expect(julDiff.diff).toBeCloseTo(7342.73, 2);
      expect(julDiff.pct).toBeCloseTo(17.48, 2);

      const maxInc = [...diffs].sort((a, b) => b.diff - a.diff)[0];
      const maxDec = [...diffs].sort((a, b) => a.diff - b.diff)[0];

      expect(maxInc.month).toBe(7);
      expect(maxDec.month).toBe(11);
    });
  });

  describe('Trend Direction Classification Logic', () => {
    function classifyTrend(momRate: number | null, yoyRate: number | null): string {
      if (momRate === null || yoyRate === null) return 'unknown';
      if (momRate < -1 && yoyRate < -1) return 'decreasing';
      if (momRate > 1 && yoyRate > 1) return 'increasing';
      if (Math.abs(momRate) <= 1 && Math.abs(yoyRate) <= 1) return 'stable';
      return 'mixed';
    }

    test('correctly identifies decreasing trend when both MoM and YoY decline', () => {
      expect(classifyTrend(-14.45, -5.94)).toBe('decreasing');
    });

    test('correctly identifies increasing trend when both MoM and YoY grow', () => {
      expect(classifyTrend(5.2, 8.4)).toBe('increasing');
    });

    test('correctly identifies stable trend when variance is within 1%', () => {
      expect(classifyTrend(0.4, -0.6)).toBe('stable');
    });

    test('identifies mixed trend when MoM and YoY disagree', () => {
      expect(classifyTrend(-5.0, 10.0)).toBe('mixed');
      expect(classifyTrend(8.0, -3.0)).toBe('mixed');
    });
  });

  describe('Full System UTF-8 Support & BOM Handling', () => {
    test('generateCsvString prepends UTF-8 BOM (\\uFEFF) and preserves Thai characters', () => {
      const mockRecord: ElectricityRecord = {
        id: 1,
        yearBe: 2568,
        yearCe: 2025,
        month: 1,
        amount: '45000.50',
        note: 'ทดสอบภาษาไทย สำนักงานเขตสุขภาพที่ ๗',
        createdAt: new Date('2025-01-15T00:00:00Z'),
        updatedAt: new Date('2025-01-15T00:00:00Z'),
      };

      const csv = generateCsvString([mockRecord]);
      // First character must be UTF-8 BOM
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      // Contains Thai headers and content without character corruption
      expect(csv).toContain('ปี พ.ศ. (ปฏิทิน)');
      expect(csv).toContain('ทดสอบภาษาไทย สำนักงานเขตสุขภาพที่ ๗');
      expect(csv).toContain('ม.ค.');
    });

    test('parseExcelBuffer safely strips UTF-8 BOM from CSV buffer and parses Thai notes', () => {
      const csvWithBom =
        '\uFEFF"ปี พ.ศ.","เดือน","ยอดเงิน","หมายเหตุ"\r\n' +
        '2568,1,50000.00,"บันทึกค่าไฟ ม.ค. ทดสอบภาษาไทย"\r\n' +
        '2568,2,48000.00,"บันทึกค่าไฟ ก.พ."';

      const buffer = Buffer.from(csvWithBom, 'utf-8');
      const parsed = parseExcelBuffer(buffer);

      expect(parsed.length).toBe(2);
      expect(parsed[0].yearBe).toBe(2568);
      expect(parsed[0].month).toBe(1);
      expect(parsed[0].amount).toBe(50000);
      expect(parsed[0].note).toBe('บันทึกค่าไฟ ม.ค. ทดสอบภาษาไทย');
    });
  });
});
