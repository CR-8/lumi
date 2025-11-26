import sharp from 'sharp';
import { PaletteResult } from './types';

/**
 * Extract color palette from image buffer
 * Uses pixel sampling approach for server-side extraction
 */
export async function extractPalette(buffer: Buffer): Promise<PaletteResult> {
  try {
    // Resize to small size for faster processing
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sample colors and find dominant ones
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4 * 10) { // Sample every 10th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Quantize colors to reduce variations (group similar colors)
      const quantizedR = Math.round(r / 32) * 32;
      const quantizedG = Math.round(g / 32) * 32;
      const quantizedB = Math.round(b / 32) * 32;
      
      const hex = rgbToHex(quantizedR, quantizedG, quantizedB);
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    // Sort by frequency and get top 6 colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([color]) => color);

    // Ensure we have at least some colors
    const palette = sortedColors.length > 0 ? sortedColors : [
      '#2563eb',
      '#7c3aed',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#64748b',
    ];

    return {
      palette,
      dominant: palette[0],
      accents: palette.slice(1, 4),
    };
  } catch (error) {
    console.error('Color extraction error:', error);
    // Fallback palette
    const fallbackPalette = [
      '#2563eb',
      '#7c3aed',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#64748b',
    ];
    
    return {
      palette: fallbackPalette,
      dominant: fallbackPalette[0],
      accents: fallbackPalette.slice(1, 4),
    };
  }
}

/**
 * Get dominant color from palette
 */
export function getDominantColor(palette: string[]): string {
  return palette[0] || '#000000';
}

/**
 * Get accent colors (top 3 after dominant)
 */
export function getAccentColors(palette: string[]): string[] {
  return palette.slice(1, 4);
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
