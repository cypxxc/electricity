import { generateCsvString } from '../lib/services/excel';
import { ElectricityRecord } from '../lib/db/schema';

console.log('=== 1. TESTING CSV FORMULA INJECTION SANITIZATION ===');
const mockRecords: ElectricityRecord[] = [
  {
    id: 1,
    yearBe: 2569,
    yearCe: 2026,
    month: 1,
    amount: '40000.00',
    note: '=cmd|\' /C calc\'!A0', // Formula trigger (=)
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    yearBe: 2569,
    yearCe: 2026,
    month: 2,
    amount: '42000.00',
    note: '+SUM(1,2)', // Formula trigger (+)
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    yearBe: 2569,
    yearCe: 2026,
    month: 3,
    amount: '38000.00',
    note: '@SpecialNotice', // Formula trigger (@)
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    yearBe: 2569,
    yearCe: 2026,
    month: 4,
    amount: '41000.00',
    note: 'Safe note with "quotes"', // Normal note
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const csvOutput = generateCsvString(mockRecords);
console.log('Generated CSV:\n', csvOutput);

const lines = csvOutput.split('\n');
const row1 = lines[1];
const row2 = lines[2];
const row3 = lines[3];
const row4 = lines[4];

console.log('Row 1 neutralized (=):', row1.includes("\"'=cmd|' /C calc'!A0\""));
console.log('Row 2 neutralized (+):', row2.includes("\"'+SUM(1,2)\""));
console.log('Row 3 neutralized (@):', row3.includes("\"'@SpecialNotice\""));
console.log('Row 4 safe with escaped quotes:', row4.includes("\"Safe note with \"\"quotes\"\"\""));

if (
  row1.includes("\"'=cmd|' /C calc'!A0\"") &&
  row2.includes("\"'+SUM(1,2)\"") &&
  row3.includes("\"'@SpecialNotice\"")
) {
  console.log('✅ ALL CSV FORMULA INJECTION TESTS PASSED!');
} else {
  console.error('❌ CSV FORMULA INJECTION MITIGATION FAILED!');
}
