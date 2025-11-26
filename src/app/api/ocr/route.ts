import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract text using Tesseract.js
    const ocrResult = await extractText(imageUrl);

    return NextResponse.json({
      success: true,
      text: ocrResult.text,
      words: ocrResult.words,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    );
  }
}
