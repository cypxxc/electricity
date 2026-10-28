import { z } from 'zod';

export const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const THAI_MONTH_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

export const recordInputSchema = z.object({
  yearBe: z.coerce.number().int().min(2500, 'ปี พ.ศ. ต้องไม่น้อยกว่า 2500').max(2650, 'ปี พ.ศ. ต้องไม่เกิน 2650'),
  month: z.coerce.number().int().min(1, 'เดือนต้องอยู่ระหว่าง 1-12').max(12, 'เดือนต้องอยู่ระหว่าง 1-12'),
  amount: z.coerce.number().positive('ยอดค่าไฟฟ้าต้องมากกว่า 0 บาท'),
  note: z.string().max(255, 'หมายเหตุต้องไม่เกิน 255 ตัวอักษร').optional().nullable(),
});

export type RecordInput = z.infer<typeof recordInputSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export type LoginInput = z.infer<typeof loginSchema>;
