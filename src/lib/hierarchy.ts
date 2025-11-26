import { HierarchyAnalysis, OCRResult } from './types';

/**
 * Analyze information hierarchy from OCR results
 */
export function analyzeHierarchy(ocrResult: OCRResult, imageDimensions: { width: number; height: number }): HierarchyAnalysis {
  const words = ocrResult.words;

  // Calculate text sizes
  const textSizes = words.map((word) => ({
    text: word.text,
    size: word.bbox.y1 - word.bbox.y0,
    position: word.bbox,
  }));

  // Sort by size to identify heading candidates
  const sortedBySizes = [...textSizes].sort((a, b) => b.size - a.size);

  // Detect issues
  const dominantElements: string[] = [];
  const missingHeadings: string[] = [];
  const poorGrouping: string[] = [];

  // Check for overly large elements
  if (sortedBySizes.length > 0 && sortedBySizes[0].size > imageDimensions.height * 0.2) {
    dominantElements.push(`"${sortedBySizes[0].text}" is too dominant (${sortedBySizes[0].size}px)`);
  }

  // Check for heading patterns
  const hasLargeText = sortedBySizes.some((t) => t.size > 30);
  const hasMediumText = sortedBySizes.some((t) => t.size > 20 && t.size <= 30);
  const hasSmallText = sortedBySizes.some((t) => t.size <= 20);

  if (!hasLargeText) {
    missingHeadings.push('No large heading detected');
  }

  if (hasLargeText && hasSmallText && !hasMediumText) {
    poorGrouping.push('Missing intermediate text size (subheadings)');
  }

  // Check spacing/grouping (simplified)
  const verticalGaps: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].bbox.y0 - words[i - 1].bbox.y1;
    if (gap > 0) verticalGaps.push(gap);
  }

  const avgGap = verticalGaps.reduce((a, b) => a + b, 0) / verticalGaps.length || 0;
  if (avgGap < 10) {
    poorGrouping.push('Text elements too tightly spaced');
  }

  // Calculate priority score
  let score = 100;
  score -= dominantElements.length * 15;
  score -= missingHeadings.length * 20;
  score -= poorGrouping.length * 10;
  score = Math.max(0, Math.min(100, score));

  // Generate suggestions
  const suggestions: string[] = [];
  if (dominantElements.length > 0) {
    suggestions.push('Reduce size of overly dominant elements');
  }
  if (missingHeadings.length > 0) {
    suggestions.push('Add clear heading hierarchy (H1, H2, H3)');
  }
  if (poorGrouping.length > 0) {
    suggestions.push('Improve spacing between content groups');
  }

  return {
    priorityScore: score,
    issues: {
      dominantElements,
      missingHeadings,
      poorGrouping,
    },
    suggestions,
  };
}
