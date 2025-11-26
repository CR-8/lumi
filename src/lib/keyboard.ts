import { KeyboardAnalysis, OCRResult } from './types';

/**
 * Predict clickable regions based on OCR bounding boxes
 */
export function predictClickableRegions(ocrResult: OCRResult): { element: string; bbox: any }[] {
  const clickableKeywords = [
    'button',
    'submit',
    'login',
    'sign',
    'click',
    'download',
    'more',
    'get',
    'start',
    'buy',
    'cart',
    'checkout',
  ];

  return ocrResult.words
    .filter((word) => {
      const text = word.text.toLowerCase();
      return clickableKeywords.some((keyword) => text.includes(keyword));
    })
    .map((word, idx) => ({
      element: word.text,
      bbox: word.bbox,
    }));
}

/**
 * Simulate tab order based on visual position
 */
export function simulateTabOrder(regions: { element: string; bbox: any }[]): { element: string; tabIndex: number }[] {
  // Sort by vertical position first, then horizontal
  const sorted = [...regions].sort((a, b) => {
    const verticalDiff = a.bbox.y0 - b.bbox.y0;
    if (Math.abs(verticalDiff) > 50) return verticalDiff;
    return a.bbox.x0 - b.bbox.x0;
  });

  return sorted.map((region, idx) => ({
    element: region.element,
    tabIndex: idx + 1,
  }));
}

/**
 * Detect missing focus states
 */
export function detectMissingFocusStates(regions: { element: string; bbox: any }[]): string[] {
  // In a real implementation, this would analyze CSS or visual indicators
  // For MVP, return a mock check
  return regions.length > 5 ? ['Focus indicators not detected on some interactive elements'] : [];
}

/**
 * Generate keyboard accessibility analysis
 */
export function analyzeKeyboardAccessibility(ocrResult: OCRResult): KeyboardAnalysis {
  const clickableRegions = predictClickableRegions(ocrResult);
  const focusOrder = simulateTabOrder(clickableRegions);
  const missingLabels = detectMissingFocusStates(clickableRegions);

  const interactiveElements = clickableRegions.map((region) => ({
    element: region.element,
    accessible: true, // MVP: assume accessible if detected
  }));

  const passOrWarn: 'pass' | 'warn' =
    missingLabels.length === 0 && focusOrder.length > 0 ? 'pass' : 'warn';

  return {
    focusOrder,
    focusVisibility: missingLabels.length === 0,
    interactiveElements,
    missingLabels,
    passOrWarn,
  };
}
