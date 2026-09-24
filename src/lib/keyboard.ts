import { KeyboardAnalysis, OCRResult } from "./types";

type Region = { element: string; bbox: OCRResult["words"][number]["bbox"] };

/**
 * Predict clickable regions (mock implementation without OCR)
 */
export function predictClickableRegions(): Region[] {
  // Return empty array since OCR is removed
  return [];
}

/**
 * Simulate tab order based on visual position
 */
export function simulateTabOrder(
  regions: Region[]
): { element: string; tabIndex: number }[] {
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
export function detectMissingFocusStates(
  regions: Region[]
): string[] {
  // In a real implementation, this would analyze CSS or visual indicators
  // For MVP, return a mock check
  return regions.length > 5
    ? ["Focus indicators not detected on some interactive elements"]
    : [];
}

/**
 * Generate keyboard accessibility analysis
 */
export function analyzeKeyboardAccessibility(): KeyboardAnalysis {
  const clickableRegions = predictClickableRegions();
  const focusOrder = simulateTabOrder(clickableRegions);
  const missingLabels = detectMissingFocusStates(clickableRegions);

  const interactiveElements = clickableRegions.map((region) => ({
    element: region.element,
    accessible: true, // MVP: assume accessible if detected
  }));

  const passOrWarn: "pass" | "warn" =
    missingLabels.length === 0 && focusOrder.length > 0 ? "pass" : "warn";

  return {
    focusOrder,
    focusVisibility: missingLabels.length === 0,
    interactiveElements,
    missingLabels,
    passOrWarn,
  };
}
