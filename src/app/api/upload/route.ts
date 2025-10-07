// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Import with proper typing
    const pdfParseModule = await import('pdf-parse-fork');
    const pdfParse = pdfParseModule.default;

    // Extract text from PDF
    const data = await pdfParse(buffer, {
      max: 0, // Parse all pages
    });

    const extractedText = data.text;
    const numPages = data.numpages;

    console.log(`Extracted ${extractedText.length} characters from PDF`);
    console.log(`Total pages: ${numPages}`);

    // Return extracted text and metadata
    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        pages: numPages,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error: any) {
    console.error('PDF processing error:', error);
    console.error('Error message:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process PDF',
      },
      { status: 500 }
    );
  }
}
