import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Process an uploaded image with Sharp:
 * - Resize to max 2000px
 * - Convert to PNG
 * - Apply light denoising
 */
export async function processImage(inputBuffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  // Resize if larger than 2000px
  const maxDimension = 2000;
  const needsResize =
    (metadata.width && metadata.width > maxDimension) ||
    (metadata.height && metadata.height > maxDimension);

  let pipeline = image.clone();

  if (needsResize) {
    pipeline = pipeline.resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to PNG with light processing
  const buffer = await pipeline
    .png({ quality: 90 })
    .median(1) // Light denoising
    .toBuffer();

  const processedMetadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: processedMetadata.width || 0,
    height: processedMetadata.height || 0,
    format: 'png',
  };
}

/**
 * Convert buffer to base64 data URL for OCR/analysis
 */
export function bufferToDataURL(buffer: Buffer, format = 'png'): string {
  const base64 = buffer.toString('base64');
  return `data:image/${format};base64,${base64}`;
}

/**
 * Extract image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
