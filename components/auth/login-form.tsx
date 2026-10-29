'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAction, ActionResult } from '@/lib/auth/actions';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const initialState: ActionResult = { success: false };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleFillDemoCredentials() {
    setUsername('admin');
    setPassword('adminpassword123');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-xs shadow-xs p-7">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            กลับสู่หน้าแดชบอร์ดภาพรวม
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/logo.png"
              alt="สำนักงานเขตสุขภาพที่ 7 กระทรวงสาธารณสุข"
              width={140}
              height={42}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              เข้าสู่ระบบผู้ดูแลข้อมูล (Admin)
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7
            </p>
          </div>
        </div>

        {state?.error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              name="username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors"
              placeholder="กรอกชื่อผู้ใช้ เช่น admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex justify-center items-center py-2 px-4 rounded-xs text-xs font-semibold text-white bg-[#0f2744] hover:bg-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#0f2744] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-teal-400" />
                  กำลังตรวจสอบสิทธิ์...
                </>
              ) : (
                'เข้าสู่ระบบตรวจสอบและจัดการ'
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <KeyRound className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="text-[11px] font-mono">บัญชีทดสอบ: admin</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] text-teal-800 hover:text-teal-950 font-medium underline cursor-pointer"
            >
              กรอกอัตโนมัติ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
