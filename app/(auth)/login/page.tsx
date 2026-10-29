import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'เข้าสู่ระบบผู้ดูแลข้อมูล (Admin) | สำนักงานเขตสุขภาพที่ 7',
  description: 'เข้าสู่ระบบเพื่อจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7',
};

export default async function LoginPage() {
  const session = await getSession();

  // If already authenticated with valid session cookie, redirect straight to admin panel
  if (session) {
    redirect('/admin');
  }

  return <LoginForm />;
}
