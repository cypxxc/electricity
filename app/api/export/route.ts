import { NextRequest, NextResponse } from 'next/server';
import { getAllRecordsForExport } from '@/lib/services/records';
import { generateExcelWorkbook, generateCsvString } from '@/lib/services/excel';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const format = searchParams.get('format') || 'xlsx';
  const yearParam = searchParams.get('yearBe');
  const yearBe = yearParam ? parseInt(yearParam, 10) : undefined;

  try {
    const records = await getAllRecordsForExport(yearBe);

    const timestamp = new Date().toISOString().split('T')[0];
    const filenameBase = yearBe
      ? `electricity_summary_${yearBe}_${timestamp}`
      : `electricity_summary_all_${timestamp}`;

    if (format === 'csv') {
      const csvData = generateCsvString(records);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    // Default: xlsx
    const buffer = generateExcelWorkbook(records);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'ไม่สามารถสร้างไฟล์ส่งออกได้' }, { status: 500 });
  }
}
