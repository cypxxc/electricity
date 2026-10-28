'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, ActionResult } from '@/lib/auth/actions';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

const initialState: ActionResult = { success: false };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            กลับสู่หน้าแดชบอร์ด
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              เข้าสู่ระบบผู้ดูแล (Admin)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7
          </p>
        </div>

        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              ชื่อผู้ใช้ (Username)
            </label>
            <input
              type="text"
              name="username"
              required
              autoFocus
              defaultValue="admin"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              name="password"
              required
              defaultValue="adminpassword123"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            บัญชีเริ่มต้นสำหรับทดสอบ: <span className="font-mono text-slate-600">admin</span> / <span className="font-mono text-slate-600">adminpassword123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
