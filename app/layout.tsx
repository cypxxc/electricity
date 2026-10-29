import type { Metadata } from "next";
import { Geist, Geist_Mono, Sarabun } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า | สำนักงานเขตสุขภาพที่ 7",
  description: "แดชบอร์ดสรุปค่าไฟฟ้าและระบบจัดการข้อมูลค่าไฟฟ้ารายเดือนและรายปี อาคารสำนักงานเขตสุขภาพที่ 7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${sarabun.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
