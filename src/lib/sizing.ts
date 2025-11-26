import { SizingAnalysis, OCRResult } from './types';
import { predictClickableRegions } from './keyboard';

/**
 * Analyze sizing and implementation feasibility
 */
export function analyzeSizing(ocrResult: OCRResult): SizingAnalysis {
  const clickableRegions = predictClickableRegions(ocrResult);
  const problemAreas: string[] = [];

  // Check click target sizes (minimum 44x44px)
  const clickTargets = clickableRegions.map((region) => {
    const width = region.bbox.x1 - region.bbox.x0;
    const height = region.bbox.y1 - region.bbox.y0;
    const size = Math.min(width, height);
    const meets44px = size >= 44;

    if (!meets44px) {
      problemAreas.push(`"${region.element}" is too small (${Math.round(size)}px)`);
    }

    return {
      size: Math.round(size),
      meets44px,
      element: region.element,
    };
  });

  // Check font sizes (minimum 16px for body text)
  const fontSizes = ocrResult.words.map((word) => {
    const height = word.bbox.y1 - word.bbox.y0;
    const approximateSize = Math.round(height * 0.7);
    const acceptable = approximateSize >= 14; // Allow 14px minimum

    if (!acceptable) {
      problemAreas.push(`Text "${word.text}" is too small (≈${approximateSize}px)`);
    }

    return {
      size: approximateSize,
      acceptable,
      element: word.text,
    };
  });

  // Check padding (simplified heuristic)
  const paddingIssues: string[] = [];
  const avgGap =
    ocrResult.words.reduce((sum, word, idx) => {
      if (idx === 0) return 0;
      const prevWord = ocrResult.words[idx - 1];
      return sum + (word.bbox.x0 - prevWord.bbox.x1);
    }, 0) / Math.max(ocrResult.words.length - 1, 1);

  if (avgGap < 8) {
    paddingIssues.push('Horizontal spacing between elements is too tight');
  }

  // Determine feasibility
  const criticalIssues = clickTargets.filter((t) => !t.meets44px).length;
  const feasibility: 'Possible' | 'Needs Adjustments' =
    criticalIssues === 0 && problemAreas.length < 3 ? 'Possible' : 'Needs Adjustments';

  return {
    clickTargets,
    fontSizes,
    paddingIssues,
    feasibility,
    problemAreas: problemAreas.slice(0, 10), // Limit to top 10
  };
}
