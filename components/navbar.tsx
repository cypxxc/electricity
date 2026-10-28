'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, Shield, LogOut, LogIn, Menu, X, Activity } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-all group-hover:bg-blue-700 group-hover:scale-105">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                    สำนักงานเขตสุขภาพที่ 7
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ระบบติดตามค่าไฟฟ้า
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium leading-tight mt-1">
                  Electricity Cost Analytics & Management System (2562 - 2569)
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                isDashboard
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              แดชบอร์ดภาพรวม
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                isAdmin
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Shield className="h-4 w-4" />
              จัดการข้อมูล (Admin)
            </Link>
          </nav>

          {/* Right Action / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 border-r border-slate-200 pr-4">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>PostgreSQL Live</span>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-none">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium uppercase leading-tight mt-0.5">
                    ผู้ดูแลระบบ ({user.role})
                  </span>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-md border border-slate-300 transition-all shadow-2xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                เข้าสู่ระบบ Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
              isDashboard ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            แดชบอร์ดภาพรวม
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
              isAdmin ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            จัดการข้อมูล (Admin)
          </Link>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">{user.username}</span>
                  <span className="text-[10px] text-blue-600 font-medium">สิทธิ์: {user.role}</span>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
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
                className="w-full text-center py-2 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-xs"
              >
                เข้าสู่ระบบ Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
