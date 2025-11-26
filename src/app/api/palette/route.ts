import { NextRequest, NextResponse } from 'next/server';
import { extractPalette } from '@/lib/palette';
import { processImage } from '@/lib/image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image
    const processed = await processImage(buffer);

    // Extract palette
    const palette = await extractPalette(processed.buffer);

    return NextResponse.json({
      success: true,
      palette: palette.palette,
      dominant: palette.dominant,
      accents: palette.accents,
    });
  } catch (error) {
    console.error('Palette extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract color palette' },
      { status: 500 }
    );
  }
}
