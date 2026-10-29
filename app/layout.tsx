import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า | สำนักงานเขตสุขภาพที่ 7",
  description: "แดชบอร์ดสรุปค่าไฟฟ้าและระบบจัดการข้อมูลค่าไฟฟ้ารายเดือนและรายปี อาคารสำนักงานเขตสุขภาพที่ 7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
