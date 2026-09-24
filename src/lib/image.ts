import sharp from 'sharp';
import tinycolor from 'tinycolor2';
import type { ImageMetrics } from './types';

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

/**
 * Deterministic pixel measurements: same image in, same numbers out.
 */
export async function measureImage(png: Buffer): Promise<ImageMetrics> {
  const { width = 0, height = 0 } = await sharp(png).metadata();

  // Luminance on a small copy: whitespace and edge density
  const grey = await sharp(png).resize(240, 240, { fit: 'inside' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = grey.info;
  const lum = (x: number, y: number) => grey.data[(y * w + x) * channels];
  const histogram = new Array(64).fill(0);
  for (let i = 0; i < w * h; i++) histogram[grey.data[i * channels] >> 2]++;
  const background = histogram.indexOf(Math.max(...histogram));
  let quiet = 0;
  let edges = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = lum(x, y);
      if (Math.abs((v >> 2) - background) <= 1) quiet++;
      // ponytail: fixed gradient threshold of 40/255; tune if screenshots are heavily compressed
      if (x < w - 1 && y < h - 1 && Math.abs(v - lum(x + 1, y)) + Math.abs(v - lum(x, y + 1)) > 40) edges++;
    }
  }

  // Significant colors on a 120px copy, quantized to 16 levels per channel
  const rgb = await sharp(png).resize(120, 120, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const counts = new Map<string, number>();
  const total = rgb.info.width * rgb.info.height;
  for (let i = 0; i < total; i++) {
    const [r, g, b] = [0, 1, 2].map((c) => Math.min(255, Math.round(rgb.data[i * 3 + c] / 17) * 17));
    const hex = tinycolor({ r, g, b }).toHexString();
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  const significant = [...counts.entries()]
    .filter(([, n]) => n / total >= 0.005)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const dominant = significant[0]?.[0] ?? '#ffffff';

  return {
    width,
    height,
    whitespace: quiet / (w * h),
    edgeDensity: edges / ((w - 1) * (h - 1)),
    colorCount: significant.length,
    dominant,
    paletteContrast: significant.slice(1, 9).map(([color, n]) => ({
      color,
      share: n / total,
      ratio: Math.round(tinycolor.readability(color, dominant) * 100) / 100,
    })),
  };
}
