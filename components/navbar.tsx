'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, Shield, LogOut, LogIn, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xs">
      <div className="w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs transition-transform group-hover:scale-105">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none">
                  สำนักงานเขตสุขภาพที่ 7
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                  ระบบติดตามและวิเคราะห์ค่าไฟฟ้า
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isDashboard
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              แดชบอร์ดวิเคราะห์
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isAdmin
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              จัดการข้อมูล (Admin)
            </Link>
          </nav>

          {/* User / Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-900 leading-none">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase leading-tight mt-0.5">
                    {user.role}
                  </span>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    title="ออกจากระบบ"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shadow-2xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                เข้าสู่ระบบ Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-3 space-y-1.5">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md ${
              isDashboard ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            แดชบอร์ดวิเคราะห์
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md ${
              isAdmin ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            จัดการข้อมูล (Admin)
          </Link>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
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
                className="w-full text-center py-1.5 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
