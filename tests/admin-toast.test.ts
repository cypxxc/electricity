import { describe, it, expect } from 'bun:test';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  timestamp: number;
}

export function createToast(
  type: 'success' | 'error' | 'info',
  title: string,
  description?: string
): ToastMessage {
  return {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    description,
    timestamp: Date.now(),
  };
}

describe('Toast Notification Data Structure', () => {
  it('creates success toast with unique id and timestamp', () => {
    const toast = createToast('success', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'ประจำงวดเดือน มกราคม 2568');
    expect(toast.type).toBe('success');
    expect(toast.title).toBe('บันทึกข้อมูลเรียบร้อยแล้ว');
    expect(toast.description).toBe('ประจำงวดเดือน มกราคม 2568');
    expect(toast.id).toContain('toast-');
    expect(toast.timestamp).toBeGreaterThan(0);
  });

  it('creates error toast without description', () => {
    const toast = createToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    expect(toast.type).toBe('error');
    expect(toast.title).toBe('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    expect(toast.description).toBeUndefined();
  });
});
