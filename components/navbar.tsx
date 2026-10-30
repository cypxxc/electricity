'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart3, Database, LogOut, LogIn, Menu, X, User } from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

interface NavbarProps {
  user?: {
    username: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-navy text-white border-b border-brand-navy-light shadow-md print:hidden">
      {/* Top Organization Band */}
      <div className="w-full border-b border-white/10 bg-brand-navy-dark text-[11px] text-slate-300 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1640px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium tracking-tight">กระทรวงสาธารณสุข &bull; สำนักงานเขตสุขภาพที่ 7</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-300 font-mono">
            <span>ฐานข้อมูลค่าไฟฟ้าอาคารสำนักงาน</span>
            <span className="hidden md:inline text-teal-300 bg-teal-950/80 px-1.5 py-0.2 border border-teal-700/50 rounded-xs">
              สถานะ: ออนไลน์
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* System Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 focus:outline-none group">
              <Image
                src="/logo.png"
                alt="สำนักงานเขตสุขภาพที่ 7 กระทรวงสาธารณสุข"
                width={126}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                priority
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                  ระบบสารสนเทศวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า
                </span>
                <span className="text-[10.5px] text-slate-300 tracking-tight leading-tight">
                  Utility Electricity Expenditure Analytics System
                </span>
              </div>
            </Link>
          </div>

          {/* Institutional Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors ${
                isDashboard
                  ? 'bg-white/10 text-white border-white/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
              แดชบอร์ดภาพรวม
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors ${
                isAdmin
                  ? 'bg-white/10 text-white border-white/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-teal-400" />
              จัดการฐานข้อมูล (Admin)
            </Link>
          </nav>

          {/* User Status & Admin Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xs bg-brand-navy-surface border border-white/20 flex items-center justify-center text-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11.5px] font-medium text-white leading-none">
                      {user.username}
                    </span>
                    <span className="text-[9.5px] text-teal-300 uppercase tracking-wider font-semibold leading-tight mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    className="inline-flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-white hover:bg-red-950/60 hover:border-red-800/80 rounded-xs border border-transparent text-xs transition-colors ml-1"
                  >
                    <LogOut className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px]">ออก</span>
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-brand-navy-surface hover:bg-brand-navy-hover hover:text-white rounded-xs border border-white/20 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-teal-400" />
                เข้าสู่ระบบเจ้าหน้าที่
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xs focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-navy-dark px-4 pt-2.5 pb-3 space-y-1.5 text-xs">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xs border ${
              isDashboard ? 'bg-white/10 text-white border-white/20 font-semibold' : 'text-slate-300 border-transparent hover:bg-white/5'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-teal-400" />
            แดชบอร์ดภาพรวม
          </Link>

          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xs border ${
              isAdmin ? 'bg-white/10 text-white border-white/20 font-semibold' : 'text-slate-300 border-transparent hover:bg-white/5'
            }`}
          >
            <Database className="h-4 w-4 text-teal-400" />
            จัดการฐานข้อมูล (Admin)
          </Link>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">{user.username}</span>
                  <span className="text-[10px] text-teal-300 font-medium">สิทธิ์: {user.role}</span>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 font-medium px-2 py-1 rounded-xs border border-rose-900/40 bg-rose-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    ออกจากระบบ
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-1.5 px-3 text-xs font-medium text-white bg-teal-700 rounded-xs hover:bg-teal-600 border border-teal-600"
              >
                เข้าสู่ระบบเจ้าหน้าที่
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
