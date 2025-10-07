// src/app/api/report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  generateStructuredReport,
  generateStructuredReportFromLargePDF,
} from '@/app/api/reportProcessor';

export async function POST(req: NextRequest) {
  try {
    const { notes, officerName, incidentType, isLargeDocument } = await req.json();

    // Validate required fields
    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { success: false, error: 'Notes are required' },
        { status: 400 }
      );
    }

    if (!officerName) {
      return NextResponse.json(
        { success: false, error: 'Officer name is required' },
        { status: 400 }
      );
    }

    console.log(`Generating report for officer: ${officerName}`);
    console.log(`Is large document: ${isLargeDocument}`);

    let structuredReport;

    if (isLargeDocument) {
      // Use Map-Reduce for large documents (50+ pages)
      console.log('Processing large document with Map-Reduce strategy...');
      structuredReport = await generateStructuredReportFromLargePDF(
        notes,
        officerName,
        incidentType
      );
    } else {
      // Standard processing for smaller documents
      console.log('Processing with standard method...');
      structuredReport = await generateStructuredReport(
        notes,
        officerName,
        incidentType
      );
    }

    console.log('Report generation successful');

    return NextResponse.json({
      success: true,
      report: structuredReport,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}
