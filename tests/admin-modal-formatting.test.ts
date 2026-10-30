import { describe, it, expect } from 'bun:test';

export function formatCurrencyPreview(amountStr: string): { formatted: string; isValid: boolean; warning?: string } {
  if (!amountStr || amountStr.trim() === '') {
    return { formatted: '', isValid: false };
  }
  const val = parseFloat(amountStr);
  if (isNaN(val)) {
    return { formatted: 'รูปแบบตัวเลขไม่ถูกต้อง', isValid: false, warning: 'กรุณากรอกเฉพาะตัวเลข' };
  }
  if (val < 0) {
    return { formatted: 'ยอดเงินไม่สามารถติดลบได้', isValid: false, warning: 'ยอดค่าไฟฟ้าต้องเป็นค่าบวก' };
  }
  const formatted = `฿${val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
  let warning: string | undefined;
  if (val > 1_000_000) {
    warning = 'คำเตือน: ยอดเงินสูงกว่า 1 ล้านบาท กรุณาตรวจสอบความถูกต้อง';
  } else if (val === 0) {
    warning = 'ข้อสังเกต: ยอดค่าไฟฟ้าเป็น 0.00 บาท';
  }
  return { formatted, isValid: true, warning };
}

describe('Currency Input Preview Formatter', () => {
  it('formats standard valid currency with commas and decimals', () => {
    const res = formatCurrencyPreview('45200.75');
    expect(res.isValid).toBe(true);
    expect(res.formatted).toBe('฿45,200.75 บาท');
    expect(res.warning).toBeUndefined();
  });

  it('formats large numbers with proper thousands separators', () => {
    const res = formatCurrencyPreview('250000');
    expect(res.isValid).toBe(true);
    expect(res.formatted).toBe('฿250,000.00 บาท');
  });

  it('detects negative numbers and marks invalid', () => {
    const res = formatCurrencyPreview('-500');
    expect(res.isValid).toBe(false);
    expect(res.warning).toContain('ยอดค่าไฟฟ้าต้องเป็นค่าบวก');
  });

  it('warns on zero amounts', () => {
    const res = formatCurrencyPreview('0');
    expect(res.isValid).toBe(true);
    expect(res.warning).toContain('ยอดค่าไฟฟ้าเป็น 0.00 บาท');
  });

  it('warns on abnormally high amounts (> 1 million)', () => {
    const res = formatCurrencyPreview('1500000');
    expect(res.isValid).toBe(true);
    expect(res.warning).toContain('สูงกว่า 1 ล้านบาท');
  });

  it('handles empty input gracefully', () => {
    const res = formatCurrencyPreview('');
    expect(res.isValid).toBe(false);
    expect(res.formatted).toBe('');
  });
});
