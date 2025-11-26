import { extractTextWithGemini } from './gemini';
import { OCRResult } from './types';

/**
 * Extract text and bounding boxes from image using Google Gemini Vision
 * Replaces Tesseract.js for more reliable text extraction
 */
export async function extractText(imageSource: string | Buffer): Promise<OCRResult> {
  try {
    // Convert string path to buffer if needed
    let imageBuffer: Buffer;
    if (typeof imageSource === 'string') {
      const fs = await import('fs');
      imageBuffer = await fs.promises.readFile(imageSource);
    } else {
      imageBuffer = imageSource;
    }

    return await extractTextWithGemini(imageBuffer);
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      text: '',
      words: [],
    };
  }
}

/**
 * Approximate font sizes from bounding box heights
 */
export function approximateFontSizes(words: OCRResult['words']): number[] {
  return words.map((word) => {
    const height = word.bbox.y1 - word.bbox.y0;
    // Approximate: font size is roughly 70% of bbox height
    return Math.round(height * 0.7);
  });
}
